import type { ComparisonTrace, LineStyle } from "../model/contracts";

export type ComparisonAction =
  | { type: "add"; trace: ComparisonTrace }
  | { type: "delete"; id: string }
  | { type: "clear" }
  | { type: "color"; id: string; color: string }
  | { type: "style"; id: string; lineStyle: LineStyle };

export function comparisonReducer(state: ComparisonTrace[], action: ComparisonAction): ComparisonTrace[] {
  switch (action.type) {
    case "add": return [...state, action.trace];
    case "delete": return state.filter((trace) => trace.id !== action.id);
    case "clear": return [];
    case "color": return state.map((trace) => trace.id === action.id ? { ...trace, color: action.color } : trace);
    case "style": return state.map((trace) => trace.id === action.id ? { ...trace, lineStyle: action.lineStyle } : trace);
  }
}

