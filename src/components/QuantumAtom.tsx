import { useEffect, useRef } from "react";
import quantumAtomImg from "@/assets/quantum-atom.png";

export default function QuantumAtom() {
  const atomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frameId: number;
    let angle = 0;

    const animate = () => {
      angle += 0.4;
      if (atomRef.current) {
        atomRef.current.style.transform = `rotate(${angle}deg)`;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-[260px] h-[260px] flex items-center justify-center">
      <div
        ref={atomRef}
        className="w-full h-full rounded-full overflow-visible"
        style={{
          filter: "drop-shadow(0 0 30px rgba(129, 230, 217, 0.8))",
        }}
      >
        <img
          src={quantumAtomImg}
          alt="Quantum Atom"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

