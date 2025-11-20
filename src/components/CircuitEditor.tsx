import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export interface Gate {
  type: 'H' | 'X' | 'Y' | 'Z' | 'CX' | 'M';
  target: number;
  control?: number;
  time: number;
  id: string;
}

export interface Circuit {
  qubits: number;
  gates: Gate[];
}

const GATE_COLORS = {
  H: '#00bcd4',
  X: '#a855f7',
  Y: '#ec4899',
  Z: '#10b981',
  CX: '#f59e0b',
  M: '#ef4444',
};

const GATE_LABELS = {
  H: 'H',
  X: 'X',
  Y: 'Y',
  Z: 'Z',
  CX: 'CX',
  M: 'M',
};

interface CircuitEditorProps {
  onSimulate: (circuit: Circuit) => void;
  isSimulating: boolean;
}

export default function CircuitEditor({ onSimulate, isSimulating }: CircuitEditorProps) {
  const [numQubits, setNumQubits] = useState(3);
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedGateType, setSelectedGateType] = useState<Gate['type']>('H');
  const [draggedGate, setDraggedGate] = useState<{ type: Gate['type']; control?: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const WIRE_SPACING = 80;
  const GATE_SIZE = 40;
  const TIME_SPACING = 100;
  const PADDING = 60;

  const handleSVGClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !draggedGate) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate qubit and time position
    const qubit = Math.round((y - PADDING) / WIRE_SPACING);
    const time = Math.round((x - PADDING) / TIME_SPACING);

    if (qubit >= 0 && qubit < numQubits && time >= 0) {
      const newGate: Gate = {
        type: draggedGate.type,
        target: qubit,
        time: time,
        id: `${draggedGate.type}-${Date.now()}-${Math.random()}`,
      };

      if (draggedGate.type === 'CX' && draggedGate.control !== undefined) {
        newGate.control = draggedGate.control;
      }

      setGates(prev => [...prev, newGate]);
      setDraggedGate(null);
      toast.success(`${draggedGate.type} gate added to qubit ${qubit}`);
    }
  }, [draggedGate, numQubits, PADDING, WIRE_SPACING, TIME_SPACING]);

  const handleGateSelect = (type: Gate['type']) => {
    if (type === 'CX') {
      setDraggedGate({ type: 'CX', control: 0 });
    } else {
      setDraggedGate({ type });
    }
    setSelectedGateType(type);
  };

  const handleSimulate = () => {
    const circuit: Circuit = {
      qubits: numQubits,
      gates: gates.sort((a, b) => a.time - b.time),
    };
    onSimulate(circuit);
  };

  const handleClear = () => {
    setGates([]);
    toast.success('Circuit cleared');
  };

  const handleExport = () => {
    const circuit: Circuit = { qubits: numQubits, gates };
    const dataStr = JSON.stringify(circuit, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quantum-circuit.json';
    link.click();
    toast.success('Circuit exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const circuit = JSON.parse(event.target?.result as string) as Circuit;
            setNumQubits(circuit.qubits);
            setGates(circuit.gates);
            toast.success('Circuit imported');
          } catch (error) {
            toast.error('Invalid circuit file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const maxTime = Math.max(...gates.map(g => g.time), 5);
  const svgWidth = PADDING * 2 + maxTime * TIME_SPACING + TIME_SPACING;
  const svgHeight = PADDING * 2 + (numQubits - 1) * WIRE_SPACING;

  return (
    <div className="w-full space-y-4">
      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(['H', 'X', 'Y', 'Z'] as const).map((gateType) => (
                <Button
                  key={gateType}
                  variant={selectedGateType === gateType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGateSelect(gateType)}
                  className="font-mono"
                  style={{
                    borderColor: GATE_COLORS[gateType],
                    ...(selectedGateType === gateType ? { backgroundColor: GATE_COLORS[gateType] } : {}),
                  }}
                >
                  {gateType}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                variant={selectedGateType === 'CX' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGateSelect('CX')}
                className="font-mono"
                style={{
                  borderColor: GATE_COLORS.CX,
                  ...(selectedGateType === 'CX' ? { backgroundColor: GATE_COLORS.CX } : {}),
                }}
              >
                CX
              </Button>
              <Button
                variant={selectedGateType === 'M' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGateSelect('M')}
                className="font-mono"
                style={{
                  borderColor: GATE_COLORS.M,
                  ...(selectedGateType === 'M' ? { backgroundColor: GATE_COLORS.M } : {}),
                }}
              >
                M
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport} disabled={gates.length === 0}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear} disabled={gates.length === 0}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleSimulate}
              disabled={isSimulating || gates.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Simulate
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 overflow-auto">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          onClick={handleSVGClick}
          className="cursor-crosshair"
          style={{ minWidth: '100%' }}
        >
          {/* Quantum wires */}
          {Array.from({ length: numQubits }).map((_, i) => (
            <g key={`wire-${i}`}>
              <line
                x1={PADDING}
                y1={PADDING + i * WIRE_SPACING}
                x2={svgWidth - PADDING}
                y2={PADDING + i * WIRE_SPACING}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.4"
              />
              <text
                x={20}
                y={PADDING + i * WIRE_SPACING + 5}
                fill="hsl(var(--foreground))"
                fontSize="14"
                fontFamily="monospace"
              >
                q{i}
              </text>
            </g>
          ))}

          {/* Time grid lines */}
          {Array.from({ length: maxTime + 2 }).map((_, i) => (
            <line
              key={`time-${i}`}
              x1={PADDING + i * TIME_SPACING}
              y1={PADDING}
              x2={PADDING + i * TIME_SPACING}
              y2={svgHeight - PADDING}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.2"
              strokeDasharray="4 4"
            />
          ))}

          {/* Gates */}
          {gates.map((gate) => {
            const x = PADDING + gate.time * TIME_SPACING;
            const y = PADDING + gate.target * WIRE_SPACING;

            if (gate.type === 'CX' && gate.control !== undefined) {
              const cy = PADDING + gate.control * WIRE_SPACING;
              return (
                <g key={gate.id}>
                  <line
                    x1={x}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke={GATE_COLORS.CX}
                    strokeWidth="2"
                  />
                  <circle cx={x} cy={cy} r="5" fill={GATE_COLORS.CX} />
                  <circle
                    cx={x}
                    cy={y}
                    r={GATE_SIZE / 2}
                    fill="none"
                    stroke={GATE_COLORS.CX}
                    strokeWidth="2"
                  />
                  <line
                    x1={x}
                    y1={y - GATE_SIZE / 2}
                    x2={x}
                    y2={y + GATE_SIZE / 2}
                    stroke={GATE_COLORS.CX}
                    strokeWidth="2"
                  />
                  <line
                    x1={x - GATE_SIZE / 2}
                    y1={y}
                    x2={x + GATE_SIZE / 2}
                    y2={y}
                    stroke={GATE_COLORS.CX}
                    strokeWidth="2"
                  />
                </g>
              );
            }

            return (
              <g key={gate.id}>
                <rect
                  x={x - GATE_SIZE / 2}
                  y={y - GATE_SIZE / 2}
                  width={GATE_SIZE}
                  height={GATE_SIZE}
                  fill={GATE_COLORS[gate.type]}
                  opacity="0.8"
                  rx="4"
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {GATE_LABELS[gate.type]}
                </text>
              </g>
            );
          })}
        </svg>
        {draggedGate && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Click on the circuit to place a {draggedGate.type} gate
          </p>
        )}
      </Card>
    </div>
  );
}
