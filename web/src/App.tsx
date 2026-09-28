import { useMemo, useReducer, useState } from "react";
import { ArterialTreePanel } from "./components/ArterialTreePanel";
import { ArterySelector } from "./components/ArterySelector";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { ParameterControls } from "./components/ParameterControls";
import { WaveformPanels } from "./components/WaveformPanels";
import { TRACE_COLORS } from "./charts/chartConfig";
import type { ComparisonTrace, Quantity, SimulationControls } from "./model/contracts";
import { NOMINAL_CONTROLS, validateControls } from "./model/parameters";
import { SEGMENTS } from "./model/segments";
import { comparisonReducer } from "./state/comparisonReducer";
import { runSimulation } from "./worker/client";

export default function App() {
  const [controls, setControls] = useState<SimulationControls>(NOMINAL_CONTROLS);
  const [segmentIndex, setSegmentIndex] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof runSimulation>> | null>(null);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [traces, dispatch] = useReducer(comparisonReducer, []);
  const validationErrors = useMemo(() => validateControls(controls), [controls]);
  const selected = SEGMENTS[segmentIndex - 1];
  const stale = Boolean(result && (
    result.segment.index !== segmentIndex ||
    result.controls.hr_bpm !== controls.hrBpm || result.controls.sv_mL !== controls.svMl ||
    result.controls.tpr_multiplier !== controls.tprMultiplier || result.controls.e_multiplier !== controls.eMultiplier
  ));

  const run = async () => {
    if (validationErrors.length) { setError(validationErrors.join(" ")); return; }
    setRunning(true); setError(null);
    try {
      const next = await runSimulation(controls, segmentIndex, setStatus);
      setResult(next); setStatus("Simulation complete");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setStatus("Simulation failed");
    } finally { setRunning(false); }
  };

  const addTrace = (quantity: Quantity) => {
    if (!result) return;
    const id = crypto.randomUUID();
    const modelControls: SimulationControls = {
      hrBpm: result.controls.hr_bpm, svMl: result.controls.sv_mL,
      tprMultiplier: result.controls.tpr_multiplier, eMultiplier: result.controls.e_multiplier,
    };
    const quantityLabel = { pressure: "P", flow: "Q", bcg: "BCG" }[quantity];
    const locationLabel = quantity === "bcg" ? "whole-body force" : `${result.segment.index} ${result.segment.name}`;
    const time = quantity === "bcg" ? result.bcg_time_s : result.time_s;
    const values = quantity === "pressure"
      ? result.pressure_mmHg
      : quantity === "flow"
        ? result.flow_mL_s
        : result.bcg_force_N;
    const label = `${quantityLabel} | ${locationLabel} | HR ${modelControls.hrBpm} bpm | SV ${modelControls.svMl} mL | TPR ${modelControls.tprMultiplier.toFixed(1)} | E ${modelControls.eMultiplier.toFixed(1)}`;
    const trace: ComparisonTrace = Object.freeze({
      id, quantity,
      time: Object.freeze([...time]),
      values: Object.freeze([...values]),
      segment: Object.freeze({ ...result.segment }), controls: Object.freeze(modelControls), label,
      color: TRACE_COLORS[traces.length % TRACE_COLORS.length], lineStyle: "solid",
    });
    dispatch({ type: "add", trace });
  };

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="TL55 Arterial Explorer home"><span className="brand-mark">55</span><span><b>TL55</b><small>Arterial Explorer</small></span></a>
        <nav aria-label="Page sections"><a href="#workspace">Simulator</a><a href="#comparison">Comparison <span>{traces.length}</span></a><a href="#about">Model notes</a></nav>
      </header>

      <div className="page-shell" id="top">
        <section className="intro" id="workspace">
          <div><span className="kicker">Interactive cardiovascular model</span><h1>Follow a pulse through the arterial tree.</h1><p>Adjust four physiological properties, solve the original 55-segment transmission-line model in your browser, and inspect pressure, flow, and BCG force over one beat.</p></div>
          <div className="runtime-note"><span className="runtime-dot" />Python runs locally in this tab</div>
        </section>

        <section className="workspace-grid">
          <div className="setup-stack">
            <ParameterControls value={controls} onChange={setControls} disabled={running} />
            <ArterySelector value={segmentIndex} onChange={setSegmentIndex} disabled={running} />
            <div className="run-bar">
              <div><b>{selected.index}. {selected.name}</b><span>segment outlet</span></div>
              <button className="run-button" onClick={run} disabled={running || Boolean(validationErrors.length)}>{running ? <><i className="spinner" /> Running…</> : "Run simulation"}</button>
            </div>
            <div className={`status-strip ${error ? "error" : running ? "loading" : ""}`} role="status" aria-live="polite">
              <span>{error ? "!" : running ? "…" : "✓"}</span><p><b>{error ? "Could not run" : status}</b>{error ? error : running ? " The interface stays responsive while the worker solves the model." : " Choose settings, then run explicitly."}</p>
            </div>
          </div>
          <ArterialTreePanel />
        </section>

        {stale && <div className="stale-banner">Settings changed. The curves below still belong to run <b>{result?.runId.slice(0, 6)}</b>; select <b>Run simulation</b> to update them.</div>}
        {result ? <WaveformPanels result={result} onAdd={addTrace} /> : <section className="panel awaiting"><span className="pulse-icon">∿</span><div><h2>Your first beat is ready to run</h2><p>Nominal settings are loaded. The first run also downloads the scientific Python runtime; later runs are much faster.</p></div></section>}

        <ComparisonPanel traces={traces} onDelete={(id) => dispatch({ type: "delete", id })} onClear={() => dispatch({ type: "clear" })} onColor={(id, color) => dispatch({ type: "color", id, color })} onStyle={(id, lineStyle) => dispatch({ type: "style", id, lineStyle })} />

        <section className="model-notes" id="about">
          <div><span className="eyebrow">How to read the model</span><h2>From inlet flow to observable waves</h2></div>
          <ol><li><b>Shape the inlet.</b><span>Heart rate warps systole and diastole; stroke volume rescales the area under aortic inflow.</span></li><li><b>Solve the network.</b><span>Frequency-domain transmission lines and terminal Windkessel loads propagate and reflect the pulse through 55 segments.</span></li><li><b>Select a steady beat.</b><span>The first pressure-converged beat is trimmed from aortic opening to the next aortic opening and shifted to t = 0 for display.</span></li><li><b>Compute BCG force.</b><span>Blood-momentum changes in every artery and the left ventricle are summed and filtered at 25 Hz.</span></li></ol>
          <p className="citation">Research model for education—not a diagnostic device. Based on Masoumi Shahrbabak et al., <i>IEEE Transactions on Biomedical Engineering</i> (2026), and He, Xiao & Liu (2012).</p>
        </section>
      </div>
    </main>
  );
}
