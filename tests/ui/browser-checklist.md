# Browser verification checklist

- [x] First viewport exposes controls, artery selector, and Run simulation.
- [x] Searchable selector contains exact segments 1 through 55.
- [x] Nominal segment 1 run completes through Pyodide in a Web Worker.
- [x] Segment 55 at 95 bpm completes and reports its own run metadata.
- [x] Pressure and flow appear at the selected segment outlet with separate units.
- [x] BCG remains on a separate plot and axis in N.
- [x] Pressure and flow snapshots coexist on a dual-axis comparison plot.
- [x] Changing controls or artery preserves snapshots and marks displayed curves stale.
- [x] Delete one removes only its trace.
- [x] Clear all requests confirmation and removes all traces.
- [x] Production build emits relative asset URLs for GitHub Pages subpaths.
- [x] Mobile-width browser view has no unintended horizontal page scrolling.

