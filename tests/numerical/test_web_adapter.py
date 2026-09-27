"""Numerical regression: browser adapter output must equal direct TL55 output."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "model"))

if not hasattr(np, "trapz"):
    np.trapz = np.trapezoid

from tl55.bcg import compute_bcg_from_waveforms
from tl55.solver import solve_model
from web_adapter import run_web_simulation

Q_PATH = ROOT / "model" / "data" / "Q_inputwave2.mat"
MV_PATH = ROOT / "model" / "data" / "MV_Q_padded_2.mat"


class WebAdapterRegression(unittest.TestCase):
    def check_case(self, hr, sv, tpr, e, segment):
        direct = solve_model(
            q_input_path=Q_PATH,
            hr_rel=hr / 75.0,
            sv_rel=sv / 60.0,
            tpr_rel=tpr,
            e_rel=e,
        )
        direct_bcg = compute_bcg_from_waveforms(direct, mv_q_path=MV_PATH)
        adapted = run_web_simulation(hr, sv, tpr, e, segment, Q_PATH, MV_PATH)
        row = segment - 1
        np.testing.assert_allclose(adapted["time_s"], direct.time_s - direct.time_s[0], rtol=1e-12, atol=1e-12)
        np.testing.assert_allclose(adapted["pressure_mmHg"], direct.pressure_outlet_mmHg[row], rtol=1e-12, atol=1e-12)
        np.testing.assert_allclose(adapted["flow_mL_s"], direct.flow_outlet_mL_s[row], rtol=1e-12, atol=1e-12)
        np.testing.assert_allclose(adapted["bcg_force_N"], direct_bcg.bcg_force_N, rtol=1e-12, atol=1e-12)

    def test_nominal_segment_1(self):
        self.check_case(75, 60, 1.0, 1.0, 1)

    def test_changed_segment_55(self):
        self.check_case(95, 85, 1.5, 2.0, 55)

    def test_changed_midrange(self):
        self.check_case(65, 47.5, 0.75, 1.35, 38)

    def test_invalid_inputs_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "hr_bpm"):
            run_web_simulation(20, 60, 1.0, 1.0, 1, Q_PATH, MV_PATH)
        with self.assertRaisesRegex(ValueError, "segment_index"):
            run_web_simulation(75, 60, 1.0, 1.0, 56, Q_PATH, MV_PATH)


if __name__ == "__main__":
    unittest.main()

