import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import QuantumAtom from '@/components/QuantumAtom';
import spaceBackground from '@/assets/space-background.png';
import { Sparkles } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/simulator');
      }
    });
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden star-cursor"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />
      
      {/* Quantum Atom centered and lower */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <QuantumAtom />
      </div>

      {/* Main Content */}
      <div className="relative z-20 text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold glow-text">
            Quantum Web
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore the quantum realm with our advanced circuit simulator
          </p>
        </div>

        <Button 
          size="lg"
          onClick={() => navigate('/auth')}
          className="text-lg px-8 py-6 quantum-gradient hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  );
}
