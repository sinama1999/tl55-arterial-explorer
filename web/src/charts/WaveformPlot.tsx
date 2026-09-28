import { useMemo } from "react";
import { DASH, QUANTITY_META } from "./chartConfig";
import type { LineStyle, Quantity } from "../model/contracts";

export type PlotTrace = {
  id: string;
  quantity: Quantity;
  time: readonly number[];
  values: readonly number[];
  color?: string;
  lineStyle?: LineStyle;
  label: string;
};

const W = 900;
const H = 270;
const M = { top: 18, right: 70, bottom: 45, left: 70 };

function extent(values: number[]) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.12;
  return [lo - pad, hi + pad] as const;
}

function ticks(lo: number, hi: number, count = 5) {
  return Array.from({ length: count }, (_, i) => lo + (hi - lo) * i / (count - 1));
}

export function WaveformPlot({ traces, title }: { traces: PlotTrace[]; title: string }) {
  const model = useMemo(() => {
    const allTimes = traces.flatMap((trace) => [...trace.time]);
    const maxTime = Math.max(...allTimes, 1);
    const groups = new Map<string, number[]>();
    traces.forEach((trace) => groups.set(trace.quantity, [...(groups.get(trace.quantity) ?? []), ...trace.values]));
    const domains = new Map<string, readonly [number, number]>();
    groups.forEach((values, key) => domains.set(key, extent(values)));
    return { maxTime, domains };
  }, [traces]);

  if (!traces.length) return <div className="plot-empty">No traces yet.</div>;
  const quantities = [...new Set(traces.map((trace) => trace.quantity))];
  const primary = quantities[0];
  const secondary = quantities[1];
  const x = (time: number) => M.left + time / model.maxTime * (W - M.left - M.right);
  const y = (value: number, quantity: string) => {
    const [lo, hi] = model.domains.get(quantity)!;
    return H - M.bottom - (value - lo) / (hi - lo) * (H - M.top - M.bottom);
  };

  return (
    <div className="plot-wrap">
      <svg className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <title>{title}</title>
        {ticks(0, model.maxTime, 6).map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} x2={x(tick)} y1={M.top} y2={H - M.bottom} className="grid-line" />
            <text x={x(tick)} y={H - 18} textAnchor="middle" className="tick-label">{tick.toFixed(2)}</text>
          </g>
        ))}
        {ticks(...model.domains.get(primary)!).map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={M.left} x2={W - M.right} y1={y(tick, primary)} y2={y(tick, primary)} className="grid-line" />
            <text x={M.left - 10} y={y(tick, primary) + 4} textAnchor="end" className="tick-label">{tick.toFixed(1)}</text>
          </g>
        ))}
        {secondary && ticks(...model.domains.get(secondary)!).map((tick) => (
          <text key={`yr-${tick}`} x={W - M.right + 10} y={y(tick, secondary) + 4} className="tick-label">{tick.toFixed(1)}</text>
        ))}
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="axis-line" />
        {traces.map((trace) => {
          const length = Math.min(trace.time.length, trace.values.length);
          const points = Array.from({ length }, (_, i) => `${x(trace.time[i]).toFixed(2)},${y(trace.values[i], trace.quantity).toFixed(2)}`).join(" ");
          return <polyline key={trace.id} points={points} fill="none" stroke={trace.color ?? QUANTITY_META[trace.quantity].color} strokeWidth="2.5" strokeDasharray={DASH[trace.lineStyle ?? "solid"]} strokeLinecap="round" strokeLinejoin="round" />;
        })}
        <text x={(M.left + W - M.right) / 2} y={H - 2} textAnchor="middle" className="axis-label">Time within beat (s)</text>
        <text transform={`translate(17 ${(M.top + H - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="axis-label">{QUANTITY_META[primary].label} ({QUANTITY_META[primary].unit})</text>
        {secondary && <text transform={`translate(${W - 12} ${(M.top + H - M.bottom) / 2}) rotate(90)`} textAnchor="middle" className="axis-label">{QUANTITY_META[secondary].label} ({QUANTITY_META[secondary].unit})</text>}
      </svg>
    </div>
  );
}
