# TL55 Arterial Explorer

An educational static web app for the TL55 Python arterial transmission-line model. It runs the scientific Python package entirely in the visitor's browser with Pyodide inside a Web Worker, so there is no Python server and the interface stays responsive.

## Model boundary

- UI controls use physical units: heart rate (bpm) and stroke volume (mL).
- `model/web_adapter.py` converts HR and SV at the boundary using the model's nominal 75 bpm and 60 mL values.
- TPR and E are passed as relative multipliers.
- The copied model package in `model/tl55/` retains the original equations, input-waveform processing, convergence threshold, beat selection, and BCG calculation.
- The adapter returns only the selected outlet's pressure and flow, the current BCG waveform, time vectors, settings, and display metadata.
- A browser-only `np.trapz = np.trapezoid` compatibility alias is applied because the current Pyodide NumPy removed the old spelling. Both names implement the same composite trapezoidal integration; the model files are not altered.

## Input limits

| Control | Accepted range | Basis |
| --- | ---: | --- |
| HR | 55-95 bpm | physiological range stated in the manuscript |
| SV | 35-85 mL | physiological range stated in the manuscript |
| TPR | 0.5-1.5x | physiological range stated in the manuscript |
| E | 0.5-2.0x | conservative stiffness range that brackets the reported healthy pulse-wave-velocity range while keeping the linear model meaningful |

The React UI constrains these inputs and both the TypeScript and Python boundaries reject invalid values.

## Repository layout

```text
model/
  tl55/                 Original Python package copy
  data/                 Aortic and mitral .mat inputs
  web_adapter.py        Narrow JSON-friendly browser adapter
web/
  public/assets/        Supplied artery graphic (no invented path mapping)
  src/components/       Controls, selector, results, and comparisons
  src/model/            Typed contracts, limits, and exact segment names
  src/worker/           Pyodide Web Worker and client
  src/state/            Immutable comparison-trace reducer
  src/charts/           Units, colors, and responsive SVG plotting
tests/
  numerical/            Adapter-versus-direct-Python regression checks
  ui/                   Browser verification checklist
```

## Local development

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open the displayed local URL. Internet access is needed on first simulation so the worker can load pinned Pyodide 314.0.7 and its NumPy, SciPy, and pandas packages from jsDelivr. The TL55 source and `.mat` data are bundled locally.

Build the static site:

```bash
pnpm build
pnpm preview
```

The Vite base is `./`, so asset and worker URLs also work under a GitHub Pages repository subpath rather than only at `/`.

## GitHub Pages deployment

1. Create a GitHub repository for this folder and push it to the `main` branch.
2. In **Settings > Pages**, set the source to **GitHub Actions**.
3. The included `.github/workflows/deploy-pages.yml` builds and publishes `dist/`.
4. Link the resulting Pages URL from `sinama1999.github.io`.

## Verification

Browser checks completed in Chromium against the actual Pyodide worker:

- segment 1 and segment 55 simulation;
- mixed pressure/flow comparison snapshots;
- parameter and artery changes leave saved traces unchanged and mark current plots stale;
- delete one and confirmed clear-all behavior;
- separate BCG plot and axis;
- static production build with relative GitHub Pages paths.

Measured on the verification machine with a warm browser cache:

- first successful runtime initialization + nominal simulation: **5.50 s**;
- subsequent changed simulation (95 bpm, segment 55): **0.09 s**.

Cold first use depends on connection speed because Pyodide and scientific packages are downloaded once and then cached.

Run numerical regression checks in a Python environment with NumPy, SciPy, and pandas:

```bash
python tests/numerical/test_web_adapter.py
```

## Common future changes

- Control labels and limits: `web/src/model/parameters.ts` and `model/web_adapter.py`
- Exact artery names: `model/tl55/data.py`; mirror only exact upstream changes into `web/src/model/segments.ts`
- Worker/Pyodide version and package mounting: `web/src/worker/pyodide.worker.ts`
- Charts and units: `web/src/charts/`
- Comparison behavior: `web/src/state/comparisonReducer.ts` and `web/src/components/ComparisonPanel.tsx`
- Numerical equations or beat selection: update the upstream model first, document the change, then refresh `model/tl55/` and regression baselines

## Scientific note

This is an educational research model, not a diagnostic device. Pressure is shown in mmHg, flow in mL/s, BCG force in N, and each displayed beat is shifted to start at zero at its detected aortic opening.

