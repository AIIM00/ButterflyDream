import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

import { fetchAdminCustomers } from "../../services/adminCustomerApi.js";
import formatCurrency from "../../utils/formatCurrency.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest customers" },
  { value: "oldest", label: "Oldest customers" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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

function AdminCustomersOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reloadToken, setReloadToken] = useState(0);

  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const requestKey = useMemo(
    () => JSON.stringify({ page, search, status, sort, reloadToken }),
    [page, search, status, sort, reloadToken],
  );

  const [state, setState] = useState({ requestKey: null, data: null, error: null });
  const isLoading = state.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetchAdminCustomers(
          {
            page,
            limit: 15,
            search: search || undefined,
            status: status || undefined,
            sort,
          },
          { signal: controller.signal },
        );

        if (!controller.signal.aborted) {
          setState({ requestKey, data: response, error: null });
        }
      } catch (error) {
        if (isCancelledRequest(error, controller.signal)) return;
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          navigate("/admin/login", {
            replace: true,
            state: { from: `${location.pathname}${location.search}` },
          });
          return;
        }
        setState({ requestKey, data: null, error });
      }
    }

    void load();
    return () => controller.abort();
  }, [location.pathname, location.search, navigate, page, requestKey, search, sort, status]);

  function updateFilters(updates) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next);
  }

  function openCustomer(customerId) {
    navigate(`/admin/customers/${customerId}`);
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[100rem] space-y-5">
        <div className="h-24 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[1.35rem] bg-gray-200/70" />
          ))}
        </div>
        <div className="h-[34rem] animate-pulse rounded-[1.4rem] bg-gray-200/70" />
      </section>
    );
  }

  if (state.error) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[1.4rem] border border-red-200 bg-white p-7 text-center">
          <ErrorOutlineRoundedIcon className="text-red-500" sx={{ fontSize: 34 }} />
          <h1 className="mt-3 text-xl font-bold text-gray-950">Customers could not be loaded</h1>
          <p className="mt-2 text-sm text-gray-500">
            {getApiErrorMessage(state.error, "Unable to load customer analytics.")}
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((value) => value + 1)}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-bold text-white"
          >
            <RefreshRoundedIcon sx={{ fontSize: 18 }} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const data = state.data ?? {};
  const summary = data.summary ?? {};
  const customers = data.customers ?? [];
  const topCustomers = data.topCustomers ?? [];
  const governorates = data.governorates ?? [];
  const pagination = data.pagination;
  const currency = data.currency ?? "USD";

  return (
    <section className="mx-auto w-full max-w-[100rem] space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-gray-400">Customer intelligence</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-gray-950 sm:text-3xl">Customers</h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm">
            Customer value, loyalty, purchase history and geographic demand. Select any customer to open their full profile.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-950 px-4 py-2.5 text-white">
          <GroupsRoundedIcon sx={{ fontSize: 17 }} />
          <span className="text-xs font-bold">{summary.totalCustomers ?? 0} registered</span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard eyebrow="Total customers" value={summary.totalCustomers ?? 0} detail={`${summary.activeCustomers ?? 0} active accounts`} icon={GroupsRoundedIcon} />
        <MetricCard eyebrow="New in 30 days" value={summary.newCustomers30d ?? 0} detail="Recently registered accounts" icon={PersonAddAlt1RoundedIcon} />
        <MetricCard eyebrow="Verified" value={summary.verifiedCustomers ?? 0} detail="Verified email addresses" icon={VerifiedUserRoundedIcon} />
        <MetricCard eyebrow="Repeat customers" value={summary.repeatCustomers ?? 0} detail={`${summary.repeatCustomerRate ?? 0}% of delivered buyers`} icon={RepeatRoundedIcon} />
        <MetricCard eyebrow="Lifetime sales" value={formatCurrency(summary.lifetimeRevenue, currency)} detail="Delivered customer revenue" icon={PaidRoundedIcon} />
        <MetricCard eyebrow="Avg. customer value" value={formatCurrency(summary.averageCustomerValue, currency)} detail="Delivered spend per buyer" icon={EmojiEventsRoundedIcon} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Lifetime ranking</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Top customers</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {topCustomers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-gray-500">No delivered orders yet.</p>
            ) : (
              topCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => openCustomer(customer.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-gray-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-black text-white">#{customer.rank}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-950">{customer.fullName}</p>
                    <p className="truncate text-xs text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-950">{formatCurrency(customer.totalSpent, currency)}</p>
                    <p className="text-[0.68rem] text-gray-400">{customer.deliveredOrders} delivered</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Geographic demand</p>
                <h2 className="mt-1 text-lg font-bold text-gray-950">Top governorates</h2>
              </div>
              <PublicRoundedIcon className="text-gray-400" />
            </div>
          </div>
          <div className="space-y-4 p-5">
            {governorates.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No delivered-order geography yet.</p>
            ) : (
              governorates.map((item) => (
                <div key={item.governorate}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.rank}. {item.governorate}</p>
                      <p className="text-[0.68rem] text-gray-400">{item.deliveredOrders} delivered orders</p>
                    </div>
                    <p className="text-xs font-black text-gray-950">{formatCurrency(item.revenue, currency)}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gray-950" style={{ width: `${Math.max(item.orderShare, 2)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">Customer directory</p>
          <h2 className="mt-1 text-lg font-bold text-gray-950">Registered customers</h2>
        </div>

        <div className="grid gap-3 border-b border-gray-100 p-5 md:grid-cols-[1.5fr_0.7fr_0.8fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              updateFilters({ search: String(form.get("search") ?? "").trim(), page: 1 });
            }}
            className="relative"
          >
            <SearchRoundedIcon sx={{ fontSize: 19 }} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              key={search}
              name="search"
              type="search"
              defaultValue={search}
              placeholder="Search name, email or phone"
              className="min-h-11 w-full rounded-[0.95rem] border border-gray-200 pl-10 pr-4 text-sm outline-none focus:border-gray-400"
            />
          </form>

          <div className="relative">
            <select
              value={status}
              onChange={(event) => updateFilters({ status: event.target.value, page: 1 })}
              className="min-h-11 w-full appearance-none rounded-[0.95rem] border border-gray-200 bg-white px-3.5 pr-9 text-sm font-semibold text-gray-700"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) => updateFilters({ sort: event.target.value, page: 1 })}
              className="min-h-11 w-full appearance-none rounded-[0.95rem] border border-gray-200 bg-white px-3.5 pr-9 text-sm font-semibold text-gray-700"
            >
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {customers.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-gray-500">No customers found.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[70rem]">
                <thead className="bg-gray-50/70">
                  <tr className="text-left">
                    {[
                      "Customer",
                      "Status",
                      "Orders",
                      "Delivered",
                      "Lifetime spend",
                      "Rank",
                      "Last order",
                      "Joined",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-gray-400">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      tabIndex={0}
                      onClick={() => openCustomer(customer.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") openCustomer(customer.id);
                      }}
                      className="cursor-pointer outline-none transition hover:bg-gray-50 focus:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-950">{customer.fullName}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={customer.status} /></td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-800">{customer.orderCount}</td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-800">{customer.deliveredOrders}</td>
                      <td className="px-5 py-4 text-sm font-black text-gray-950">{formatCurrency(customer.totalSpent, currency)}</td>
                      <td className="px-5 py-4 text-sm font-black text-gray-700">{customer.lifetimeRank ? `#${customer.lifetimeRank}` : "—"}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">{formatDate(customer.lastOrderAt)}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">{formatDate(customer.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 lg:hidden">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => openCustomer(customer.id)}
                  className="block w-full p-4 text-left transition hover:bg-gray-50 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-950">{customer.fullName}</p>
                      <p className="truncate text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <StatusBadge status={customer.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3">
                    <div><p className="text-[0.58rem] uppercase text-gray-400">Orders</p><p className="font-black">{customer.orderCount}</p></div>
                    <div><p className="text-[0.58rem] uppercase text-gray-400">Spend</p><p className="font-black">{formatCurrency(customer.totalSpent, currency)}</p></div>
                    <div><p className="text-[0.58rem] uppercase text-gray-400">Rank</p><p className="font-black">{customer.lifetimeRank ? `#${customer.lifetimeRank}` : "—"}</p></div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
            <p className="text-xs font-semibold text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={!pagination.hasPreviousPage} onClick={() => updateFilters({ page: pagination.page - 1 })} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40">
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              </button>
              <button type="button" disabled={!pagination.hasNextPage} onClick={() => updateFilters({ page: pagination.page + 1 })} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 disabled:opacity-40">
                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminCustomersOverview;
