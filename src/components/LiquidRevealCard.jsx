import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const headlineText = 'Premium motion with a fluid, cinematic touch.';

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
        const t = performance.now() * 0.0016;
        const points = [];
        const segments = 32;

        for (let i = 0; i < segments; i += 1) {
          const angle = (i / segments) * Math.PI * 2;
          const wobble =
            Math.sin(angle * 3 + t * 1.2) * (150 * 0.12) +
            Math.sin(angle * 7 - t * 0.9) * (150 * 0.06) +
            Math.cos(angle * 2.2 + t * 0.65) * (150 * 0.04);
          const radius = 150 * 0.55 + wobble;
          points.push({
            x: currentX + Math.cos(angle) * radius,
            y: currentY + Math.sin(angle) * radius * 0.9,
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
    <section className="stage">
      <div className="card" ref={cardRef} aria-label="Interactive liquid reveal artwork">
        <div className="image-layer base">
          <img src={image1} alt="First artwork" />
        </div>
        <canvas ref={canvasRef} id="liquid" />
        <div className="copy">
          <span className="eyebrow">SONY</span>
          <motion.h1
          aria-label={headlineText}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.045,
                delayChildren: 0.06,
              },
            },
          }}
        >
          {[...headlineText].map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="headline-letter"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          className="hero-paragraph"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
        >
          Move your cursor across the artwork to stir the reveal and watch the imagery flow like liquid light.
        </motion.p>
        </div>
      </div>
    </section>
  );
}
