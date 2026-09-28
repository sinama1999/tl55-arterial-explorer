import type { Quantity, SimulationResult } from "../model/contracts";
import { WaveformPlot } from "../charts/WaveformPlot";

export function WaveformPanels({ result, onAdd }: { result: SimulationResult; onAdd: (quantity: Quantity) => void }) {
  const tag = `Run ${result.runId.slice(0, 6)} · ${result.controls.hr_bpm} bpm · ${result.controls.sv_mL} mL · ${result.controls.tpr_multiplier.toFixed(2)}× TPR · ${result.controls.e_multiplier.toFixed(2)}× E`;
  return (
    <div className="results-stack">
      <section className="panel result-panel">
        <div className="panel-heading result-heading">
          <div><span className="eyebrow">Segment outlet</span><h2>{result.segment.index}. {result.segment.name}</h2><p className="run-tag">{tag}</p></div>
          <span className="complete-badge">Complete · {(result.durationMs / 1000).toFixed(2)} s</span>
        </div>
        <div className="wave-grid">
          <article className="wave-card">
            <div className="wave-title"><div><span className="signal-dot pressure" /><h3>Pressure</h3><span>mmHg</span></div><button className="add-comparison-button" onClick={() => onAdd("pressure")}>Add to comparison</button></div>
            <WaveformPlot title={`Pressure at ${result.segment.name} outlet`} traces={[{ id: "pressure", quantity: "pressure", time: result.time_s, values: result.pressure_mmHg, label: "Pressure" }]} />
          </article>
          <article className="wave-card">
            <div className="wave-title"><div><span className="signal-dot flow" /><h3>Flow</h3><span>mL/s</span></div><button className="add-comparison-button" onClick={() => onAdd("flow")}>Add to comparison</button></div>
            <WaveformPlot title={`Flow at ${result.segment.name} outlet`} traces={[{ id: "flow", quantity: "flow", time: result.time_s, values: result.flow_mL_s, label: "Flow" }]} />
          </article>
        </div>
      </section>
      <section className="panel bcg-panel half-width-plot-panel">
        <div className="panel-heading"><div><span className="eyebrow">Whole-body force</span><h2>Ballistocardiogram</h2></div><div className="bcg-actions"><span className="unit-chip">N</span><button className="add-comparison-button" onClick={() => onAdd("bcg")}>Add to comparison</button></div></div>
        <WaveformPlot title="Simulated ballistocardiogram force" traces={[{ id: "bcg", quantity: "bcg", time: result.bcg_time_s, values: result.bcg_force_N, label: "BCG force" }]} />
        <p className="field-note">Computed from the time derivative of blood momentum in all 55 arterial segments and the left ventricle, then low-pass filtered at 25 Hz.</p>
      </section>
    </div>
  );
}
