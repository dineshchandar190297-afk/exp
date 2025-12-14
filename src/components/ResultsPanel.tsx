import { Card } from "@/components/ui/card";

export interface SimulationResult {
  counts: Record<string, number>;
  statevector: { real: number; imag: number }[];
  executionTime: number;
}

interface ResultsPanelProps {
  result: SimulationResult | null;
  isSimulating: boolean;
}

export default function ResultsPanel({ result, isSimulating }: ResultsPanelProps) {
  if (!result) {
    return (
      <Card className="p-6 bg-card/90 backdrop-blur border-primary/20 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">
          {isSimulating
            ? "Running simulation..."
            : "Design your quantum circuit and click \"Simulate\" to see results."}
        </p>
      </Card>
    );
  }

  const countsEntries = Object.entries(result.counts).sort((a, b) => b[1] - a[1]);
  const maxCount =
    countsEntries.reduce((max, [, count]) => (count > max ? count : max), 0) || 1;
  const totalShots = countsEntries.reduce((sum, [, count]) => sum + count, 0);

  const numQubits = Math.log2(result.statevector.length) || 0;

  return (
    <div className="space-y-6">
      {/* Measurement results */}
      <Card className="p-6 bg-card/90 backdrop-blur border-primary/20">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold">Measurement results</h2>
          <span className="text-xs text-muted-foreground">
            Shots: {totalShots} • Execution time: {result.executionTime} ms
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {countsEntries.map(([state, count]) => {
            const probability = totalShots ? count / totalShots : 0;
            const barWidth = (count / maxCount) * 100;

            return (
              <div key={state} className="flex items-center gap-3">
                <span className="font-mono text-xs w-14">|{state}?</span>
                <div className="flex-1 h-3 rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-purple-500"
                    style={{ width: barWidth + "%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-24 text-right">
                  {count} ({(probability * 100).toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* State vector */}
      <Card className="p-6 bg-card/90 backdrop-blur border-primary/20">
        <h2 className="text-xl font-semibold mb-4">State vector</h2>
        <div className="grid grid-cols-[auto,1fr,1fr] gap-x-4 gap-y-2 text-xs md:text-sm">
          <span className="font-semibold text-muted-foreground">Basis</span>
          <span className="font-semibold text-muted-foreground">Amplitude</span>
          <span className="font-semibold text-muted-foreground">Phase (°)</span>

          {result.statevector.map((amp, idx) => {
            const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
            const phase = (Math.atan2(amp.imag, amp.real) * 180) / Math.PI;
            const label =
              numQubits > 0
                ? "|" + idx.toString(2).padStart(numQubits, "0") + "?"
                : "|" + idx + "?";

            return (
              <div className="contents" key={idx}>
                <span className="font-mono">{label}</span>
                <span>{magnitude.toFixed(3)}</span>
                <span>{phase.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

