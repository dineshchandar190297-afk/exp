import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import spaceBackground from '@/assets/space-background.png';

interface HistoryEntry {
  id: string;
  circuit_data: any;
  result_data: any;
  created_at: string;
  title: string | null;
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('simulation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error('Failed to load history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simulation_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(history.filter(h => h.id !== id));
      toast.success('Entry deleted');
    } catch (error: any) {
      toast.error('Failed to delete entry');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-8 relative"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/simulator')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Simulator
          </Button>
          <h1 className="text-4xl font-bold glow-text">Simulation History</h1>
        </div>

        {history.length === 0 ? (
          <Card className="p-12 text-center bg-card/90 backdrop-blur border-primary/20">
            <p className="text-xl text-muted-foreground">No simulations yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run your first quantum circuit to see it here!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id} className="p-6 bg-card/90 backdrop-blur border-primary/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {entry.title || 'Quantum Circuit'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(entry.created_at)}
                      </div>
                      <div>
                        {entry.circuit_data.qubits} qubits
                      </div>
                      <div>
                        {entry.circuit_data.gates.length} gates
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Execution time: {entry.result_data.executionTime}ms
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

