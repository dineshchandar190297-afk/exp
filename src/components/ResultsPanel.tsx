import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export interface SimulationResult {
  counts: Record<string, number>;
  statevector?: { real: number; imag: number }[];
  executionTime?: number;
}

interface ResultsPanelProps {
  result: SimulationResult | null;
  isSimulating: boolean;
}

export default function ResultsPanel({ result, isSimulating }: ResultsPanelProps) {
  if (isSimulating) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          />
          <p className="text-sm text-muted-foreground">Running quantum simulation...</p>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-6xl">⚛️</div>
          <p className="text-sm text-muted-foreground text-center">
            Design your quantum circuit and click "Simulate" to see results
          </p>
        </div>
      </Card>
    );
  }

  const totalShots = Object.values(result.counts).reduce((a, b) => a + b, 0);
  const sortedCounts = Object.entries(result.counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(result.counts));

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Measurement Results
        </h3>
        
        <div className="space-y-2">
          {sortedCounts.map(([state, count], index) => {
            const percentage = (count / totalShots) * 100;
            const barWidth = (count / maxCount) * 100;
            
            return (
              <motion.div
                key={state}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <code className="font-mono text-primary">|{state}⟩</code>
                  <Badge variant="secondary" className="font-mono">
                    {count} ({percentage.toFixed(1)}%)
                  </Badge>
                </div>
                <div className="h-8 bg-muted rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full bg-gradient-to-r from-primary to-quantum-purple flex items-center px-2"
                    style={{
                      boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
                    }}
                  >
                    <span className="text-xs font-bold text-white">{count}</span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {result.statevector && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            State Vector
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {result.statevector.slice(0, 8).map((amplitude, i) => {
              const magnitude = Math.sqrt(amplitude.real ** 2 + amplitude.imag ** 2);
              const phase = Math.atan2(amplitude.imag, amplitude.real);
              
              return (
                <div key={i} className="flex items-center justify-between text-sm font-mono">
                  <span className="text-primary">|{i.toString(2).padStart(3, '0')}⟩</span>
                  <span className="text-muted-foreground">
                    {magnitude.toFixed(3)} ∠ {(phase * 180 / Math.PI).toFixed(1)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result.executionTime && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Execution time: <span className="text-foreground font-mono">{result.executionTime}ms</span>
          </p>
        </div>
      )}
    </Card>
  );
}
