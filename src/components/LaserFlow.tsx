export default function LaserFlow({ position = 'left' }: { position?: 'left' | 'right' }) {
  return (
    <div className={`laser-flow ${position === 'right' ? 'laser-flow-right' : 'laser-flow-left'}`}>
      <div className="laser-beam"></div>
      <div className="laser-beam" style={{ animationDelay: '1s' }}></div>
      <div className="laser-beam" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

