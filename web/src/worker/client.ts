import type { SimulationControls, SimulationResult, WorkerRequest, WorkerResponse } from "../model/contracts";

let worker: Worker | null = null;

function getWorker() {
  worker ??= new Worker(new URL("./pyodide.worker.ts", import.meta.url), { type: "module" });
  return worker;
}

export function runSimulation(
  controls: SimulationControls,
  segmentIndex: number,
  onStatus: (message: string) => void,
): Promise<SimulationResult> {
  const activeWorker = getWorker();
  const id = crypto.randomUUID();
  const request: WorkerRequest = { id, type: "run", controls, segmentIndex };

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      if (event.data.type === "status") onStatus(event.data.message);
      if (event.data.type === "error") {
        activeWorker.removeEventListener("message", handler);
        reject(new Error(event.data.message));
      }
      if (event.data.type === "result") {
        activeWorker.removeEventListener("message", handler);
        resolve({
          ...event.data.result,
          runId: id,
          completedAt: new Date().toISOString(),
          durationMs: event.data.durationMs,
        });
      }
    };
    activeWorker.addEventListener("message", handler);
    activeWorker.postMessage(request);
  });
}

