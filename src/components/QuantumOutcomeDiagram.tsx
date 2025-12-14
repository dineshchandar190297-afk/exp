import React from "react";

type QuantumOutcomeDiagramProps = {
  counts: Record<string, number>;
};

const QuantumOutcomeDiagram: React.FC<QuantumOutcomeDiagramProps> = ({ counts }) => {
  const entries = Object.entries(counts || {});
  if (!entries.length) return null;

  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="mt-6 rounded-xl border border-primary/30 bg-background/40 p-4">
      <h3 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Quantum outcome flow
      </h3>
      <div className="flex flex-col gap-3">
        {sorted.map(([state, count]) => {
          const prob = count / total;
          return (
            <div key={state} className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground w-16">
                |{state}&gt;
              </div>
              <div className="relative flex-1 h-2 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary/70 transition-all"
                  style={{ width: `${prob * 100}%` }}
                />
              </div>
              <div className="w-16 text-right font-mono text-xs text-muted-foreground">
                {(prob * 100).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground/80">
        Top outcomes from the simulated measurement distribution.
      </p>
    </div>
  );
};

export default QuantumOutcomeDiagram;

