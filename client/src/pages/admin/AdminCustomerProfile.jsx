import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";

import { fetchAdminCustomerProfile } from "../../services/adminCustomerApi.js";
import formatCurrency from "../../utils/formatCurrency.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import { formatOrderStatus } from "../../utils/adminOrderWorkflow.js";

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold ring-1",
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-amber-100",
      ].join(" ")}
    >
      {active ? "Active" : "Suspended"}
    </span>
  );
}

function OrderBadge({ status }) {
  const classNameByStatus = {
    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    CANCELLED: "bg-red-50 text-red-700 ring-red-100",
    RETURNED: "bg-gray-100 text-gray-700 ring-gray-200",
    OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    READY_FOR_DELIVERY: "bg-purple-50 text-purple-700 ring-purple-100",
    PROCESSING: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-100",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ${classNameByStatus[status] ?? "bg-gray-100 text-gray-700 ring-gray-200"}`}
    >
      {formatOrderStatus(status)}
    </span>
  );
}

function MetricCard({ eyebrow, value, detail, icon: Icon }) {
  return (
    <article className="rounded-[1.35rem] border border-gray-200/80 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">
            {eyebrow}
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-gray-950">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <Icon sx={{ fontSize: 20 }} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-500">{detail}</p>
    </article>
  );
}

