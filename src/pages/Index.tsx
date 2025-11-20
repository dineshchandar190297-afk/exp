import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import BlackHole from '@/components/BlackHole';
import CircuitEditor, { Circuit } from '@/components/CircuitEditor';
import ResultsPanel, { SimulationResult } from '@/components/ResultsPanel';
import { Atom, Github, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const [isPaused, setIsPaused] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Mock simulation function - replace with actual backend call
  const handleSimulate = async (circuit: Circuit) => {
    setIsSimulating(true);
    setResult(null);
    
    toast.info('Running quantum simulation...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results based on circuit
    const numQubits = circuit.qubits;
    const numStates = Math.pow(2, numQubits);
    const counts: Record<string, number> = {};
    
    // Generate random measurement results
    for (let i = 0; i < 1000; i++) {
      const state = Math.floor(Math.random() * numStates)
        .toString(2)
        .padStart(numQubits, '0');
      counts[state] = (counts[state] || 0) + 1;
    }
    
    // Generate mock statevector
    const statevector = Array.from({ length: numStates }, () => ({
      real: (Math.random() - 0.5) * 2,
      imag: (Math.random() - 0.5) * 2,
    }));
    
    // Normalize statevector
    const norm = Math.sqrt(
      statevector.reduce((sum, amp) => sum + amp.real ** 2 + amp.imag ** 2, 0)
    );
    statevector.forEach(amp => {
      amp.real /= norm;
      amp.imag /= norm;
    });
    
    setResult({
      counts,
      statevector,
      executionTime: 156 + Math.floor(Math.random() * 100),
    });
    
    setIsSimulating(false);
    toast.success('Simulation complete!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Black Hole */}
      <header className="relative h-[400px] overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10" />
        <div className="absolute inset-0">
          <Suspense fallback={<div className="w-full h-full bg-card animate-pulse" />}>
            <BlackHole isPaused={isPaused} />
          </Suspense>
        </div>
        
        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <Atom className="w-12 h-12 text-primary animate-spin-slow" />
            <h1 className="text-5xl font-bold glow-text">
              Quantum Web
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
            Design, simulate, and visualize quantum circuits with an immersive black hole interface
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-card/80 backdrop-blur px-4 py-2 rounded-lg border border-primary/20">
              <Switch
                id="animation-control"
                checked={!isPaused}
                onCheckedChange={(checked) => setIsPaused(!checked)}
              />
              <Label htmlFor="animation-control" className="cursor-pointer">
                {isPaused ? 'Resume Animation' : 'Pause Animation'}
              </Label>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Docs
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Circuit Editor - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-card/30 backdrop-blur border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Circuit Designer</h2>
                  <p className="text-sm text-muted-foreground">
                    Select gates and click on the canvas to build your quantum circuit
                  </p>
                </div>
              </div>
            </Card>
            
            <CircuitEditor onSimulate={handleSimulate} isSimulating={isSimulating} />
            
            {/* Integration Info */}
            <Card className="p-4 bg-card/30 backdrop-blur border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>🔌</span>
                Backend Integration
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Currently using mock simulation data. To connect a real Qiskit backend:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Deploy the Python Flask backend (see README)</li>
                <li>Update API endpoint in the code</li>
                <li>Run real quantum simulations with Qiskit</li>
              </ol>
            </Card>
          </div>

          {/* Results Panel - Takes 1 column */}
          <div className="space-y-4">
            <Card className="p-6 bg-card/30 backdrop-blur border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-quantum-purple/20 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Results</h2>
                  <p className="text-sm text-muted-foreground">
                    Measurement outcomes and state vectors
                  </p>
                </div>
              </div>
            </Card>
            
            <ResultsPanel result={result} isSimulating={isSimulating} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with React, Three.js, and Qiskit • Quantum Computing Visualization</p>
        </div>
      </footer>
    </div>
  );
}
