import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// MUI Icons
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// Components
import AdminMetricCard from "../../components/admin/dashboard/AdminMetricCard.jsx";
import DashboardBreakdown from "../../components/admin/dashboard/DashboardBreakdown.jsx";
import DashboardLowStock from "../../components/admin/dashboard/DashboardLowStock.jsx";
import DashboardRecentOrders from "../../components/admin/dashboard/DashboardRecentOrders.jsx";
import DashboardTopProducts from "../../components/admin/dashboard/DashboardTopProducts.jsx";

// Services
import {
  fetchAdminDashboard,
  fetchAdminStoreSettings,
} from "../../services/adminDashboardApi.js";

// Utils
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { formatOrderStatus } from "../../utils/adminOrderWorkflow.js";

/* =========================================================
   DASHBOARD PERIODS
========================================================= */

const DASHBOARD_PERIODS = [
  {
    value: "7d",
    label: "Last 7 days",
  },
  {
    value: "30d",
    label: "Last 30 days",
  },
  {
    value: "90d",
    label: "Last 90 days",
  },
  {
    value: "all",
    label: "All time",
  },
];

const VALID_PERIODS = new Set(DASHBOARD_PERIODS.map((period) => period.value));

/* =========================================================
   BREAKDOWN STYLES
========================================================= */

const ORDER_STATUS_STYLES = {
  PENDING: {
    dotClassName: "bg-amber-500",
    barClassName: "bg-amber-500",
  },

  CONFIRMED: {
    dotClassName: "bg-blue-500",
    barClassName: "bg-blue-500",
  },

  PROCESSING: {
    dotClassName: "bg-indigo-500",
    barClassName: "bg-indigo-500",
  },

  READY_FOR_DELIVERY: {
    dotClassName: "bg-purple-500",
    barClassName: "bg-purple-500",
  },

  OUT_FOR_DELIVERY: {
    dotClassName: "bg-cyan-500",
    barClassName: "bg-cyan-500",
  },

  DELIVERED: {
    dotClassName: "bg-emerald-500",
    barClassName: "bg-emerald-500",
  },

  CANCELLED: {
    dotClassName: "bg-red-500",
    barClassName: "bg-red-500",
  },

  RETURNED: {
    dotClassName: "bg-gray-500",
    barClassName: "bg-gray-500",
  },
};

