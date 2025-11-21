import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

const GATE_INFO = {
  H: {
    name: 'Hadamard Gate',
    description: 'Creates superposition by putting qubit into equal probability of |0⟩ and |1⟩',
    matrix: '1/√2 [[1, 1], [1, -1]]',
  },
  X: {
    name: 'Pauli-X Gate',
    description: 'Quantum NOT gate - flips |0⟩ to |1⟩ and vice versa',
    matrix: '[[0, 1], [1, 0]]',
  },
  Y: {
    name: 'Pauli-Y Gate',
    description: 'Rotates qubit around Y-axis by π radians',
    matrix: '[[0, -i], [i, 0]]',
  },
  Z: {
    name: 'Pauli-Z Gate',
    description: 'Flips phase of |1⟩ state, leaves |0⟩ unchanged',
    matrix: '[[1, 0], [0, -1]]',
  },
  CX: {
    name: 'Controlled-NOT Gate',
    description: 'Two-qubit gate that flips target if control is |1⟩, creates entanglement',
    matrix: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
  },
  M: {
    name: 'Measurement Gate',
    description: 'Collapses quantum state to classical bit, destroys superposition',
    matrix: 'N/A (non-unitary)',
  },
};

interface GateInfoProps {
  selectedGate: keyof typeof GATE_INFO;
}

export default function GateInfo({ selectedGate }: GateInfoProps) {
  const info = GATE_INFO[selectedGate];

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{info.name}</h3>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground font-mono bg-muted/30 p-2 rounded">
              Matrix: {info.matrix}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
