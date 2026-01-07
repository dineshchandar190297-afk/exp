from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.visualization import circuit_drawer
import time
import io
import base64

def build_circuit_from_json(circuit_data):
    """
    Builds a Qiskit QuantumCircuit from JSON data
    Format: { "qubits": 3, "gates": [{"type": "H", "target": 0, "time": 0}, ...] }
    """
    num_qubits = circuit_data.get('qubits', 2)
    gates = sorted(circuit_data.get('gates', []), key=lambda x: x.get('time', 0))
    
    # Create circuit with measurement
    qc = QuantumCircuit(num_qubits, num_qubits)
    
    for gate in gates:
        gate_type = gate.get('type', '')
        target = gate.get('target', 0)
        
        # Ensure target is within valid range
        if target >= num_qubits:
            continue
            
        if gate_type == 'H':
            qc.h(target)
        elif gate_type == 'X':
            qc.x(target)
        elif gate_type == 'Y':
            qc.y(target)
        elif gate_type == 'Z':
            qc.z(target)
        elif gate_type == 'S':
            qc.s(target)
        elif gate_type == 'T':
            qc.t(target)
        elif gate_type == 'CX' and 'control' in gate:
            control = gate['control']
            if control < num_qubits and control != target:
                qc.cx(control, target)
        elif gate_type == 'CZ' and 'control' in gate:
            control = gate['control']
            if control < num_qubits and control != target:
                qc.cz(control, target)
        elif gate_type == 'SWAP' and 'control' in gate:
            control = gate['control']
            if control < num_qubits and control != target:
                qc.swap(control, target)
        elif gate_type == 'M':
            qc.measure(target, target)
    
    # Add measurements if not present
    if 'M' not in [g.get('type', '') for g in gates]:
        qc.measure_all()
    
    return qc

def simulate_circuit(circuit_data, progress_callback=None):
    """
    Simulates the quantum circuit and returns results
    """
    start_time = time.time()
    
    try:
        # Build circuit
        qc = build_circuit_from_json(circuit_data)
        
        if progress_callback:
            progress_callback(25)
        
        # Run simulation
        simulator = AerSimulator()
        transpiled_circuit = transpile(qc, simulator)
        
        if progress_callback:
            progress_callback(50)
        
        # Execute with shots
        shots = circuit_data.get('shots', 1000)
        job = simulator.run(transpiled_circuit, shots=shots)
        result = job.result()
        counts = result.get_counts()
        
        if progress_callback:
            progress_callback(75)
        
        # Get statevector (without measurements)
        statevector_data = []
        try:
            # Create a copy without measurements for statevector
            qc_no_meas = build_circuit_from_json({
                'qubits': circuit_data.get('qubits', 2),
                'gates': [g for g in circuit_data.get('gates', []) if g.get('type') != 'M']
            })
            # Remove any auto-added measurements
            qc_sv = QuantumCircuit(qc_no_meas.num_qubits)
            for instruction in qc_no_meas.data:
                if instruction.operation.name != 'measure':
                    qc_sv.append(instruction.operation, instruction.qubits, instruction.clbits)
            
            qc_sv.save_statevector()
            statevector_sim = AerSimulator(method='statevector')
            sv_job = statevector_sim.run(transpile(qc_sv, statevector_sim))
            statevector = sv_job.result().get_statevector()
            statevector_data = [
                {'real': float(amp.real), 'imag': float(amp.imag)} 
                for amp in statevector
            ]
        except Exception as e:
            print(f"Statevector calculation error: {e}")
            # Return empty statevector on error
            num_qubits = circuit_data.get('qubits', 2)
            statevector_data = [{'real': 0.0, 'imag': 0.0} for _ in range(2**num_qubits)]
        
        if progress_callback:
            progress_callback(100)
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return {
            'counts': dict(counts),
            'statevector': statevector_data,
            'execution_time': execution_time,
            'shots': shots
        }
    except Exception as e:
        execution_time = int((time.time() - start_time) * 1000)
        return {
            'counts': {},
            'statevector': [],
            'execution_time': execution_time,
            'error': str(e)
        }

def render_circuit(circuit_data):
    """
    Renders circuit as SVG
    """
    try:
        qc = build_circuit_from_json(circuit_data)
        
        # Draw circuit to matplotlib figure
        fig = circuit_drawer(qc, output='mpl', style='iqp')
        
        # Convert to SVG
        buffer = io.BytesIO()
        fig.savefig(buffer, format='svg', bbox_inches='tight')
        buffer.seek(0)
        svg_data = buffer.getvalue().decode('utf-8')
        
        return svg_data
    except Exception as e:
        return f"<svg><text>Error rendering circuit: {str(e)}</text></svg>"
