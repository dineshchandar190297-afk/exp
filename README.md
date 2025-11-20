# Quantum Web - Interactive Quantum Circuit Designer

A stunning web application for designing, simulating, and visualizing quantum circuits with an immersive 3D black hole interface.

## ✨ Features

- 🌌 **3D Animated Black Hole**: Stunning Three.js visualization with spinning event horizon, accretion disk, and gravitational lensing
- ⚛️ **Interactive Circuit Editor**: Drag-and-drop quantum gates onto a visual circuit canvas
- 📊 **Real-time Results**: View measurement outcomes and statevectors with animated visualizations
- 💾 **Import/Export**: Save and load circuits in JSON format
- 🎨 **Quantum-themed UI**: Dark space aesthetic with cyan/purple glows and smooth animations
- ♿ **Accessible**: Pause animations for reduced motion preferences
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

This is the frontend application built with React, Vite, and Three.js. It currently uses mock simulation data but is ready to connect to a Python/Qiskit backend.

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🎮 How to Use

1. **Design Your Circuit**:
   - Select a quantum gate (H, X, Y, Z, CX, M) from the toolbar
   - Click on the circuit canvas to place gates on quantum wires
   - Gates are arranged in time from left to right

2. **Run Simulation**:
   - Click the "Simulate" button to execute your circuit
   - View measurement results in the histogram
   - Explore the statevector amplitudes

3. **Save/Load Circuits**:
   - Use "Export" to save your circuit as JSON
   - Use "Import" to load a previously saved circuit
   - Check the `examples/` folder for sample circuits

## 🔌 Backend Integration

The frontend is fully functional with mock data. To connect real Qiskit simulations:

**See [QUANTUM_BACKEND_GUIDE.md](./QUANTUM_BACKEND_GUIDE.md) for complete backend setup instructions.**

Quick overview:
1. Deploy the Python Flask backend with Qiskit (see guide)
2. Update the API endpoint in `src/pages/Index.tsx`
3. Run real quantum simulations!

## 📁 Project Structure

```
quantum-web/
├── src/
│   ├── components/
│   │   ├── BlackHole.tsx          # Three.js black hole animation
│   │   ├── CircuitEditor.tsx      # Interactive circuit builder
│   │   ├── ResultsPanel.tsx       # Results visualization
│   │   └── ui/                    # Shadcn UI components
│   ├── pages/
│   │   └── Index.tsx              # Main application page
│   ├── index.css                  # Design system & quantum theme
│   └── App.tsx                    # React app root
├── examples/                      # Sample quantum circuits
│   ├── bell-state.json           # Bell state entanglement
│   └── grover-3qubit.json        # Grover's algorithm
├── QUANTUM_BACKEND_GUIDE.md      # Backend integration guide
└── README.md                      # This file
```

## 🎨 Design System

The app uses a custom quantum-themed design system:

- **Colors**: Deep space blacks with cyan (#00bcd4) and purple (#a855f7) accents
- **Effects**: Glowing text, animated particles, gravitational lens effects
- **Animations**: Smooth transitions, floating elements, spinning accretion disk
- **Typography**: Monospace for quantum states and gates

All design tokens are defined in `src/index.css` and `tailwind.config.ts`.

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast builds
- Three.js + React Three Fiber for 3D graphics
- Tailwind CSS for styling
- Shadcn UI components
- Framer Motion for animations

**Backend (Optional):**
- Python 3.10+
- Flask or FastAPI
- Qiskit for quantum simulation
- WebSocket support for real-time updates

## 🔬 Quantum Gates Supported

| Gate | Symbol | Description |
|------|--------|-------------|
| H | Hadamard | Creates superposition |
| X | Pauli-X | Quantum NOT gate |
| Y | Pauli-Y | Rotation around Y-axis |
| Z | Pauli-Z | Phase flip |
| CX | CNOT | Controlled-NOT (entanglement) |
| M | Measure | Measurement operation |

## 📦 Example Circuits

### Bell State (Entanglement)
```json
{
  "qubits": 2,
  "gates": [
    {"type": "H", "target": 0, "time": 0},
    {"type": "CX", "control": 0, "target": 1, "time": 1}
  ]
}
```

Load `examples/bell-state.json` to see quantum entanglement in action!

## 🤝 Contributing

This project is built on Lovable.dev. To contribute:

1. Make changes through the Lovable editor
2. Test thoroughly with different circuits
3. Ensure the black hole animation is performant
4. Follow the design system conventions

## 📄 License

Built with ❤️ using Lovable.dev

## 🌟 What's Next?

See the backend integration guide for:
- Real Qiskit quantum simulations
- WebSocket real-time updates
- Circuit visualization with matplotlib
- Deployment to production

## 🙏 Acknowledgments

- Qiskit team for quantum computing framework
- Three.js community for 3D graphics
- Shadcn for beautiful UI components

**URL**: https://lovable.dev/projects/1c153629-840b-4812-85f6-22188b15ea46

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1c153629-840b-4812-85f6-22188b15ea46) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1c153629-840b-4812-85f6-22188b15ea46) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
