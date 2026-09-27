import type { ComparisonTrace, LineStyle } from "../model/contracts";
import { WaveformPlot } from "../charts/WaveformPlot";

export function ComparisonPanel({ traces, onDelete, onClear, onColor, onStyle }: {
  traces: ComparisonTrace[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onColor: (id: string, color: string) => void;
  onStyle: (id: string, style: LineStyle) => void;
}) {
  const clear = () => {
    if (!traces.length || window.confirm(`Delete all ${traces.length} saved comparison traces?`)) onClear();
  };
  return (
    <section className="panel comparison-panel" id="comparison" aria-labelledby="comparison-title">
      <div className="panel-heading">
        <div><span className="eyebrow">Snapshots</span><h2 id="comparison-title">Compare runs</h2></div>
        <button className="text-button danger" onClick={clear} disabled={!traces.length}>Clear all</button>
      </div>
      {traces.length ? <>
        <WaveformPlot title="Saved pressure and flow comparison" traces={traces.map((trace) => ({ id: trace.id, quantity: trace.quantity, time: trace.time, values: trace.values, color: trace.color, lineStyle: trace.lineStyle, label: trace.label }))} />
        <p className="alignment-note"><b>Time alignment:</b> every trace begins at its own detected aortic opening (t = 0). Different heart rates retain their own beat duration and sample vector.</p>
        <div className="trace-list">
          {traces.map((trace) => <div className="trace-row" key={trace.id}>
            <input type="color" value={trace.color} onChange={(event) => onColor(trace.id, event.target.value)} aria-label={`Color for ${trace.label}`} />
            <span className={`quantity-pill ${trace.quantity}`}>{trace.quantity === "pressure" ? "P" : "Q"}</span>
            <span className="trace-label">{trace.label}</span>
            <select value={trace.lineStyle} onChange={(event) => onStyle(trace.id, event.target.value as LineStyle)} aria-label={`Line style for ${trace.label}`}>
              <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
            </select>
            <button className="delete-button" onClick={() => onDelete(trace.id)}>Delete</button>
          </div>)}
        </div>
      </> : <div className="comparison-empty"><div className="empty-glyph">P/Q</div><h3>No saved traces</h3><p>Run the model, then add a pressure or flow waveform. Saved traces stay unchanged as you explore new settings.</p></div>}
    </section>
  );
}

