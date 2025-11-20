import { useEffect, useRef } from 'react';
import quantumAtomImg from '@/assets/quantum-atom.png';

export default function QuantumAtom() {
  const atomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!atomRef.current) return;

    let rotation = 0;
    let animationFrameId: number;

    const animate = () => {
      rotation += 0.5;
      if (atomRef.current) {
        atomRef.current.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      ref={atomRef}
      className="absolute top-1/2 left-1/2 w-[400px] h-[400px] pointer-events-none z-10"
      style={{
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))',
      }}
    >
      <img
        src={quantumAtomImg}
        alt="Quantum Atom"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
