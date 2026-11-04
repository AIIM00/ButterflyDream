import { useState } from "react";
export default function PromoCode({ code, onChange, busy = false }) {
  const [draft, setDraft] = useState(code ?? "");
  return <div className="my-4 space-y-2">
    <label htmlFor="promo-code" className="block text-sm font-semibold">Promotional code</label>
    <div className="flex gap-2">
      <input id="promo-code" value={draft} onChange={event => setDraft(event.target.value)} maxLength={64}
        autoComplete="off" placeholder="Enter code" className="min-w-0 flex-1 rounded-lg border border-brand-border bg-brand-surface p-2 text-brand-text" />
      <button type="button" disabled={busy} onClick={() => onChange(draft.trim().toUpperCase())}
        className="rounded-lg border border-current px-3 disabled:opacity-50">Apply</button>
      {code && <button type="button" disabled={busy} onClick={() => { setDraft(""); onChange(""); }}
        className="text-sm underline">Remove</button>}
    </div>
    <p className="text-xs">The best eligible offer applies. Offers cannot be combined.</p>
    {code && <p className="text-xs">Code: {code}</p>}
  </div>;
}
