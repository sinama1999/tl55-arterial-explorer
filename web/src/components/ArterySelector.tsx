import { useMemo, useState } from "react";
import { SEGMENTS } from "../model/segments";

export function ArterySelector({ value, onChange, disabled }: { value: number; onChange: (index: number) => void; disabled: boolean }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SEGMENTS.filter((segment) => !needle || segment.name.toLowerCase().includes(needle) || String(segment.index) === needle);
  }, [query]);
  return (
    <section className="panel artery-panel" aria-labelledby="artery-title">
      <div className="panel-heading"><div><span className="eyebrow">Measurement site</span><h2 id="artery-title">Choose a segment outlet</h2></div><span className="count-badge">55 arteries</span></div>
      <label className="search-field"><span className="sr-only">Search arteries</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search number or artery name…" /></label>
      <select className="artery-select" value={value} onChange={(event) => onChange(Number(event.target.value))} disabled={disabled} size={6} aria-label="Arterial segment">
        {filtered.map((segment) => <option key={segment.index} value={segment.index}>{segment.index.toString().padStart(2, "0")} · {segment.name}</option>)}
      </select>
      <p className="field-note">Selection uses the exact model index and name. The anatomical graphic is intentionally not clickable because its paths have no verified segment mapping.</p>
    </section>
  );
}

