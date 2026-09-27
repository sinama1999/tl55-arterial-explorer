export type SimulationControls = {
  hrBpm: number;
  svMl: number;
  tprMultiplier: number;
  eMultiplier: number;
};

export type Segment = { index: number; name: string };

export type SimulationResult = {
  time_s: number[];
  pressure_mmHg: number[];
  flow_mL_s: number[];
  bcg_time_s: number[];
  bcg_force_N: number[];
  segment: Segment;
  controls: {
    hr_bpm: number;
    sv_mL: number;
    tpr_multiplier: number;
    e_multiplier: number;
  };
  sample_rate_hz: number;
  beat_alignment: string;
  runId: string;
  completedAt: string;
  durationMs: number;
};

export type Quantity = "pressure" | "flow";
export type LineStyle = "solid" | "dashed" | "dotted";

export type ComparisonTrace = {
  id: string;
  quantity: Quantity;
  time: readonly number[];
  values: readonly number[];
  segment: Segment;
  controls: Readonly<SimulationControls>;
  label: string;
  color: string;
  lineStyle: LineStyle;
};

export type WorkerRequest = {
  id: string;
  type: "run";
  controls: SimulationControls;
  segmentIndex: number;
};

export type WorkerResponse =
  | { id: string; type: "status"; message: string }
  | { id: string; type: "result"; result: Omit<SimulationResult, "runId" | "completedAt" | "durationMs">; durationMs: number }
  | { id: string; type: "error"; message: string };

