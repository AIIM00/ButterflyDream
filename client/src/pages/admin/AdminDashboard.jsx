import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import AdminMetricCard from "../../components/admin/dashboard/AdminMetricCard.jsx";
import DashboardBreakdown from "../../components/admin/dashboard/DashboardBreakdown.jsx";
import DashboardLowStock from "../../components/admin/dashboard/DashboardLowStock.jsx";
import DashboardRecentOrders from "../../components/admin/dashboard/DashboardRecentOrders.jsx";
import DashboardTopProducts from "../../components/admin/dashboard/DashboardTopProducts.jsx";
import {
  fetchAdminDashboard,
  fetchAdminStoreSettings,
} from "../../services/adminDashboardApi.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import formatCurrency from "../../utils/formatCurrency.js";
import { formatOrderStatus } from "../../utils/adminOrderWorkflow.js";

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
    dotClassName: "bg-green-500",
    barClassName: "bg-green-500",
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
    dotClassName: "bg-green-500",
    barClassName: "bg-green-500",
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

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

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

  function handlePeriodChange(event) {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("period", event.target.value);

    setSearchParams(nextParams);
  }

  if (isLoading) {
    return (
      <section>
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </section>
    );
  }

  if (dashboardState.error) {
    return (
      <section className="py-16 text-center">
        <ErrorOutlineRoundedIcon
          className="text-red-500"
          sx={{
            fontSize: 64,
          }}
        />

        <h1 className="mt-5 text-3xl font-bold text-gray-950">
          Dashboard could not be loaded
        </h1>

        <p className="mt-3 text-gray-600">
          {getApiErrorMessage(
            dashboardState.error,
            "Unable to load dashboard data.",
          )}
        </p>

        <button
          type="button"
          onClick={() => setReloadToken((currentValue) => currentValue + 1)}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 font-semibold text-white"
        >
          <RefreshRoundedIcon />
          Try again
        </button>
      </section>
    );
  }

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

  return (
    <section>
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Store overview
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">Dashboard</h1>

          <p className="mt-2 text-gray-600">
            Monitor sales, orders, customers, products, and inventory.
          </p>
        </div>

        <label className="w-full sm:w-56">
          <span className="text-sm font-semibold text-gray-700">
            Reporting period
          </span>

          <select
            value={period}
            onChange={handlePeriodChange}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-950"
          >
            {DASHBOARD_PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {!setting.ordersEnabled && (
        <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <WarningAmberRoundedIcon className="shrink-0 text-amber-700" />

          <div>
            <h2 className="font-bold text-amber-900">
              Customer ordering is disabled
            </h2>

            <p className="mt-1 text-sm text-amber-800">
              Customers can browse and use their carts, but they cannot place
              new orders.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
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

      <div className="mt-8">
        <DashboardRecentOrders orders={dashboard.recentOrders} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
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
