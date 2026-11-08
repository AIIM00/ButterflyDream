import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiClient from "../../services/apiClient.js";
import formatCurrency from "../../utils/formatCurrency.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
import "./customer-dashboard.css";

const activityLabels = {
  all: "All customers",
  buying: "Buying",
  returning: "Returning",
  vip: "VIP",
  first: "First-time buyers",
  never: "Never purchased",
  inactive: "Inactive repeat buyers · 90 days",
  new: "New registrations",
};
const percent = (data) =>
  data.buyers ? Math.round((100 * data.returning) / data.buyers) : 0;
const dateLabel = (value) =>
  new Date(value).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const today = () => new Date().toISOString().slice(0, 10);

function useReport(path) {
  const [result, setResult] = useState({});
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    apiClient
      .get(path, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setResult({ path, attempt, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({
            path,
            attempt,
            error: getApiErrorMessage(error, "Unable to load customer data."),
          });
      });
    return () => controller.abort();
  }, [path, attempt]);
  return {
    ...(result.path === path && result.attempt === attempt ? result : {}),
    retry: () => retry((n) => n + 1),
  };
}

function Feedback({ report }) {
  return report.error ? (
    <p role="alert">
      {report.error} <button onClick={report.retry}>Retry</button>
    </p>
  ) : (
    <p role="status">Loading…</p>
  );
}

function Metric({
  title,
  value,
  previous,
  format,
  series,
  onClick,
  detail,
  line,
}) {
  const change = previous == null ? null : value - previous;
  const maximum = Math.max(1, ...series.map((point) => point.value));
  const content = (
    <>
      <span className="cd-metric-title">{title}</span>
      <strong>{format(value)}</strong>
      <small>
        {detail ||
          (change == null
            ? "Selected period"
            : `${change >= 0 ? "+" : "−"}${format(Math.abs(change))} vs previous period`)}
      </small>
      {line ? (
        <svg
          className="cd-trend"
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={series
              .map(
                (point, index) =>
                  `${(index * 200) / Math.max(1, series.length - 1)},${38 - (34 * point.value) / maximum}`,
              )
              .join(" ")}
          />
        </svg>
      ) : (
        <span className="cd-bars" aria-hidden="true">
          {series.map((point) => (
            <i
              key={point.key}
              style={{ height: `${(100 * point.value) / maximum}%` }}
            />
          ))}
        </span>
      )}
    </>
  );
  return onClick ? (
    <button className="cd-metric" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="cd-metric">{content}</div>
  );
}

