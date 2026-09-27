/// <reference lib="webworker" />

import adapterSource from "../../../model/web_adapter.py?raw";
import initSource from "../../../model/tl55/__init__.py?raw";
import apiSource from "../../../model/tl55/api.py?raw";
import bcgSource from "../../../model/tl55/bcg.py?raw";
import constantsSource from "../../../model/tl55/constants.py?raw";
import dataSource from "../../../model/tl55/data.py?raw";
import impedanceSource from "../../../model/tl55/impedance.py?raw";
import inputFlowSource from "../../../model/tl55/input_flow.py?raw";
import leftVentricleSource from "../../../model/tl55/left_ventricle.py?raw";
import solverSource from "../../../model/tl55/solver.py?raw";
import qInputUrl from "../../../model/data/Q_inputwave2.mat?url";
import mvInputUrl from "../../../model/data/MV_Q_padded_2.mat?url";
import type { WorkerRequest, WorkerResponse } from "../model/contracts";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
const PYODIDE_MODULE = `${PYODIDE_BASE}pyodide.mjs`;

type Pyodide = {
  FS: { mkdirTree(path: string): void; writeFile(path: string, data: string | Uint8Array): void };
  globals: { set(key: string, value: unknown): void; delete(key: string): void };
  loadPackage(packages: string[]): Promise<void>;
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
};

const pythonFiles: Record<string, string> = {
  "/model/web_adapter.py": adapterSource,
  "/model/tl55/__init__.py": initSource,
  "/model/tl55/api.py": apiSource,
  "/model/tl55/bcg.py": bcgSource,
  "/model/tl55/constants.py": constantsSource,
  "/model/tl55/data.py": dataSource,
  "/model/tl55/impedance.py": impedanceSource,
  "/model/tl55/input_flow.py": inputFlowSource,
  "/model/tl55/left_ventricle.py": leftVentricleSource,
  "/model/tl55/solver.py": solverSource,
};

function status(id: string, message: string) {
  self.postMessage({ id, type: "status", message } satisfies WorkerResponse);
}

let runtimePromise: Promise<Pyodide> | null = null;

async function initialize(id: string): Promise<Pyodide> {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      status(id, "Loading the in-browser Python runtime…");
      const pyodideModule = await import(/* @vite-ignore */ PYODIDE_MODULE) as {
        loadPyodide(options: { indexURL: string }): Promise<Pyodide>;
      };
      const pyodide = await pyodideModule.loadPyodide({ indexURL: PYODIDE_BASE });
      status(id, "Loading NumPy, SciPy, and pandas…");
      await pyodide.loadPackage(["numpy", "scipy", "pandas"]);

      pyodide.FS.mkdirTree("/model/tl55");
      pyodide.FS.mkdirTree("/data");
      Object.entries(pythonFiles).forEach(([path, source]) => pyodide.FS.writeFile(path, source));

      status(id, "Mounting the aortic and mitral input waveforms…");
      const [qResponse, mvResponse] = await Promise.all([fetch(qInputUrl), fetch(mvInputUrl)]);
      if (!qResponse.ok || !mvResponse.ok) throw new Error("Could not load the bundled model input files.");
      pyodide.FS.writeFile("/data/Q_inputwave2.mat", new Uint8Array(await qResponse.arrayBuffer()));
      pyodide.FS.writeFile("/data/MV_Q_padded_2.mat", new Uint8Array(await mvResponse.arrayBuffer()));
      pyodide.runPython("import sys; sys.path.insert(0, '/model'); import web_adapter");
      return pyodide;
    })();
  }
  return runtimePromise;
}

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, controls, segmentIndex } = event.data;
  try {
    const started = performance.now();
    const pyodide = await initialize(id);
    status(id, "Solving the 55-segment arterial tree…");
    pyodide.globals.set("request_json", JSON.stringify({
      hr_bpm: controls.hrBpm,
      sv_ml: controls.svMl,
      tpr_multiplier: controls.tprMultiplier,
      e_multiplier: controls.eMultiplier,
      segment_index: segmentIndex,
    }));
    const json = await pyodide.runPythonAsync(`
import json
params = json.loads(request_json)
json.dumps(web_adapter.run_web_simulation(
    **params,
    q_input_path="/data/Q_inputwave2.mat",
    mv_q_path="/data/MV_Q_padded_2.mat",
))
    `);
    pyodide.globals.delete("request_json");
    self.postMessage({
      id,
      type: "result",
      result: JSON.parse(String(json)),
      durationMs: performance.now() - started,
    } satisfies WorkerResponse);
  } catch (error) {
    runtimePromise = null;
    self.postMessage({
      id,
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    } satisfies WorkerResponse);
  }
});

export {};

