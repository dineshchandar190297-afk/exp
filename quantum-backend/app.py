from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import os
import json
from circuit_simulator import simulate_circuit, render_circuit

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "ok",
        "message": "Circuit Vortex Quantum Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "simulate": "/api/simulate (POST)",
            "render": "/api/render (POST)"
        }
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "message": "Quantum backend running",
        "version": "1.0.0"
    })

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Accepts circuit JSON and returns simulation results
    Expected format: { "qubits": 3, "gates": [...] }
    """
    try:
        circuit_data = request.json
        
        if not circuit_data:
            return jsonify({"error": "No circuit data provided"}), 400
        
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
        
        if not circuit_data:
            return jsonify({"error": "No circuit data provided"}), 400
            
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
    circuit_data = data.get('circuit', {})
    
    # Emit progress updates during simulation
    emit('simulation_progress', {'progress': 0, 'message': 'Starting simulation...'})
    
    def progress_callback(p):
        emit('simulation_progress', {'progress': p, 'message': f'Simulating... {p}%'})
    
    result = simulate_circuit(circuit_data, progress_callback=progress_callback)
    
    emit('simulation_complete', result)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 Quantum Backend Server Starting...")
    print(f"📡 WebSocket endpoint: ws://0.0.0.0:{port}")
    print(f"🔌 REST API endpoint: http://0.0.0.0:{port}/api")
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