function Metrics({ report, filter }) {
  if (!report.data) return <Feedback report={report} />;
  const { current, previous, series } = report.data;
  const specs = [
    ["New registrations", (r) => r.registrations, String, "new"],
    ["Buying customers", (r) => r.buyers, String, "buying"],
    ["Returning buyer rate", percent, (n) => n + "%", "returning"],
    ["Average order value", (r) => r.average, formatCurrency],
  ];
  return (
    <>
      <div className="cd-metrics">
        {specs.map(([title, read, format, activity]) => (
          <Metric
            key={title}
            title={title}
            line={activity === "returning" || !activity}
            value={read(current)}
            previous={previous && read(previous)}
            format={format}
            onClick={activity ? () => filter(activity) : undefined}
            detail={
              activity === "returning"
                ? `${current.returning} of ${current.buyers} buyers${previous ? " · previously " + percent(previous) + "%" : ""}`
                : ""
            }
            series={series.map((r) => ({ key: r.key, value: read(r) }))}
          />
        ))}
      </div>
      <details className="cd-activity">
        <summary>
          Buyer activity <span>Guest purchases · {current.guests}</span>
        </summary>
        <div className="cd-chart" aria-hidden="true">
          {series.map((r) => (
            <div key={r.key}>
              <i
                style={{
                  height:
                    ((r.buyers - r.returning) * 100) /
                      Math.max(1, ...series.map((p) => p.buyers)) +
                    "%",
                }}
              />
              <i
                style={{
                  height:
                    (r.returning * 100) /
                      Math.max(1, ...series.map((p) => p.buyers)) +
                    "%",
                }}
              />
            </div>
          ))}
        </div>
        <table>
          <caption>Registered buyers by period (UTC)</caption>
          <thead>
            <tr>
              <th>From</th>
              <th>First-time</th>
              <th>Returning</th>
            </tr>
          </thead>
          <tbody>
            {series.map((r) => (
              <tr key={r.key}>
                <td>{dateLabel(r.key)}</td>
                <td>{r.buyers - r.returning}</td>
                <td>{r.returning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}

function Profile({ row, onBack }) {
  const report = useReport(row ? "/admin/customers/" + row.id : null);
  if (!row)
    return (
      <div className="cd-profile">Select a customer to view their orders.</div>
    );
  return (
    <div className="cd-profile">
      <button className="cd-back" onClick={onBack}>
        ← Customer list
      </button>
      <div className="cd-heading">
        <div>
          <h2>{row.fullName}</h2>
          <p>{row.email}</p>
        </div>
        {row.status === "ACTIVE" && (
          <Link
            className="cd-primary"
            to="/admin/discounts"
            state={{ vipCustomerIds: [row.id] }}
          >
            Create VIP offer
          </Link>
        )}
      </div>
      <div className="cd-totals">
        {[
          ["Net spend", formatCurrency(row.spend)],
          ["Items purchased", row.items],
          ["Paid orders", row.orders],
        ].map(([k, v]) => (
          <div key={k}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <small>
        Paid, delivered merchandise in the selected period · excludes delivery
      </small>
      <h3>Recent orders</h3>
      {report.data ? (
        report.data.orders.length ? (
          report.data.orders.slice(0, 4).map((o) => (
            <Link className="cd-order" key={o.id} to={"/admin/orders/" + o.id}>
              <b>{o.orderNumber}</b>
              <span>{formatCurrency(o.totalAmount, o.currency)}</span>
              <small>
                {o.status.replaceAll("_", " ").toLowerCase()} ·{" "}
                {o.paymentStatus.toLowerCase()}
              </small>
              <span>›</span>
            </Link>
          ))
        ) : (
          <p>No orders yet.</p>
        )
      ) : (
        <Feedback report={report} />
      )}
      <Link className="cd-link" to={"/admin/customers/" + row.id}>
        Full profile and order history →
      </Link>
    </div>
  );
}

export default function AdminCustomerDashboard() {
  const [params, setParams] = useSearchParams();
  const period = params.get("period") || "30d",
    activity = params.get("activity") || "all";
  const search = params.get("search") || "",
    rank = params.get("rank") || "spend",
    status = params.get("status") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const [selected, setSelected] = useState(null),
    [mobileOpen, setMobileOpen] = useState(false);
  const [checked, setChecked] = useState([]);
  const start = params.get("start") || today(),
    end = params.get("end") || today();
  const dates = new URLSearchParams({
    period,
    ...(period === "custom" ? { start, end } : {}),
  });
  const list = new URLSearchParams(dates);
  for (const [key, value] of Object.entries({
    search,
    rank,
    status,
    activity,
    page,
  }))
    list.set(key, value);
  const metrics = useReport("/admin/customers/metrics?" + dates);
  const directory = useReport("/admin/customers/directory?" + list);
  const rows = directory.data?.rows ?? [];
  const current = rows.find((r) => r.id === selected) ?? rows[0];
  function update(values) {
    const next = new URLSearchParams(params);
    next.delete("page");
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setMobileOpen(false);
    setParams(next);
  }
  function choose(row) {
    setSelected(row.id);
    setMobileOpen(true);
  }
  return (
    <section className="cd-page">
      <div className="cd-heading">
        <h1>Customers</h1>
        <div className="cd-actions">
          <select
            aria-label="Reporting period"
            value={period}
            onChange={(e) => update({ period: e.target.value })}
          >
            <option value="30d">Last 30 days</option>
            <option value="month">This month</option>
            <option value="all">All time</option>
            <option value="custom">Custom dates</option>
          </select>
          <Link
            className="cd-primary"
            to="/admin/discounts"
            state={{ vipCustomerIds: checked }}
          >
            Create VIP offer{checked.length > 0 && " (" + checked.length + ")"}
          </Link>
        </div>
      </div>
      {period === "custom" && (
        <div className="cd-actions">
          <label>
            From{" "}
            <input
              type="date"
              value={start}
              max={end}
              onChange={(e) => update({ start: e.target.value })}
            />
          </label>
          <label>
            Through{" "}
            <input
              type="date"
              value={end}
              min={start}
              max={today()}
              onChange={(e) => update({ end: e.target.value })}
            />
          </label>
        </div>
      )}
      <Metrics
        report={metrics}
        filter={(value) => update({ activity: value })}
      />
      <div className="cd-filters">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({
              search: new FormData(e.currentTarget).get("search").trim(),
            });
          }}
        >
          <input
            aria-label="Customer search"
            placeholder="Name, email or order number"
            maxLength={120}
            key={search}
            name="search"
            defaultValue={search}
          />
          <button>Search</button>
        </form>
        <select
          aria-label="Account status"
          value={status}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">All account statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select
          aria-label="Purchase activity"
          value={activity}
          onChange={(e) => update({ activity: e.target.value })}
        >
          {Object.entries(activityLabels).map(([key, label]) => (
            <option value={key} key={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {directory.data?.guests?.length > 0 && (
        <div className="cd-guests">
          <b>Matching guest orders</b>
          {directory.data.guests.map((o) => (
            <Link key={o.id} to={"/admin/orders/" + o.id}>
              {o.customerName} · {o.orderNumber} ↗
            </Link>
          ))}
        </div>
      )}
      <div className={"cd-workspace" + (mobileOpen ? " cd-open" : "")}>
        <div className="cd-tabs">
          {["all", "buying", "returning", "vip"].map((key) => (
            <button
              key={key}
              aria-pressed={activity === key}
              onClick={() => update({ activity: key })}
            >
              {activityLabels[key]}
            </button>
          ))}
        </div>
        <div className="cd-split">
          <div className="cd-list">
            <h2>Customers</h2>
            <div className="cd-rank">
              {[
                ["spend", "Highest spend"],
                ["items", "Most items"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={rank === key}
                  onClick={() => update({ rank: key })}
                >
                  {label}
                </button>
              ))}
            </div>
            {!directory.data ? (
              <Feedback report={directory} />
            ) : rows.length === 0 ? (
              <p>No registered customers match these filters.</p>
            ) : (
              rows.map((r) => (
                <div
                  key={r.id}
                  className={
                    "cd-row" + (current?.id === r.id ? " cd-selected" : "")
                  }
                >
                  {r.status === "ACTIVE" && (
                    <input
                      type="checkbox"
                      aria-label={"Select " + r.fullName + " for VIP offer"}
                      checked={checked.includes(r.id)}
                      onChange={(e) =>
                        setChecked((ids) =>
                          e.target.checked
                            ? [...ids, r.id]
                            : ids.filter((id) => id !== r.id),
                        )
                      }
                    />
                  )}
                  <button onClick={() => choose(r)}>
                    <span>{r.fullName}</span>
                    <b>
                      {rank === "items"
                        ? r.items + " items"
                        : formatCurrency(r.spend)}
                    </b>
                  </button>
                </div>
              ))
            )}
            <div className="cd-pager">
              <button
                disabled={page <= 1}
                onClick={() => update({ page: page - 1 })}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                disabled={!directory.data || page * 10 >= directory.data.total}
                onClick={() => update({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          </div>
          <Profile row={current} onBack={() => setMobileOpen(false)} />
        </div>
      </div>
      <Link className="cd-link" to="/admin/customers/overview">
        Account and regional overview →
      </Link>
    </section>
  );
}