const PAYMENT_STATUS_STYLES = {
  UNPAID: {
    dotClassName: "bg-amber-500",
    barClassName: "bg-amber-500",
  },

  PAID: {
    dotClassName: "bg-emerald-500",
    barClassName: "bg-emerald-500",
  },

  FAILED: {
    dotClassName: "bg-red-500",
    barClassName: "bg-red-500",
  },

  REFUNDED: {
    dotClassName: "bg-gray-500",
    barClassName: "bg-gray-500",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

/* =========================================================
   DASHBOARD
========================================================= */

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const [reloadToken, setReloadToken] = useState(0);

  const requestedPeriod = searchParams.get("period") ?? "30d";

  const period = VALID_PERIODS.has(requestedPeriod) ? requestedPeriod : "30d";

  const requestKey = useMemo(
    () => `${period}:${reloadToken}`,
    [period, reloadToken],
  );

  const [dashboardState, setDashboardState] = useState({
    requestKey: null,
    dashboard: null,
    setting: null,
    error: null,
  });

  const isLoading = dashboardState.requestKey !== requestKey;

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const [dashboardResponse, settingResponse] = await Promise.all([
          fetchAdminDashboard(
            {
              period,
            },
            {
              signal: controller.signal,
            },
          ),

          fetchAdminStoreSettings({
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setDashboardState({
          requestKey,
          dashboard: dashboardResponse.dashboard,
          setting: settingResponse.setting,
          error: null,
        });
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) {
          return;
        }

        if (isAuthenticationError(error)) {
          navigate("/admin/login", {
            replace: true,

            state: {
              from: `${location.pathname}${location.search}`,
            },
          });

          return;
        }

        setDashboardState({
          requestKey,
          dashboard: null,
          setting: null,
          error,
        });
      }
    }

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, [location.pathname, location.search, navigate, period, requestKey]);

  /* =======================================================
     PERIOD
  ======================================================= */

  function handlePeriodChange(event) {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("period", event.target.value);

    setSearchParams(nextParams);
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <section
        className="
          mx-auto
          w-full
          max-w-[100rem]
        "
      >
        {/* PAGE HEADER */}
        <div
          className="
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div className="flex-1">
            <div
              className="
                h-3
                w-28
                animate-pulse
                rounded-full
                bg-gray-100
              "
            />

            <div
              className="
                mt-3
                h-8
                w-40
                animate-pulse
                rounded-lg
                bg-gray-100
              "
            />

            <div
              className="
                mt-3
                h-4
                w-72
                max-w-full
                animate-pulse
                rounded
                bg-gray-100
              "
            />
          </div>

          <div
            className="
              h-12
              w-full
              animate-pulse
              rounded-[0.95rem]
              bg-gray-100

              sm:w-52
            "
          />
        </div>

        {/* METRICS */}
        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3

            sm:mt-6
            sm:grid-cols-2
            sm:gap-4

            xl:grid-cols-4
          "
        >
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-36
                animate-pulse
                rounded-[1.4rem]
                bg-gray-100

                sm:h-40
              "
            />
          ))}
        </div>

        {/* BREAKDOWNS */}
        <div
          className="
            mt-5
            grid
            gap-4

            sm:mt-6

            xl:grid-cols-2
          "
        >
          <div
            className="
              h-80
              animate-pulse
              rounded-[1.4rem]
              bg-gray-100
            "
          />

          <div
            className="
              h-80
              animate-pulse
              rounded-[1.4rem]
              bg-gray-100
            "
          />
        </div>
      </section>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (dashboardState.error) {
    return (
      <section
        className="
          mx-auto
          flex
          min-h-[60vh]
          w-full
          max-w-xl
          items-center
          justify-center
          px-2
        "
      >
        <div
          className="
            w-full
            rounded-[1.4rem]
            border
            border-red-200
            bg-white
            p-5
            text-center
            shadow-[0_8px_24px_rgba(15,23,42,0.04)]

            sm:p-8
          "
        >
          <span
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-600
              ring-1
              ring-red-100
            "
          >
            <ErrorOutlineRoundedIcon
              sx={{
                fontSize: 26,
              }}
            />
          </span>

          <p
            className="
              mt-5
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.12em]
              text-red-500
            "
          >
            Dashboard error
          </p>

          <h1
            className="
              mt-1.5
              text-xl
              font-bold
              tracking-[-0.025em]
              text-gray-950

              sm:text-2xl
            "
          >
            Dashboard could not be loaded
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            {getApiErrorMessage(
              dashboardState.error,
              "Unable to load dashboard data.",
            )}
          </p>

          <button
            type="button"
            onClick={() => setReloadToken((currentValue) => currentValue + 1)}
            className="
              mt-5
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gray-950
              px-5
              text-sm
              font-bold
              text-white
              transition-colors

              hover:bg-gray-800
            "
          >
            <RefreshRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
            Try again
          </button>
        </div>
      </section>
    );
  }

  /* =========================================================
     DATA
  ========================================================= */

  const dashboard = dashboardState.dashboard;

  const setting = dashboardState.setting;

  const currency = setting?.currency ?? "USD";

  const orderStatusItems = Object.entries(dashboard.orders.byStatus).map(
    ([status, value]) => ({
      key: status,

      label: formatOrderStatus(status),

      value,

      ...ORDER_STATUS_STYLES[status],
    }),
  );

  const paymentStatusItems = Object.entries(
    dashboard.orders.byPaymentStatus,
  ).map(([status, value]) => ({
    key: status,

    label: formatOrderStatus(status),

    value,

    ...PAYMENT_STATUS_STYLES[status],
  }));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[100rem]
      "
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <header
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-end
          sm:justify-between

          lg:gap-6
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[0.62rem]
              font-bold
              uppercase
              tracking-[0.13em]
              text-gray-400
            "
          >
            Store overview
          </p>

          <h1
            className="
              mt-1
              text-2xl
              font-bold
              tracking-[-0.035em]
              text-gray-950

              sm:text-3xl
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1.5
              max-w-xl
              text-xs
              leading-5
              text-gray-500

              sm:text-sm
              sm:leading-6
            "
          >
            Monitor sales, orders, customers, products, and inventory from one
            place.
          </p>
        </div>

        {/* REPORTING PERIOD */}
        <div
          className="
            w-full

            sm:w-52
            sm:shrink-0
          "
        >
          <label
            htmlFor="dashboard-period"
            className="
              text-[0.65rem]
              font-bold
              text-gray-600

              sm:text-xs
            "
          >
            Reporting period
          </label>

          <div className="relative mt-1.5">
            <select
              id="dashboard-period"
              value={period}
              onChange={handlePeriodChange}
              className="
                min-h-11
                w-full
                appearance-none
                rounded-[0.95rem]
                border
                border-gray-200
                bg-white
                px-3.5
                pr-10
                text-sm
                font-semibold
                text-gray-800
                outline-none
                transition

                focus:border-gray-400
                focus:ring-4
                focus:ring-gray-950/[0.035]
              "
            >
              {DASHBOARD_PERIODS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <KeyboardArrowDownRoundedIcon
              sx={{
                fontSize: 19,
              }}
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />
          </div>
        </div>
      </header>

      {/* =====================================================
          ORDERING DISABLED WARNING
      ===================================================== */}
      {!setting.ordersEnabled && (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-[1.15rem]
            border
            border-amber-200
            bg-amber-50/70
            p-3.5

            sm:mt-6
            sm:p-4
          "
        >
          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-white
              text-amber-600
              shadow-sm
              ring-1
              ring-amber-100
            "
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 18,
              }}
            />
          </span>

          <div>
            <p
              className="
                text-sm
                font-bold
                text-amber-900
              "
            >
              Customer ordering is disabled
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-amber-700

                sm:text-sm
                sm:leading-6
              "
            >
              Customers can still browse products and manage their carts, but
              new orders cannot currently be placed.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          METRICS
      ===================================================== */}
      <div
        className="
          mt-5
          grid
          grid-cols-1
          gap-3

          sm:mt-6
          sm:grid-cols-2
          sm:gap-4

          xl:grid-cols-4
        "
      >
        <AdminMetricCard
          icon={PaidOutlinedIcon}
          label="Paid revenue"
          value={formatCurrency(dashboard.summary.paidRevenue, currency)}
          description="Revenue from paid, non-cancelled orders."
          tone="green"
        />

        <AdminMetricCard
          icon={AttachMoneyRoundedIcon}
          label="Gross order value"
          value={formatCurrency(dashboard.summary.grossOrderValue, currency)}
          description="Value of non-cancelled orders in this period."
          tone="blue"
        />

        <AdminMetricCard
          icon={ReceiptLongOutlinedIcon}
          label="Total orders"
          value={dashboard.summary.totalOrders}
          description={`${dashboard.summary.paidOrderCount} paid orders`}
          tone="purple"
        />

        <AdminMetricCard
          icon={ShoppingBagOutlinedIcon}
          label="Average paid order"
          value={formatCurrency(
            dashboard.summary.averagePaidOrderValue,
            currency,
          )}
          description="Average value of paid orders."
          tone="dark"
        />

        <AdminMetricCard
          icon={GroupsOutlinedIcon}
          label="Customers"
          value={dashboard.summary.totalCustomers}
          description={`${dashboard.summary.newCustomers} new during this period`}
          tone="blue"
        />

        <AdminMetricCard
          icon={Inventory2OutlinedIcon}
          label="Active products"
          value={dashboard.summary.activeProducts}
          description={`${dashboard.summary.activeVariants} active variants`}
          tone="green"
        />

        <AdminMetricCard
          icon={CategoryOutlinedIcon}
          label="Active categories"
          value={dashboard.summary.activeCategories}
          description="Categories visible in the storefront."
          tone="purple"
        />

        <AdminMetricCard
          icon={WarningAmberRoundedIcon}
          label="Inventory alerts"
          value={dashboard.summary.lowStockVariantCount}
          description={`${dashboard.summary.outOfStockVariantCount} variants out of stock`}
          tone={dashboard.summary.outOfStockVariantCount > 0 ? "red" : "amber"}
        />
      </div>

      {/* =====================================================
          STATUS BREAKDOWNS
      ===================================================== */}
      <div
        className="
          mt-5
          grid
          gap-4

          sm:mt-6

          xl:grid-cols-2
        "
      >
        <DashboardBreakdown
          title="Orders by status"
          description="Distribution of orders in the selected period."
          items={orderStatusItems}
        />

        <DashboardBreakdown
          title="Payments by status"
          description="Payment-state distribution for the selected period."
          items={paymentStatusItems}
        />
      </div>

      {/* =====================================================
          RECENT ORDERS
      ===================================================== */}
      <div
        className="
          mt-5

          sm:mt-6
        "
      >
        <DashboardRecentOrders orders={dashboard.recentOrders} />
      </div>

      {/* =====================================================
          INVENTORY + TOP PRODUCTS
      ===================================================== */}
      <div
        className="
          mt-5
          grid
          items-start
          gap-4

          sm:mt-6

          xl:grid-cols-[minmax(0,1fr)_24rem]

          2xl:grid-cols-[minmax(0,1fr)_28rem]
        "
      >
        <DashboardLowStock
          items={dashboard.inventory.lowStockItems}
          lowStockCount={dashboard.inventory.lowStockCount}
          outOfStockCount={dashboard.inventory.outOfStockCount}
        />

        <DashboardTopProducts
          products={dashboard.topProducts}
          currency={currency}
        />
      </div>
    </section>
  );
}

export default AdminDashboard;
