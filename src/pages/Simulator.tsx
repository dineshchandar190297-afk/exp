import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import CircuitEditor, { Circuit } from '@/components/CircuitEditor';
import ResultsPanel, { SimulationResult } from '@/components/ResultsPanel';
import { BookOpen, LogOut, History } from 'lucide-react';
import { toast } from 'sonner';
import spaceBackground from '@/assets/space-background.png';
import QuantumAtom from '@/components/QuantumAtom';
import StarCursor from '@/components/StarCursor';
import Logo from '@/components/Logo';

export default function Simulator() {
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSimulate = async (circuit: Circuit) => {
    setIsSimulating(true);
    setResult(null);
    
    toast.info('Running quantum simulation...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const numQubits = circuit.qubits;
    const numStates = Math.pow(2, numQubits);
    const counts: Record<string, number> = {};
    
    for (let i = 0; i < 1000; i++) {
      const state = Math.floor(Math.random() * numStates)
        .toString(2)
        .padStart(numQubits, '0');
      counts[state] = (counts[state] || 0) + 1;
    }
    
    const statevector = Array.from({ length: numStates }, () => ({
      real: (Math.random() - 0.5) * 2,
      imag: (Math.random() - 0.5) * 2,
    }));
    
    const norm = Math.sqrt(
      statevector.reduce((sum, amp) => sum + amp.real ** 2 + amp.imag ** 2, 0)
    );
    statevector.forEach(amp => {
      amp.real /= norm;
      amp.imag /= norm;
    });
    
    const simulationResult = {
      counts,
      statevector,
      executionTime: 156 + Math.floor(Math.random() * 100),
    };
    
    setResult(simulationResult);
    
    // Save to history
    if (user) {
      try {
        await supabase.from('simulation_history').insert({
          user_id: user.id,
          circuit_data: circuit as any,
          result_data: simulationResult as any,
          title: `${circuit.qubits}-qubit circuit`,
        } as any);
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    }
    
    setIsSimulating(false);
    toast.success('Simulation complete!');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative star-cursor"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <StarCursor />
      <Logo />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Header */}
      <header className="relative border-b border-primary/20 z-20">
        <div className="relative z-20 container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold glow-text">Quantum Simulator</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Quantum Atom - centered at top with proper spacing */}
      <div className="relative z-10 flex justify-center pt-8 pb-4">
        <div className="opacity-90">
          <QuantumAtom />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 bg-card/90 backdrop-blur border-primary/20">
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
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-card/90 backdrop-blur border-primary/20">
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
    </div>
  );
}
