"""JSON-friendly boundary between the unchanged TL55 package and the UI."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import numpy as np

from tl55.bcg import compute_bcg_from_waveforms
from tl55.data import SEGMENTS
from tl55.solver import solve_model

NOMINAL_HR_BPM = 75.0
NOMINAL_SV_ML = 60.0
LIMITS = {
    "hr_bpm": (55.0, 95.0),
    "sv_ml": (35.0, 85.0),
    "tpr_multiplier": (0.5, 1.5),
    "e_multiplier": (0.5, 2.0),
}

# NumPy 2.4 removed the long-deprecated spelling used by the original model.
# ``trapezoid`` is the same composite trapezoidal integration routine.  Keep
# this browser-only alias here so the copied numerical package stays unchanged.
if not hasattr(np, "trapz"):
    np.trapz = np.trapezoid


def run_web_simulation(
    hr_bpm: float,
    sv_ml: float,
    tpr_multiplier: float,
    e_multiplier: float,
    segment_index: int,
    q_input_path: str | Path,
    mv_q_path: str | Path,
) -> dict[str, Any]:
    """Run TL55 and serialize one outlet plus the current-run BCG."""
    values = {
        "hr_bpm": hr_bpm,
        "sv_ml": sv_ml,
        "tpr_multiplier": tpr_multiplier,
        "e_multiplier": e_multiplier,
    }
    for name, value in values.items():
        low, high = LIMITS[name]
        if not np.isfinite(value) or not low <= value <= high:
            raise ValueError(f"{name} must be between {low:g} and {high:g}")
    if segment_index not in range(1, 56):
        raise ValueError("segment_index must be between 1 and 55")

    waveforms = solve_model(
        q_input_path=q_input_path,
        hr_rel=hr_bpm / NOMINAL_HR_BPM,
        sv_rel=sv_ml / NOMINAL_SV_ML,
        tpr_rel=tpr_multiplier,
        e_rel=e_multiplier,
    )
    bcg = compute_bcg_from_waveforms(waveforms, mv_q_path=mv_q_path)
    row = segment_index - 1
    segment = SEGMENTS[row]

    return {
        "time_s": (waveforms.time_s - waveforms.time_s[0]).astype(float).tolist(),
        "pressure_mmHg": waveforms.pressure_outlet_mmHg[row].astype(float).tolist(),
        "flow_mL_s": waveforms.flow_outlet_mL_s[row].astype(float).tolist(),
        "bcg_time_s": (bcg.time_s - bcg.time_s[0]).astype(float).tolist(),
        "bcg_force_N": bcg.bcg_force_N.astype(float).tolist(),
        "segment": {"index": segment_index, "name": segment.name},
        "controls": {
            "hr_bpm": float(hr_bpm),
            "sv_mL": float(sv_ml),
            "tpr_multiplier": float(tpr_multiplier),
            "e_multiplier": float(e_multiplier),
        },
        "sample_rate_hz": 256,
        "beat_alignment": "aortic-opening to aortic-opening; displayed time shifted to zero",
    }
