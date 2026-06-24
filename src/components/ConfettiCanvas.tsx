import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  trigger: number;
}

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.6,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 15,
        radius: Math.random() * 5 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          active = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (active) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default ConfettiCanvas;
