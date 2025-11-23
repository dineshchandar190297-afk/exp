import { Card } from "@/components/ui/card";

export interface CircuitEvolutionProps {
  labels: string[];
  amplitudes: { real: number; imag: number }[];
}

function amplitudeMagnitude(a: { real: number; imag: number }) {
  return Math.sqrt(a.real * a.real + a.imag * a.imag);
}

export default function CircuitEvolution({
  labels,
  amplitudes,
}: CircuitEvolutionProps) {
  if (!amplitudes.length || labels.length !== amplitudes.length) return null;

  const maxMag =
    Math.max(
      ...amplitudes.map((amp) => amplitudeMagnitude(amp))
    ) || 1;

  return (
    <Card className="mt-4 bg-card/80 border-primary/20">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">Circuit evolution</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Each glowing node shows the amplitude of a basis state after your circuit finishes.
        </p>

        <div className="flex items-end gap-4 overflow-x-auto pb-2">
          {amplitudes.map((amp, idx) => {
            const mag = amplitudeMagnitude(amp);
            const normalized = mag / maxMag;
            const circleSize = 36 + normalized * 28; // 36–64 px

            return (
              <div
                key={labels[idx]}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="relative rounded-full border border-cyan-400/60 bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.6)] animate-pulse"
                  style={{
                    width: circleSize,
                    height: circleSize,
                    boxShadow: `0 0 ${
                      18 + normalized * 20
                    }px rgba(34,211,238,${0.25 + normalized * 0.5})`,
                  }}
                >
                  <div
                    className="absolute inset-[20%] rounded-full bg-cyan-300/70 blur-sm"
                    style={{ opacity: 0.4 + normalized * 0.5 }}
                  />
                  <div className="absolute inset-0 rounded-full border border-cyan-200/40 animate-[spin_6s_linear_infinite]" />
                </div>
                <div className="text-[11px] text-cyan-100 font-mono">
                  {labels[idx]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
