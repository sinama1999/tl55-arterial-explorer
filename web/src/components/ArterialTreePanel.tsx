export function ArterialTreePanel() {
  return (
    <aside className="tree-card" aria-label="Arterial tree overview">
      <div className="tree-copy"><span className="eyebrow">Model anatomy</span><h2>One circulation. 55 connected transmission lines.</h2><p>The tree carries the inlet waveform through branching vessels and terminal Windkessel loads. Use the indexed selector for a verified outlet measurement.</p></div>
      <img src={`${import.meta.env.BASE_URL}assets/arterial-tree.svg`} alt="Human arterial tree illustration supplied with the TL55 model" />
      <div className="tree-key"><span><i className="key-line red" />Arterial paths</span><span><i className="key-line dark" />Body reference</span></div>
    </aside>
  );
}

