import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StarCursor from "@/components/StarCursor";
import Logo from "@/components/Logo";
import spaceBackground from "@/assets/space-background.png";
import { supabase } from "@/integrations/supabase/client";
import QuantumAtom from "@/components/QuantumAtom";
import { Sparkles } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/simulator");
      }
    });
  }, [navigate]);

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center text-center overflow-hidden star-cursor"
      style={{
        backgroundImage: `url(${spaceBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <StarCursor />
      <Logo />

      <div className="absolute top-24 left-1/2 -translate-x-1/2 scale-[1.8] pointer-events-none z-10">
        <QuantumAtom />
      </div>

      <div className="relative z-20 mt-80 space-y-6 px-4">
        <h1 className="text-6xl md:text-8xl font-bold glow-text">
          Quantum Web
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Explore the quantum realm with our advanced circuit simulator
        </p>

        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="text-lg px-8 py-6 quantum-gradient hover:opacity-90 mt-6"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Get Started
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
    </div>
  );
}

