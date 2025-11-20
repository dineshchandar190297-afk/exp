# Quantum Web Backend Integration Guide

This guide explains how to set up the Python/Flask backend with Qiskit for real quantum circuit simulation.

## Frontend (Current Lovable Project)

The frontend is **fully functional** and currently uses mock simulation data. It includes:
- ✅ Animated 3D black hole with Three.js
- ✅ Interactive quantum circuit editor (drag & drop gates)
- ✅ Results visualization with histograms and statevectors
- ✅ Circuit import/export (JSON format)
- ✅ Responsive design with dark quantum theme

## Backend Setup (External Python Server)

To connect real Qiskit simulations, you need to deploy a separate Python backend.

### Required Files Structure

```
quantum-backend/
├── app.py              # Flask server with endpoints
├── requirements.txt    # Python dependencies
├── circuit_simulator.py # Qiskit simulation logic
├── Dockerfile          # Container setup
└── README.md
```

### 1. Create `requirements.txt`

```txt
flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.5
qiskit==0.45.0
qiskit-aer==0.13.0
matplotlib==3.8.0
python-socketio==5.10.0
eventlet==0.33.3
```

### 2. Create `app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
from circuit_simulator import simulate_circuit, render_circuit

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "Quantum backend running"})

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Accepts circuit JSON and returns simulation results
    Expected format: { "qubits": 3, "gates": [...] }
    """
    try:
        circuit_data = request.json
        
        # Run simulation
        result = simulate_circuit(circuit_data)
        
        return jsonify({
            "counts": result['counts'],
            "statevector": result['statevector'],
            "executionTime": result['execution_time']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/render', methods=['POST'])
def render():
    """
    Returns SVG/PNG rendering of the circuit
    """
    try:
        circuit_data = request.json
        svg_data = render_circuit(circuit_data)
        
        return jsonify({"svg": svg_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    emit('connected', {'data': 'Connected to quantum backend'})

@socketio.on('simulate_realtime')
def handle_realtime_simulation(data):
    """
    Real-time simulation with progress updates
    """
    circuit_data = data['circuit']
    
    # Emit progress updates during simulation
    emit('simulation_progress', {'progress': 0, 'message': 'Starting simulation...'})
    
    result = simulate_circuit(circuit_data, progress_callback=lambda p: 
        emit('simulation_progress', {'progress': p, 'message': f'Simulating... {p}%'})
    )
    
    emit('simulation_complete', result)

if __name__ == '__main__':
    print("🚀 Quantum Backend Server Starting...")
    print("📡 WebSocket endpoint: ws://localhost:5000")
    print("🔌 REST API endpoint: http://localhost:5000/api")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
```

### 3. Create `circuit_simulator.py`

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.visualization import circuit_drawer
import time

def build_circuit_from_json(circuit_data):
    """
    Builds a Qiskit QuantumCircuit from JSON data
    Format: { "qubits": 3, "gates": [{"type": "H", "target": 0, "time": 0}, ...] }
    """
    num_qubits = circuit_data['qubits']
    gates = sorted(circuit_data['gates'], key=lambda x: x['time'])
    
    # Create circuit with measurement
    qc = QuantumCircuit(num_qubits, num_qubits)
    
    for gate in gates:
        gate_type = gate['type']
        target = gate['target']
        
        if gate_type == 'H':
            qc.h(target)
        elif gate_type == 'X':
            qc.x(target)
        elif gate_type == 'Y':
            qc.y(target)
        elif gate_type == 'Z':
            qc.z(target)
        elif gate_type == 'CX' and 'control' in gate:
            qc.cx(gate['control'], target)
        elif gate_type == 'M':
            qc.measure(target, target)
    
    # Add measurements if not present
    if 'M' not in [g['type'] for g in gates]:
        qc.measure_all()
    
    return qc

def simulate_circuit(circuit_data, progress_callback=None):
    """
    Simulates the quantum circuit and returns results
    """
    start_time = time.time()
    
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
    job = simulator.run(transpiled_circuit, shots=1000)
    result = job.result()
    counts = result.get_counts()
    
    if progress_callback:
        progress_callback(75)
    
    # Get statevector
    statevector_sim = AerSimulator(method='statevector')
    sv_job = statevector_sim.run(transpile(qc.remove_final_measurements(inplace=False), statevector_sim))
    statevector = sv_job.result().get_statevector()
    
    if progress_callback:
        progress_callback(100)
    
    execution_time = int((time.time() - start_time) * 1000)
    
    return {
        'counts': dict(counts),
        'statevector': [
            {'real': float(amp.real), 'imag': float(amp.imag)} 
            for amp in statevector
        ],
        'execution_time': execution_time
    }

def render_circuit(circuit_data):
    """
    Renders circuit as SVG
    """
    qc = build_circuit_from_json(circuit_data)
    
    # Draw circuit
    drawer_output = circuit_drawer(qc, output='mpl', style='iqp')
    
    # Convert to SVG (you'll need to implement SVG conversion)
    # This is a placeholder
    return "<svg><!-- Circuit visualization --></svg>"
```

### 4. Create `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]
```

### 5. Running the Backend

**Local Development:**
```bash
cd quantum-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Docker:**
```bash
docker build -t quantum-backend .
docker run -p 5000:5000 quantum-backend
```

### 6. Connect Frontend to Backend

In your Lovable project, update the `handleSimulate` function in `src/pages/Index.tsx`:

```typescript
const handleSimulate = async (circuit: Circuit) => {
  setIsSimulating(true);
  setResult(null);
  
  try {
    const response = await fetch('http://localhost:5000/api/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(circuit),
    });
    
    if (!response.ok) throw new Error('Simulation failed');
    
    const data = await response.json();
    setResult(data);
    toast.success('Simulation complete!');
  } catch (error) {
    toast.error('Simulation failed: ' + error.message);
  } finally {
    setIsSimulating(false);
  }
};
```

### 7. Production Deployment

Deploy the backend to:
- **AWS Lambda** with API Gateway
- **Google Cloud Run**
- **Heroku**
- **Railway.app**
- **Render.com**

Then update the API endpoint in the frontend to your production URL.

## Circuit JSON Format

The circuit editor exports/imports this JSON format:

```json
{
  "qubits": 3,
  "gates": [
    {
      "type": "H",
      "target": 0,
      "time": 0,
      "id": "H-1234567890-0.123"
    },
    {
      "type": "CX",
      "control": 0,
      "target": 1,
      "time": 1,
      "id": "CX-1234567891-0.456"
    },
    {
      "type": "M",
      "target": 0,
      "time": 2,
      "id": "M-1234567892-0.789"
    }
  ]
}
```

## Gate Types Supported

- **H**: Hadamard gate (creates superposition)
- **X**: Pauli-X gate (NOT gate)
- **Y**: Pauli-Y gate
- **Z**: Pauli-Z gate
- **CX**: Controlled-NOT (CNOT) gate
- **M**: Measurement operation

## Testing

Test the backend with curl:

```bash
curl -X POST http://localhost:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "qubits": 2,
    "gates": [
      {"type": "H", "target": 0, "time": 0, "id": "test-1"},
      {"type": "CX", "control": 0, "target": 1, "time": 1, "id": "test-2"}
    ]
  }'
```

## WebSocket Real-time Updates

For live simulation progress, use Socket.IO in the frontend:

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('simulation_progress', (data) => {
  console.log(`Progress: ${data.progress}% - ${data.message}`);
});

socket.emit('simulate_realtime', { circuit: circuitData });
```

## Notes

- The frontend works standalone with mock data
- Backend integration is optional but recommended for real simulations
- Qiskit installation requires ~500MB of dependencies
- For production, consider caching simulation results
- Add rate limiting to prevent abuse

## Support

For issues or questions:
- Frontend (Lovable): Use the Lovable platform
- Backend (Python): Check Qiskit documentation at qiskit.org
