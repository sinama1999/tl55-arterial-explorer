import { CONTROL_LIMITS, NOMINAL_CONTROLS } from "../model/parameters";
import type { SimulationControls } from "../model/contracts";

const rows: Array<{ key: keyof SimulationControls; label: string; hint: string }> = [
  { key: "hrBpm", label: "Heart rate", hint: "Beat timing" },
  { key: "svMl", label: "Stroke volume", hint: "Blood per beat" },
  { key: "tprMultiplier", label: "Peripheral resistance", hint: "Terminal load" },
  { key: "eMultiplier", label: "Arterial stiffness", hint: "Young’s modulus" },
];

export function ParameterControls({ value, onChange, disabled }: { value: SimulationControls; onChange: (value: SimulationControls) => void; disabled: boolean }) {
  return (
    <section className="panel controls-panel" aria-labelledby="controls-title">
      <div className="panel-heading">
        <div><span className="eyebrow">Physiology</span><h2 id="controls-title">Set the circulation</h2></div>
        <button className="text-button" onClick={() => onChange(NOMINAL_CONTROLS)} disabled={disabled}>Reset nominal</button>
      </div>
      <div className="control-list">
        {rows.map(({ key, label, hint }) => {
          const limits = CONTROL_LIMITS[key];
          const valueLabel = key.endsWith("Multiplier") ? `${value[key].toFixed(2)}×` : `${value[key]} ${limits.unit}`;
          return (
            <label className="control-row" key={key}>
              <span><b>{label}</b><small>{hint}</small></span>
              <output>{valueLabel}</output>
              <input type="range" min={limits.min} max={limits.max} step={limits.step} value={value[key]} disabled={disabled}
                onChange={(event) => onChange({ ...value, [key]: Number(event.target.value) })} />
              <span className="range-limits"><span>{limits.min}</span><span>{limits.max}</span></span>
            </label>
          );
        })}
      </div>
      <p className="field-note">Limits follow the manuscript for HR, SV, and TPR. The stiffness range (0.5–2.0×) brackets the reported healthy pulse-wave-velocity range while keeping the linear model in a meaningful regime.</p>
    </section>
  );
}

