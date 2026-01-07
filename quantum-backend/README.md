# Circuit Vortex - Quantum Backend

A Flask-based backend for quantum circuit simulation using Qiskit.

## 🚀 Deployment on Render

### Option 1: Deploy with Render Blueprint (Recommended)

1. Push this folder to a GitHub repository
2. Go to [render.com](https://render.com) and create a new account or log in
3. Click **New +** → **Blueprint**
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` and deploy

### Option 2: Manual Web Service Setup

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `circuit-vortex-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `quantum-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:$PORT app:app`
5. Click **Create Web Service**

### Environment Variables

Set these in Render Dashboard if needed:
- `PYTHON_VERSION`: `3.11.0`

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and available endpoints |
| `/api/health` | GET | Health check endpoint |
| `/api/simulate` | POST | Simulate a quantum circuit |
| `/api/render` | POST | Render circuit as SVG |

## 🔧 Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

## 📤 API Usage

### Simulate a Circuit

```bash
curl -X POST https://your-app.onrender.com/api/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "qubits": 2,
    "gates": [
      {"type": "H", "target": 0, "time": 0},
      {"type": "CX", "control": 0, "target": 1, "time": 1}
    ]
  }'
```

### Response Format

```json
{
  "counts": {"00": 512, "11": 488},
  "statevector": [
    {"real": 0.707, "imag": 0},
    {"real": 0, "imag": 0},
    {"real": 0, "imag": 0},
    {"real": 0.707, "imag": 0}
  ],
  "executionTime": 150,
  "shots": 1000
}
```

## 🎛️ Supported Gates

- **H**: Hadamard gate
- **X**: Pauli-X (NOT) gate
- **Y**: Pauli-Y gate
- **Z**: Pauli-Z gate
- **S**: S gate (π/2 phase)
- **T**: T gate (π/4 phase)
- **CX**: Controlled-NOT (CNOT)
- **CZ**: Controlled-Z
- **SWAP**: Swap gate
- **M**: Measurement

## 📁 Project Structure

```
quantum-backend/
├── app.py                 # Flask application
├── circuit_simulator.py   # Qiskit simulation logic
├── requirements.txt       # Python dependencies
├── render.yaml           # Render deployment config
├── Dockerfile            # Docker configuration
└── README.md             # This file
```

## 🔗 Connect to Frontend

After deploying, update your frontend to use the Render URL:

```typescript
const BACKEND_URL = 'https://your-app.onrender.com';

const response = await fetch(`${BACKEND_URL}/api/simulate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(circuit)
});
```

## ⚠️ Notes

- Free tier on Render may spin down after 15 minutes of inactivity
- First request after spin-down takes ~30-60 seconds
- Consider upgrading to paid tier for always-on service
