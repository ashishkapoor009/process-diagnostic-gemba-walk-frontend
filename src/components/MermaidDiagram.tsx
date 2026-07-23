"use client";

import { useEffect, useRef, useState } from "react";

export function MermaidDiagram({ chart, title }: { chart: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    if (!chart?.trim()) return;
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to render diagram.");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (!chart?.trim()) {
    return <p className="text-sm text-muted">No diagram available yet.</p>;
  }

  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-muted">{title}</div>
      {error ? (
        <p className="text-sm text-red-700">Could not render diagram: {error}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white p-4" ref={containerRef} />
      )}
      <button
        type="button"
        className="mt-2 text-xs font-semibold text-brand-blue"
        onClick={() => setShowSource((v) => !v)}
      >
        {showSource ? "Hide" : "View"} Mermaid source
      </button>
      {showSource && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-surface p-3 text-xs">{chart}</pre>
      )}
    </div>
  );
}
