import React from "react";

interface BlochDialProps {
  angle: number;
}

export default function BlochDial({ angle }: BlochDialProps) {
  const size = 140;
  const radius = size / 2 - 10;
  const rad = (angle * Math.PI) / 180;

  const x = radius * Math.sin(rad) + size / 2;
  const y = radius * -Math.cos(rad) + size / 2;

  return (
    <div className="flex flex-col items-center gap-2 opacity-90">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="rgba(0, 217, 255, 0.12)"
          stroke="cyan"
          strokeWidth="3"
        />
        <line
          x1={size / 2}
          y1={size / 2}
          x2={x}
          y2={y}
          stroke="cyan"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={x} cy={y} r={6} fill="cyan" />
      </svg>
      <p className="text-cyan-300 font-mono text-sm">Θ = {angle.toFixed(1)}°</p>
    </div>
  );
}
