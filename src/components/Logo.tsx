import QuantumAtom from '@/components/QuantumAtom';
import logo from '@/assets/logo.png';

export default function Logo() {
  return (
    <div className="logo-container">
      <div className="logo-glass">
        <img 
          src={logo} 
          alt="Quantum Web Logo" 
          className="logo-metallic"
        />
        <span className="logo-text">Quantum Web</span>
      </div>
    </div>
  );
}



