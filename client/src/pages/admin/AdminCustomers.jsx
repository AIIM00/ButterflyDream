import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// MUI Icons
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RepeatRoundedIcon from "@mui/icons-material/RepeatRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";

// Services
import { fetchAdminCustomers } from "../../services/adminCustomerApi.js";

// Utils
import formatCurrency from "../../utils/formatCurrency.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";

const CUSTOMER_SORT_OPTIONS = [
  { value: "newest", label: "Newest customers" },
  { value: "oldest", label: "Oldest customers" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

function isCancelledRequest(error, signal) {
  return signal?.aborted || error?.code === "ERR_CANCELED";
}

function isAuthenticationError(error) {
  return error?.response?.status === 401 || error?.response?.status === 403;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function CustomerStatusBadge({ status }) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-bold",
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-emerald-500" : "bg-amber-500",
        ].join(" ")}
      />
      {isActive ? "Active" : "Suspended"}
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
          <p className="mt-2 truncate text-2xl font-black tracking-[-0.04em] text-gray-950 sm:text-[1.7rem]">
            {value}
          </p>
        </div>

        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <Icon sx={{ fontSize: 20 }} />
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500">{detail}</p>
    </article>
  );
}

function LoadingState() {
  return (
    <section className="mx-auto w-full max-w-[100rem] space-y-5 sm:space-y-6">
      <div className="h-24 animate-pulse rounded-[1.4rem] bg-gray-200/70" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.35rem] bg-gray-200/70"
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
        <div className="h-96 animate-pulse rounded-[1.4rem] bg-gray-200/70" />
      </div>

      <div className="h-[28rem] animate-pulse rounded-[1.4rem] bg-gray-200/70" />
    </section>
  );
}

