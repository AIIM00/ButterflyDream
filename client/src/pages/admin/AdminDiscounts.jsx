import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient.js";
import getApiErrorMessage from "../../utils/getApiErrorMessage.js";
const empty = { name: "", mode: "AUTOMATIC", kind: "PERCENTAGE", value: "10", code: "", active: false, startsAt: "", endsAt: "", maxRedemptions: "", includedProductIds: [], excludedProductIds: [], assignedCustomerIds: [] };
const localTime = value => {
  if (!value) return "";
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
function Selection({ label, options, selected, onChange }) {
  const [search, setSearch] = useState("");
  return <fieldset className="rounded-xl border border-brand-border p-3">
    <legend className="px-1 font-semibold">{label}</legend>
    <input aria-label={`Search ${label}`} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="mb-2 w-full rounded border p-2" />
    <div className="max-h-40 space-y-1 overflow-auto">{options.filter(o => `${o.name ?? o.fullName} ${o.email ?? ""}`.toLowerCase().includes(search.toLowerCase())).map(o =>
      <label key={o.id} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(o.id)} onChange={e => onChange(e.target.checked ? [...selected, o.id] : selected.filter(id => id !== o.id))} />{o.name ?? `${o.fullName} (${o.email})`}</label>
    )}</div>
  </fieldset>;
}
export default function AdminDiscounts() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(empty);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyName, setHistoryName] = useState("");
  async function load() {
    const response = await apiClient.get("/admin/discounts");
    setCampaigns(response.data.campaigns);
  }
  useEffect(() => {
    let active = true;
    Promise.all([apiClient.get("/admin/discounts"), apiClient.get("/admin/discounts/options")]).then(([a, b]) => {
      if (active) { setCampaigns(a.data.campaigns); setProducts(b.data.products); setCustomers(b.data.customers); }
    }).catch(e => { if (active) setError(getApiErrorMessage(e, "Unable to load campaigns.")); });
    return () => { active = false; };
  }, []);
  const field = (name, value) => setForm(f => ({ ...f, [name]: value }));
  function edit(c) {
    setForm({ ...c, startsAt: localTime(c.startsAt), endsAt: localTime(c.endsAt), maxRedemptions: c.maxRedemptions ?? "", includedProductIds: c.includedProducts.map(p => p.id), excludedProductIds: c.excludedProducts.map(p => p.id), assignedCustomerIds: c.assignedCustomers.map(p => p.id) });
    setError("");
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const payload = { ...form, code: form.mode === "AUTOMATIC" ? null : form.code,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        maxRedemptions: form.maxRedemptions === "" ? null : Number(form.maxRedemptions),
        assignedCustomerIds: form.mode === "VIP" ? form.assignedCustomerIds : [] };
      if (form.id) await apiClient.put(`/admin/discounts/${form.id}`, payload);
      else await apiClient.post("/admin/discounts", payload);
      await load(); setForm(empty);
    } catch (e) { setError(getApiErrorMessage(e, "Unable to save campaign.")); }
    finally { setBusy(false); }
  }
  async function showHistory(c) {
    setError("");
    try {
      const response = await apiClient.get(`/admin/discounts/${c.id}/redemptions`);
      setHistory(response.data.redemptions); setHistoryName(c.name);
    } catch (e) { setError(getApiErrorMessage(e, "Unable to load history.")); }
  }
  return <main className="space-y-6 text-brand-text">
    <h1 className="text-3xl font-semibold">Discounts & promotions</h1>
    <p>Schedule automatic offers or create public and assigned VIP codes. One best offer applies to merchandise; delivery is excluded.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-brand-border bg-brand-surface p-5">
      <h2 className="text-xl font-semibold">{form.id ? "Edit campaign" : "New campaign"}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>Name<input required maxLength={120} value={form.name} onChange={e => field("name", e.target.value)} className="block w-full rounded border p-2" /></label>
        <label>Mode<select value={form.mode} onChange={e => field("mode", e.target.value)} className="block w-full rounded border p-2"><option value="AUTOMATIC">Automatic seasonal offer</option><option value="CODE">Public code</option><option value="VIP">Assigned VIP code</option></select></label>
        <label>Discount type<select value={form.kind} onChange={e => field("kind", e.target.value)} className="block w-full rounded border p-2"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount (store currency)</option></select></label>
        <label>Value<input required type="number" min="0.01" step="0.01" max={form.kind === "PERCENTAGE" ? 100 : 99999999.99} value={form.value} onChange={e => field("value", e.target.value)} className="block w-full rounded border p-2" /></label>
        {form.mode !== "AUTOMATIC" && <label>Code<input required maxLength={64} value={form.code ?? ""} onChange={e => field("code", e.target.value.toUpperCase())} className="block w-full rounded border p-2" /></label>}
        <label>Usage limit (blank = unlimited)<input type="number" min="1" step="1" value={form.maxRedemptions} onChange={e => field("maxRedemptions", e.target.value)} className="block w-full rounded border p-2" /></label>
        <label>Start (your local time)<input type="datetime-local" value={form.startsAt} onChange={e => field("startsAt", e.target.value)} className="block w-full rounded border p-2" /></label>
        <label>End (your local time)<input type="datetime-local" value={form.endsAt} onChange={e => field("endsAt", e.target.value)} className="block w-full rounded border p-2" /></label>
      </div>
      <label className="flex gap-2"><input type="checkbox" checked={form.active} onChange={e => field("active", e.target.checked)} />Active (applies only within the scheduled dates)</label>
      <p className="text-sm">Leave included products empty to include all products. Exclusions always take precedence.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Selection label="Included products" options={products} selected={form.includedProductIds} onChange={v => field("includedProductIds", v)} />
        <Selection label="Excluded products" options={products} selected={form.excludedProductIds} onChange={v => field("excludedProductIds", v)} />
        {form.mode === "VIP" && <Selection label="VIP customers" options={customers} selected={form.assignedCustomerIds} onChange={v => field("assignedCustomerIds", v)} />}
      </div>
      <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-brand-primary px-5 py-2 text-white">{busy ? "Saving…" : "Save campaign"}</button><button type="button" onClick={() => setForm(empty)} className="rounded-lg border px-4 py-2">New / cancel edit</button></div>
    </form>
    <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{["Campaign", "Code", "Status / schedule", "Usage", "Actions"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{campaigns.map(c => <tr key={c.id} className="border-t border-brand-border"><td className="p-3">{c.name}<br />{c.kind === "PERCENTAGE" ? `${c.value}%` : c.value}</td><td>{c.code ?? "Automatic"}</td><td>{!c.active ? "Inactive" : c.endsAt && new Date(c.endsAt) <= new Date() ? "Expired" : c.startsAt && new Date(c.startsAt) > new Date() ? "Scheduled" : "Active"}<br />{c.startsAt && new Date(c.startsAt).toLocaleString()} → {c.endsAt ? new Date(c.endsAt).toLocaleString() : "No end"}</td><td>{c.usedCount} / {c.maxRedemptions ?? "∞"}</td><td><button onClick={() => edit(c)} className="mr-3 underline">Edit / change status</button><button onClick={() => showHistory(c)} className="underline">History</button></td></tr>)}</tbody></table></div>
    {history && <section className="rounded-xl border p-4"><h2 className="font-semibold">{historyName} — latest 100 redemptions</h2>{history.length === 0 && <p>No redemptions yet.</p>}{history.map(h => <p key={h.id} className="my-2 text-sm">{h.order.orderNumber} · {h.amount} · {new Date(h.createdAt).toLocaleString()} · {h.restoredAt ? `Restored ${new Date(h.restoredAt).toLocaleString()}` : "Used"}</p>)}</section>}
  </main>;
}
