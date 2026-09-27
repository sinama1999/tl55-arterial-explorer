import type { SimulationControls } from "./contracts";

export const NOMINAL_CONTROLS: SimulationControls = {
  hrBpm: 75,
  svMl: 60,
  tprMultiplier: 1,
  eMultiplier: 1,
};

export const CONTROL_LIMITS = {
  hrBpm: { min: 55, max: 95, step: 1, unit: "bpm" },
  svMl: { min: 35, max: 85, step: 1, unit: "mL" },
  tprMultiplier: { min: 0.5, max: 1.5, step: 0.05, unit: "×" },
  eMultiplier: { min: 0.5, max: 2, step: 0.05, unit: "×" },
} as const;

export function validateControls(controls: SimulationControls): string[] {
  const errors: string[] = [];
  (Object.keys(CONTROL_LIMITS) as Array<keyof SimulationControls>).forEach((key) => {
    const value = controls[key];
    const { min, max } = CONTROL_LIMITS[key];
    if (!Number.isFinite(value) || value < min || value > max) {
      errors.push(`${key} must be between ${min} and ${max}.`);
    }
  });
  return errors;
}

export function toModelRelatives(controls: SimulationControls) {
  return {
    hr_rel: controls.hrBpm / 75,
    sv_rel: controls.svMl / 60,
    tpr_rel: controls.tprMultiplier,
    e_rel: controls.eMultiplier,
  };
}

