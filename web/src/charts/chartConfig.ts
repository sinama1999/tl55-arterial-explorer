import type { LineStyle, Quantity } from "../model/contracts";

export const QUANTITY_META: Record<Quantity, { label: string; unit: string; color: string }> = {
  pressure: { label: "Pressure", unit: "mmHg", color: "#ff675d" },
  flow: { label: "Flow", unit: "mL/s", color: "#37b9c5" },
  bcg: { label: "BCG force", unit: "N", color: "#f3bd55" },
};

export const DASH: Record<LineStyle, string | undefined> = {
  solid: undefined,
  dashed: "10 7",
  dotted: "2 6",
};

export const TRACE_COLORS = ["#ff675d", "#37b9c5", "#f3bd55", "#9f8cff", "#ef88b7", "#88c67a"];