function AdminCustomers() {
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

  const [customerState, setCustomerState] = useState({
    requestKey: null,
    data: null,
    error: null,
  });

  const isLoading = customerState.requestKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomers() {
      try {
        const response = await fetchAdminCustomers(
          {
            page,
            limit: 15,
            search: search || undefined,
            status: status || undefined,
            sort,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) {
          return;
        }

        setCustomerState({
          requestKey,
          data: response,
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

        setCustomerState({
          requestKey,
          data: null,
          error,
        });
      }
    }

    void loadCustomers();

    return () => controller.abort();
  }, [
    location.pathname,
    location.search,
    navigate,
    page,
    requestKey,
    search,
    sort,
    status,
  ]);

  function updateFilters(updates) {
    const nextParams = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === "") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    }

    setSearchParams(nextParams);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    updateFilters({
      search: String(formData.get("search") ?? "").trim(),
      page: 1,
    });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (customerState.error) {
    return (
      <section className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-2">
        <div className="w-full rounded-[1.4rem] border border-red-200 bg-white p-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
            <ErrorOutlineRoundedIcon sx={{ fontSize: 26 }} />
          </span>
          <p className="mt-5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-red-500">
            Customer analytics error
          </p>
          <h1 className="mt-1.5 text-xl font-bold tracking-[-0.025em] text-gray-950 sm:text-2xl">
            Customer data could not be loaded
          </h1>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
            {getApiErrorMessage(
              customerState.error,
              "Unable to load customer analytics.",
            )}
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((value) => value + 1)}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
          >
            <RefreshRoundedIcon sx={{ fontSize: 18 }} />
            Try again
          </button>
        </div>
      </section>
    );
  }

  const data = customerState.data;
  const summary = data?.summary ?? {};
  const customers = data?.customers ?? [];
  const topCustomers = data?.topCustomers ?? [];
  const governorates = data?.governorates ?? [];
  const topGovernorate = data?.topGovernorate ?? null;
  const pagination = data?.pagination ?? null;
  const currency = data?.currency ?? "USD";
  const hasFilters = Boolean(search) || Boolean(status) || sort !== "newest";

  return (
    <section className="mx-auto w-full max-w-[100rem] space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.13em] text-gray-400">
            Customer intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.035em] text-gray-950 sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
            Understand who buys from Butterfly Dream, identify your strongest
            customers, and see where delivered sales are concentrated.
          </p>
        </div>

        <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-gray-950 px-4 py-2.5 text-white">
          <GroupsRoundedIcon sx={{ fontSize: 17 }} />
          <span className="text-xs font-bold">
            {summary.totalCustomers ?? 0} registered customers
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          eyebrow="Total customers"
          value={summary.totalCustomers ?? 0}
          detail={`${summary.activeCustomers ?? 0} active accounts`}
          icon={GroupsRoundedIcon}
        />
        <MetricCard
          eyebrow="New in 30 days"
          value={summary.newCustomers30d ?? 0}
          detail="New registered customer accounts"
          icon={PersonAddAlt1RoundedIcon}
        />
        <MetricCard
          eyebrow="Verified"
          value={summary.verifiedCustomers ?? 0}
          detail="Customers with verified email addresses"
          icon={VerifiedUserRoundedIcon}
        />
        <MetricCard
          eyebrow="Repeat customers"
          value={summary.repeatCustomers ?? 0}
          detail={`${summary.repeatCustomerRate ?? 0}% of delivered buyers ordered at least twice`}
          icon={RepeatRoundedIcon}
        />
        <MetricCard
          eyebrow="Lifetime sales"
          value={formatCurrency(summary.lifetimeRevenue, currency)}
          detail="Revenue from delivered customer orders"
          icon={PaidRoundedIcon}
        />
        <MetricCard
          eyebrow="Avg. customer value"
          value={formatCurrency(summary.averageCustomerValue, currency)}
          detail="Average delivered spend per buying customer"
          icon={EmojiEventsRoundedIcon}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-5 lg:px-6">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">
              Lifetime ranking
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-950 sm:text-lg">
                Top customers
              </h2>
              <EmojiEventsRoundedIcon
                sx={{ fontSize: 20 }}
                className="text-amber-500"
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Ranked by revenue from delivered orders.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {topCustomers.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-500">
                No delivered customer orders yet.
              </div>
            ) : (
              topCustomers.map((customer) => (
                <article
                  key={customer.id}
                  className="flex items-center gap-3 px-4 py-4 sm:px-5 lg:px-6"
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black",
                      customer.rank === 1
                        ? "bg-amber-100 text-amber-800"
                        : customer.rank === 2
                          ? "bg-gray-200 text-gray-700"
                          : customer.rank === 3
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-600",
                    ].join(" ")}
                  >
                    #{customer.rank}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-950">
                      {customer.fullName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {customer.email || "No email"}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-black text-gray-950">
                      {formatCurrency(customer.totalSpent, currency)}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold text-gray-400">
                      {customer.deliveredOrders} delivered
                    </p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="border-b border-gray-100 px-4 py-4 sm:px-5 lg:px-6">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">
              Geographic demand
            </p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-950 sm:text-lg">
                Top governorates
              </h2>
              <PublicRoundedIcon
                sx={{ fontSize: 20 }}
                className="text-gray-500"
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Ranked by revenue from successfully delivered website orders.
            </p>
          </div>

          {topGovernorate && (
            <div className="border-b border-gray-100 bg-gray-950 px-5 py-4 text-white lg:px-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Strongest governorate
                  </p>
                  <p className="mt-1 text-xl font-black tracking-[-0.03em]">
                    {topGovernorate.governorate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black">
                    {formatCurrency(topGovernorate.revenue, currency)}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] font-semibold text-gray-400">
                    {topGovernorate.deliveredOrders} delivered orders
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 p-4 sm:p-5 lg:p-6">
            {governorates.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Delivery-location analytics will appear after completed orders.
              </div>
            ) : (
              governorates.map((item) => (
                <div key={item.governorate}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {item.rank}. {item.governorate}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] text-gray-400">
                        {item.deliveredOrders} delivered orders
                      </p>
                    </div>
                    <p className="shrink-0 text-xs font-black text-gray-950">
                      {formatCurrency(item.revenue, currency)}
                    </p>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-950"
                      style={{ width: `${Math.max(item.orderShare, 2)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[0.62rem] font-semibold text-gray-400">
                    {item.orderShare}% of delivered orders
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-[1.4rem] border border-gray-200/80 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5 lg:px-6">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gray-400">
              Customer directory
            </p>
            <h2 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
              Registered customers
            </h2>
          </div>

          {pagination && (
            <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
              {pagination.totalItems} result{pagination.totalItems === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="border-b border-gray-100 p-4 sm:p-5 lg:p-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <SearchRoundedIcon
                sx={{ fontSize: 19 }}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                key={search}
                type="search"
                name="search"
                defaultValue={search}
                placeholder="Search by customer name, email or phone"
                className="min-h-11 w-full rounded-[0.95rem] border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-4 focus:ring-gray-950/[0.035]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-gray-950 px-5 text-sm font-bold text-white transition-colors hover:bg-gray-800 sm:w-auto sm:min-w-24"
            >
              Search
            </button>
          </form>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <div>
              <label
                htmlFor="customer-status"
                className="text-[0.65rem] font-bold text-gray-600 sm:text-xs"
              >
                Account status
              </label>
              <div className="relative mt-1.5">
                <select
                  id="customer-status"
                  value={status}
                  onChange={(event) =>
                    updateFilters({ status: event.target.value, page: 1 })
                  }
                  className="min-h-11 w-full appearance-none rounded-[0.95rem] border border-gray-200 bg-white px-3.5 pr-9 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-950/[0.035]"
                >
                  <option value="">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <KeyboardArrowDownRoundedIcon
                  sx={{ fontSize: 18 }}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="customer-sort"
                className="text-[0.65rem] font-bold text-gray-600 sm:text-xs"
              >
                Sort
              </label>
              <div className="relative mt-1.5">
                <select
                  id="customer-sort"
                  value={sort}
                  onChange={(event) =>
                    updateFilters({ sort: event.target.value, page: 1 })
                  }
                  className="min-h-11 w-full appearance-none rounded-[0.95rem] border border-gray-200 bg-white px-3.5 pr-9 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-950/[0.035]"
                >
                  {CUSTOMER_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <KeyboardArrowDownRoundedIcon
                  sx={{ fontSize: 18 }}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-end">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 lg:w-auto"
                >
                  <FilterAltOffOutlinedIcon sx={{ fontSize: 17 }} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <GroupsRoundedIcon
              sx={{ fontSize: 34 }}
              className="text-gray-300"
            />
            <p className="mt-3 text-sm font-bold text-gray-800">
              No customers found
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[72rem] border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">
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
                      <th
                        key={heading}
                        className="px-5 py-3 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xs font-black uppercase text-white">
                            {customer.fullName?.slice(0, 1) || "C"}
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-56 truncate text-sm font-bold text-gray-950">
                              {customer.fullName}
                            </p>
                            <p className="mt-0.5 max-w-64 truncate text-xs text-gray-500">
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="mt-0.5 text-[0.68rem] text-gray-400">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <CustomerStatusBadge status={customer.status} />
                        <p className="mt-1.5 text-[0.65rem] font-semibold text-gray-400">
                          {customer.emailVerified ? "Email verified" : "Unverified email"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-800">
                        {customer.orderCount}
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-gray-800">
                        {customer.deliveredOrders}
                      </td>
                      <td className="px-5 py-4 text-sm font-black text-gray-950">
                        {formatCurrency(customer.totalSpent, currency)}
                      </td>
                      <td className="px-5 py-4">
                        {customer.lifetimeRank ? (
                          <span className="inline-flex rounded-full bg-gray-950 px-2.5 py-1 text-[0.68rem] font-black text-white">
                            #{customer.lifetimeRank}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                        {formatDate(customer.lastOrderAt)}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                        {formatDate(customer.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-gray-100 lg:hidden">
              {customers.map((customer) => (
                <article key={customer.id} className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-950 text-xs font-black uppercase text-white">
                      {customer.fullName?.slice(0, 1) || "C"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-gray-950">
                          {customer.fullName}
                        </p>
                        {customer.lifetimeRank && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[0.62rem] font-black text-gray-700">
                            #{customer.lifetimeRank}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {customer.email}
                      </p>
                    </div>
                    <CustomerStatusBadge status={customer.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.09em] text-gray-400">
                        Orders
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900">
                        {customer.orderCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.09em] text-gray-400">
                        Delivered
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900">
                        {customer.deliveredOrders}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.09em] text-gray-400">
                        Spend
                      </p>
                      <p className="mt-1 text-sm font-black text-gray-900">
                        {formatCurrency(customer.totalSpent, currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.58rem] font-bold uppercase tracking-[0.09em] text-gray-400">
                        Last order
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-700">
                        {formatDate(customer.lastOrderAt)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:px-5 lg:px-6">
            <p className="text-xs font-semibold text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous customer page"
              >
                <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next customer page"
              >
                <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

export default AdminCustomers;
