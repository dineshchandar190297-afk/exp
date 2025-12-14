import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Star {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export default function StarCursor() {
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let starId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Create new star
      const newStar: Star = {
        id: starId++,
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
      };

      setStars((prev) => [...prev, newStar]);

      // Remove star after animation
      setTimeout(() => {
        setStars((prev) => prev.filter((star) => star.id !== newStar.id));
      }, 800);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Fade out stars
    const interval = setInterval(() => {
      setStars((prev) =>
        prev
          .map((star) => ({ ...star, opacity: star.opacity - 0.05 }))
          .filter((star) => star.opacity > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: star.x - 8,
            top: star.y - 8,
            opacity: star.opacity,
            transition: 'opacity 0.05s linear',
          }}
        >
          <Sparkles 
            className="w-4 h-4 text-primary" 
            style={{
              filter: 'drop-shadow(0 0 4px hsl(var(--primary)))',
            }}
          />
        </div>
      ))}
    </>
  );
}