function AdminCustomerProfile() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState((current) => ({ ...current, loading: true, error: null }));

      try {
        const response = await fetchAdminCustomerProfile(customerId, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setState({ loading: false, data: response, error: null });
        }
      } catch (error) {
        if (controller.signal.aborted || error?.code === "ERR_CANCELED") return;

        if (error?.response?.status === 401 || error?.response?.status === 403) {
          navigate("/admin/login", {
            replace: true,
            state: { from: `${location.pathname}${location.search}` },
          });
          return;
        }

        setState({ loading: false, data: null, error });
      }
    }

    void load();
    return () => controller.abort();
  }, [customerId, location.pathname, location.search, navigate, reloadToken]);

  if (state.loading) {
    return (
      <section className="mx-auto w-full max-w-[100rem] space-y-5">
        <div className="h-28 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[1.35rem] bg-gray-200/70" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
          <div className="h-80 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
        </div>
      </section>
    );
  }

  if (state.error) {
    const notFound = state.error?.response?.status === 404;
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center">
        <div className="w-full rounded-[1.4rem] border border-red-200 bg-white p-7 text-center">
          <ErrorOutlineRoundedIcon className="text-red-500" sx={{ fontSize: 36 }} />
          <h1 className="mt-3 text-xl font-bold text-gray-950">
            {notFound ? "Customer not found" : "Customer profile could not be loaded"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {getApiErrorMessage(state.error, "Unable to load this customer profile.")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/customers")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gray-200 px-5 text-sm font-bold text-gray-700"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              Customers
            </button>
            {!notFound && (
              <button
                type="button"
                onClick={() => setReloadToken((value) => value + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-bold text-white"
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                Try again
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const data = state.data;
  const customer = data.customer;
  const summary = data.summary;
  const addresses = data.addresses ?? [];
  const favoriteProducts = data.favoriteProducts ?? [];
  const favoriteCategories = data.favoriteCategories ?? [];
  const orders = data.orders ?? [];
  const activity = data.activity ?? [];
  const currency = data.currency ?? "USD";

  return (
    <section className="mx-auto w-full max-w-[100rem] space-y-5 sm:space-y-6">
      <header className="rounded-[1.4rem] border border-gray-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/admin/customers")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 transition hover:text-gray-950"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 17 }} />
          Back to customers
        </button>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-lg font-black uppercase text-white">
              {customer.fullName?.slice(0, 1) || "C"}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-[-0.035em] text-gray-950 sm:text-3xl">
                  {customer.fullName}
                </h1>
                <StatusBadge status={customer.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><MailOutlineRoundedIcon sx={{ fontSize: 15 }} />{customer.email}</span>
                {customer.phone && <span className="inline-flex items-center gap-1.5"><PhoneRoundedIcon sx={{ fontSize: 15 }} />{customer.phone}</span>}
              </div>
              <p className="mt-2 text-[0.68rem] font-semibold text-gray-400">
                Joined {formatDate(customer.joinedAt)} · Last login {formatDate(customer.lastLoginAt, true)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                Email verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-100">
                Email unverified
              </span>
            )}
            {summary.lifetimeRank && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-950 px-3 py-2 text-xs font-black text-white">
                <EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />
                Lifetime rank #{summary.lifetimeRank}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          eyebrow="Lifetime spend"
          value={formatCurrency(summary.lifetimeSpend, currency)}
          detail={`${summary.deliveredOrders} delivered orders`}
          icon={PaidRoundedIcon}
        />
        <MetricCard
          eyebrow="Average order value"
          value={formatCurrency(summary.averageOrderValue, currency)}
          detail="Average value of delivered orders"
          icon={ReceiptLongRoundedIcon}
        />
        <MetricCard
          eyebrow="Total orders"
          value={summary.totalOrders}
          detail={`${summary.activeOrders} currently active · ${summary.cancelledOrders} cancelled`}
          icon={ShoppingBagRoundedIcon}
        />
        <MetricCard
          eyebrow="Customer since"
          value={formatDate(customer.joinedAt)}
          detail={summary.firstOrderAt ? `First order ${formatDate(summary.firstOrderAt)}` : "No orders yet"}
          icon={PersonRoundedIcon}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Saved delivery details</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Addresses</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {addresses.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500">No saved addresses.</p>
            ) : (
              addresses.map((address) => (
                <article key={address.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-950">{address.label}</p>
                      <p className="mt-1 text-xs text-gray-500">{address.recipientName} · {address.phone}</p>
                    </div>
                    {address.isDefault && <span className="rounded-full bg-gray-950 px-2.5 py-1 text-[0.62rem] font-bold text-white">Default</span>}
                  </div>
                  <div className="mt-3 flex gap-2 text-xs leading-5 text-gray-600">
                    <HomeWorkRoundedIcon sx={{ fontSize: 16 }} className="mt-0.5 shrink-0 text-gray-400" />
                    <p>
                      {address.street}{address.building ? `, ${address.building}` : ""}{address.floor ? `, floor ${address.floor}` : ""}<br />
                      {address.city}, {address.governorate}
                      {address.landmark ? <><br />Landmark: {address.landmark}</> : null}
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Buying preferences</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Favorites</h2>
            <p className="mt-1 text-xs text-gray-500">Calculated from delivered orders only.</p>
          </div>

          <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-gray-100">
            <div className="p-5">
              <p className="text-xs font-bold text-gray-700">Favorite products</p>
              <div className="mt-3 space-y-3">
                {favoriteProducts.length === 0 ? (
                  <p className="text-xs text-gray-400">No delivered purchases yet.</p>
                ) : (
                  favoriteProducts.map((item) => (
                    <div key={`${item.productId ?? item.name}-${item.rank}`} className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><Inventory2RoundedIcon sx={{ fontSize: 18 }} /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-gray-900">{item.rank}. {item.name}</p>
                        <p className="text-[0.65rem] text-gray-400">{item.units} units · {item.orders} orders</p>
                      </div>
                      <p className="text-[0.68rem] font-black text-gray-700">{formatCurrency(item.revenue, currency)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 p-5 md:border-t-0">
              <p className="text-xs font-bold text-gray-700">Favorite categories</p>
              <div className="mt-3 space-y-3">
                {favoriteCategories.length === 0 ? (
                  <p className="text-xs text-gray-400">Category preferences will appear after delivered purchases.</p>
                ) : (
                  favoriteCategories.map((item) => (
                    <div key={item.categoryId} className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-gray-900">{item.rank}. {item.name}</p>
                        <p className="text-[0.68rem] font-black text-gray-700">{formatCurrency(item.revenue, currency)}</p>
                      </div>
                      <p className="mt-1 text-[0.65rem] text-gray-400">{item.units} units across {item.orders} orders</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Commerce history</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-950">Full order history</h2>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">{orders.length} orders</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-gray-500">This customer has not placed an order yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="block w-full p-5 text-left transition hover:bg-gray-50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-gray-950">{order.orderNumber}</p>
                      <OrderBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(order.createdAt, true)} · {order.deliveryLocation.city}, {order.deliveryLocation.governorate}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-black text-gray-950">{formatCurrency(order.totalAmount, order.currency)}</p>
                    <p className="mt-0.5 text-[0.68rem] text-gray-400">{order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {formatOrderStatus(order.paymentStatus)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 4).map((item) => (
                    <span key={item.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-[0.65rem] font-semibold text-gray-600">
                      {item.quantity}× {item.productName}{item.variantName ? ` · ${item.variantName}` : ""}
                    </span>
                  ))}
                  {order.items.length > 4 && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[0.65rem] font-semibold text-gray-500">+{order.items.length - 4} more</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <TimelineRoundedIcon sx={{ fontSize: 20 }} className="text-gray-500" />
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Account & order events</p>
              <h2 className="mt-1 text-lg font-bold text-gray-950">Activity timeline</h2>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {activity.map((event) => (
            <article key={event.id} className="flex gap-3 p-5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                {event.type === "LAST_LOGIN" ? <LoginRoundedIcon sx={{ fontSize: 17 }} /> : event.type === "ACCOUNT_CREATED" ? <PersonRoundedIcon sx={{ fontSize: 17 }} /> : <ReceiptLongRoundedIcon sx={{ fontSize: 17 }} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-gray-900">{event.title}</p>
                  <p className="text-[0.68rem] font-semibold text-gray-400">{formatDate(event.createdAt, true)}</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-500">{event.description}</p>
                {event.changedBy && (
                  <p className="mt-1 text-[0.65rem] font-semibold text-gray-400">Changed by {event.changedBy.fullName} ({event.changedBy.role.toLowerCase()})</p>
                )}
                {event.orderId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/orders/${event.orderId}`)}
                    className="mt-2 text-[0.68rem] font-bold text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-gray-950"
                  >
                    Open order
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AdminCustomerProfile;
