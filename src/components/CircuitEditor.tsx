import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import GateInfo from "./GateInfo";

export interface Gate {
  type: "H" | "X" | "Y" | "Z" | "CX" | "M";
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
  H: "#00bcd4",
  X: "#a855f7",
  Y: "#ec4899",
  Z: "#10b981",
  CX: "#f59e0b",
  M: "#ef4444",
};

const GATE_LABELS = {
  H: "H",
  X: "X",
  Y: "Y",
  Z: "Z",
  CX: "CX",
  M: "M",
};

interface CircuitEditorProps {
  onSimulate: (circuit: Circuit) => void;
  isSimulating: boolean;
}

export default function CircuitEditor({
  onSimulate,
  isSimulating,
}: CircuitEditorProps) {
  const [numQubits, setNumQubits] = useState(3);
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedGateType, setSelectedGateType] =
    useState<Gate["type"]>("H");
  const [draggedGate, setDraggedGate] = useState<{
    type: Gate["type"];
    control?: number;
  } | null>(null);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(
    null
  );

  // drag state (moving existing gates)
  const [draggingGateId, setDraggingGateId] = useState<string | null>(
    null
  );
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // NEW: popup flash card for gate explanations
  const [showGateGuide, setShowGateGuide] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const WIRE_SPACING = 80;
  const GATE_SIZE = 40;
  const TIME_SPACING = 100;
  const PADDING = 60;

  // Place new gate by clicking empty circuit area
  const handleSVGClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      // if not placing a new gate from toolbar, just clear selection
      if (!draggedGate) {
        setSelectedGateId(null);
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const qubit = Math.round((y - PADDING) / WIRE_SPACING);
      const time = Math.round((x - PADDING) / TIME_SPACING);

      if (qubit >= 0 && qubit < numQubits && time >= 0) {
        const newGate: Gate = {
          type: draggedGate.type,
          target: qubit,
          time,
          id: `${draggedGate.type}-${Date.now()}-${Math.random()}`,
        };

        if (draggedGate.type === "CX" && draggedGate.control !== undefined) {
          newGate.control = draggedGate.control;
        }

        setGates((prev) => [...prev, newGate]);
        setDraggedGate(null);
        setSelectedGateId(newGate.id);
        toast.success(`${draggedGate.type} gate added to q${qubit}`);
      }
    },
    [draggedGate, numQubits]
  );

  const handleGateTypeSelect = (type: Gate["type"]) => {
    if (type === "CX") {
      setDraggedGate({ type: "CX", control: 0 });
    } else {
      setDraggedGate({ type });
    }
    setSelectedGateType(type);
    setSelectedGateId(null);
  };

  const handleDeleteSelectedGate = () => {
    if (!selectedGateId) {
      toast.message("Select a gate to delete");
      return;
    }
    setGates((prev) => prev.filter((g) => g.id !== selectedGateId));
    setSelectedGateId(null);
    toast.success("Gate deleted");
  };

  const handleSimulateClick = () => {
    const circuit: Circuit = {
      qubits: numQubits,
      gates: gates.slice().sort((a, b) => a.time - b.time),
    };
    onSimulate(circuit);
  };

  const handleClear = () => {
    setGates([]);
    setSelectedGateId(null);
    toast.success("Circuit cleared");
  };

  const handleExport = () => {
    const circuit: Circuit = { qubits: numQubits, gates };
    const dataStr = JSON.stringify(circuit, null, 2);
    const dataBlob = new Blob([dataStr], {
      type: "application/json",
    });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quantum-circuit.json";
    link.click();
    toast.success("Circuit exported");
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const circuit = JSON.parse(
              event.target?.result as string
            ) as Circuit;
            setNumQubits(circuit.qubits);
            setGates(circuit.gates);
            setSelectedGateId(null);
            toast.success("Circuit imported");
          } catch (error) {
            toast.error("Invalid circuit file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // === DRAG & DROP LOGIC (move existing gates) ===

  const handleGateMouseDown = (
    gateId: string,
    e: React.MouseEvent<SVGGElement>
  ) => {
    e.stopPropagation();
    setDraggingGateId(gateId);

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!svgRef.current || !draggingGateId) return;
    const rect = svgRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    if (!svgRef.current || !draggingGateId || !dragPos) {
      setDraggingGateId(null);
      setDragPos(null);
      return;
    }

    const { x, y } = dragPos;
    const qubit = Math.round((y - PADDING) / WIRE_SPACING);
    const time = Math.round((x - PADDING) / TIME_SPACING);

    setGates((prev) =>
      prev.map((g) =>
        g.id === draggingGateId && qubit >= 0 && qubit < numQubits
          ? { ...g, target: qubit, time }
          : g
      )
    );

    toast.success("Gate moved!");
    setDraggingGateId(null);
    setDragPos(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingGateId, dragPos, numQubits]);

  const maxTime = Math.max(...gates.map((g) => g.time), 5);
  const svgWidth = PADDING * 2 + maxTime * TIME_SPACING + TIME_SPACING;
  const svgHeight = PADDING * 2 + (numQubits - 1) * WIRE_SPACING;

  return (
    <div className="w-full space-y-4 relative">
      {/* Top: Gate info + Gate Guide button */}
      <div className="flex items-center justify-between gap-4">
        <GateInfo selectedGate={selectedGateType} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowGateGuide(true)}
          className="flex items-center gap-2 border-primary/40 text-xs"
        >
          <HelpCircle className="w-4 h-4" />
          Gate Guide
        </Button>
      </div>

      <Card className="p-4 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {(["H", "X", "Y", "Z"] as const).map((gateType) => (
                <Button
                  key={gateType}
                  variant={
                    selectedGateType === gateType ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleGateTypeSelect(gateType)}
                  className="font-mono gooey-button"
                  style={{
                    borderColor: GATE_COLORS[gateType],
                    ...(selectedGateType === gateType
                      ? { backgroundColor: GATE_COLORS[gateType] }
                      : {}),
                  }}
                >
                  {gateType}
                </Button>
              ))}
            </div>
            <div className="flex gap-1">
              <Button
                variant={
                  selectedGateType === "CX" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleGateTypeSelect("CX")}
                className="font-mono gooey-button"
                style={{
                  borderColor: GATE_COLORS.CX,
                  ...(selectedGateType === "CX"
                    ? { backgroundColor: GATE_COLORS.CX }
                    : {}),
                }}
              >
                CX
              </Button>
              <Button
                variant={
                  selectedGateType === "M" ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleGateTypeSelect("M")}
                className="font-mono gooey-button"
                style={{
                  borderColor: GATE_COLORS.M,
                  ...(selectedGateType === "M"
                    ? { backgroundColor: GATE_COLORS.M }
                    : {}),
                }}
              >
                M
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteSelectedGate}
              disabled={!selectedGateId}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Gate
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-1" />
              Import
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={gates.length === 0}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={gates.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleSimulateClick}
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
          style={{ minWidth: "100%" }}
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
                strokeWidth={2}
                opacity={0.4}
              />
              <text
                x={20}
                y={PADDING + i * WIRE_SPACING + 5}
                fill="hsl(var(--foreground))"
                fontSize={14}
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
              strokeWidth={1}
              opacity={0.2}
              strokeDasharray="4 4"
            />
          ))}

          {/* Gates */}
          {gates.map((gate) => {
            // base snapped position
            let x = PADDING + gate.time * TIME_SPACING;
            let y = PADDING + gate.target * WIRE_SPACING;
            const isSelected = gate.id === selectedGateId;
            const isDragging = gate.id === draggingGateId && dragPos;

            // While dragging, follow mouse
            if (isDragging && dragPos) {
              x = dragPos.x;
              y = dragPos.y;
            }

            if (gate.type === "CX" && gate.control !== undefined) {
              const cy = PADDING + gate.control * WIRE_SPACING;
              const controlY =
                isDragging && dragPos
                  ? dragPos.y - (gate.target - gate.control) * WIRE_SPACING
                  : cy;

              return (
                <g
                  key={gate.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGateId(gate.id);
                  }}
                  onMouseDown={(e) => handleGateMouseDown(gate.id, e)}
                >
                  <line
                    x1={x}
                    y1={controlY}
                    x2={x}
                    y2={y}
                    stroke={GATE_COLORS.CX}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <circle cx={x} cy={controlY} r={5} fill={GATE_COLORS.CX} />
                  <circle
                    cx={x}
                    cy={y}
                    r={GATE_SIZE / 2}
                    fill="none"
                    stroke={GATE_COLORS.CX}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <line
                    x1={x}
                    y1={y - GATE_SIZE / 2}
                    x2={x}
                    y2={y + GATE_SIZE / 2}
                    stroke={GATE_COLORS.CX}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <line
                    x1={x - GATE_SIZE / 2}
                    y1={y}
                    x2={x + GATE_SIZE / 2}
                    y2={y}
                    stroke={GATE_COLORS.CX}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                </g>
              );
            }

            return (
              <g
                key={gate.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedGateId(gate.id);
                }}
                onMouseDown={(e) => handleGateMouseDown(gate.id, e)}
              >
                <rect
                  x={x - GATE_SIZE / 2}
                  y={y - GATE_SIZE / 2}
                  width={GATE_SIZE}
                  height={GATE_SIZE}
                  fill={GATE_COLORS[gate.type]}
                  opacity={isSelected ? 1 : 0.8}
                  rx={4}
                  stroke={isSelected ? "#ffffff" : "none"}
                  strokeWidth={isSelected ? 2 : 0}
                />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize={16}
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

      {/* Gate Guide Popup */}
      {showGateGuide && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-xl max-h-[80vh] overflow-y-auto bg-background/95 border-primary/40 shadow-[0_0_40px_rgba(56,189,248,0.5)]">
            <div className="flex items-start justify-between gap-4 p-4 border-b border-primary/20">
              <div>
                <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Gate Guide
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Quick flash card: what each quantum gate does.
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={() => setShowGateGuide(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4 text-sm text-muted-foreground">
              <Card className="bg-card/60 border-primary/20 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-primary mb-1">
                  Qubits in one line
                </p>
                <p>
                  A qubit can be <span className="font-mono">0</span>,{" "}
                  <span className="font-mono">1</span>, or a mix of both at
                  the same time. Gates change this mix and can create{" "}
                  <span className="text-cyan-300">superposition</span> and{" "}
                  <span className="text-purple-300">entanglement</span>.
                </p>
              </Card>

              <div className="grid gap-3 md:grid-cols-2">
                <Card className="bg-card/60 border-primary/25 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      H
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Hadamard
                    </span>
                  </div>
                  <p className="text-xs">
                    Puts a qubit into superposition. From{" "}
                    <span className="font-mono">|0?</span> to{" "}
                    <span className="font-mono">
                      ( |0? + |1? ) / v2
                    </span>
                    . Gives a 50/50 chance of measuring 0 or 1.
                  </p>
                </Card>

                <Card className="bg-card/60 border-primary/25 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      X
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Pauli-X (NOT)
                    </span>
                  </div>
                  <p className="text-xs">
                    Flips the qubit like a classical NOT gate:{" "}
                    <span className="font-mono">|0? ? |1?</span>,{" "}
                    <span className="font-mono">|1? ? |0?</span>.
                  </p>
                </Card>

                <Card className="bg-card/60 border-primary/25 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      Y
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Pauli-Y
                    </span>
                  </div>
                  <p className="text-xs">
                    Similar to X but adds a phase twist. Rotates the qubit
                    around the Y axis of the Bloch sphere.
                  </p>
                </Card>

                <Card className="bg-card/60 border-primary/25 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      Z
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Pauli-Z
                    </span>
                  </div>
                  <p className="text-xs">
                    Leaves <span className="font-mono">|0?</span> the same
                    but flips the phase of{" "}
                    <span className="font-mono">|1?</span> (adds a minus
                    sign). Controls phase information.
                  </p>
                </Card>

                <Card className="bg-card/60 border-primary/25 p-3 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      CX
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Controlled-X (CNOT)
                    </span>
                  </div>
                  <p className="text-xs">
                    Two-qubit gate: flips the{" "}
                    <span className="font-mono">target</span> only when the{" "}
                    <span className="font-mono">control</span> is{" "}
                    <span className="font-mono">1</span>. Main gate for{" "}
                    <span className="text-purple-300">entanglement</span>.
                  </p>
                  <p className="text-xs mt-1">
                    Example: H on q0, then CX (control q0, target q1) ?
                    creates an entangled Bell pair.
                  </p>
                </Card>

                <Card className="bg-card/60 border-primary/25 p-3 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold px-2 py-1 rounded-md bg-primary/20 border border-primary/40">
                      M
                    </span>
                    <span className="text-sm font-semibold text-cyan-200">
                      Measurement
                    </span>
                  </div>
                  <p className="text-xs">
                    Reads the qubit as classical 0 or 1. The results panel
                    on the right shows how often each bitstring (like{" "}
                    <span className="font-mono">|00?</span>,{" "}
                    <span className="font-mono">|11?</span>) appears.
                  </p>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

