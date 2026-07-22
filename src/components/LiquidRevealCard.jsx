import { useEffect, useRef, useState } from 'react';

export default function LiquidRevealCard({ image1, image2 }) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [revealImage, setRevealImage] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = image2;
    img.onload = () => {
      setRevealImage(img);
      setReady(true);
    };
    img.onerror = () => {
      setReady(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [image2]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const card = cardRef.current;

    let animationFrame;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const resize = () => {
      const rect = card.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      targetX = rect.width * 0.5;
      targetY = rect.height * 0.5;
      currentX = targetX;
      currentY = targetY;
    };

    const draw = () => {
      const rect = card.getBoundingClientRect();
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (ready && revealImage && revealImage.complete) {
        const t = performance.now() * 0.0014;
        const points = [];
        const segments = 40;
        const size = 170 + Math.sin(performance.now() * 0.0015) * 12;
        const softness = size * 0.18;

        for (let i = 0; i < segments; i += 1) {
          const angle = (i / segments) * Math.PI * 2;
          const wobble =
            Math.sin(angle * 3 + t * 1.4) * softness +
            Math.sin(angle * 6 - t * 0.8) * (softness * 0.42) +
            Math.cos(angle * 2.2 + t * 0.7) * (softness * 0.24);
          const radius = size * 0.56 + wobble;
          points.push({
            x: currentX + Math.cos(angle) * radius,
            y: currentY + Math.sin(angle) * radius * 0.92,
          });
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i += 1) {
          const prev = points[i - 1];
          const curr = points[i];
          const midX = (prev.x + curr.x) * 0.5;
          const midY = (prev.y + curr.y) * 0.5;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }

        ctx.closePath();
        ctx.clip();
        ctx.drawImage(revealImage, 0, 0, rect.width, rect.height);
        ctx.restore();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMove = (event) => {
      const rect = card.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
      setPointer({ x: targetX, y: targetY });
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', () => {
      const rect = card.getBoundingClientRect();
      targetX = rect.width * 0.5;
      targetY = rect.height * 0.5;
      setPointer({ x: targetX, y: targetY });
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      card.removeEventListener('pointermove', handleMove);
    };
  }, [ready, revealImage]);

  return (
    <section className="showcase-card" ref={cardRef}>
      <img className="base-image" src={image1} alt="Headphones" />
      <canvas ref={canvasRef} className="reveal-canvas" />
      <div className="cursor-hint" style={{ left: pointer.x, top: pointer.y }} />
    </section>
  );
}
