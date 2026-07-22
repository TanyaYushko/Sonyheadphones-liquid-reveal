import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function LiquidRevealCard({
  image1,
  image2,
  eyebrow = 'Gallery',
  headline = 'Sony’s intelligent industry-leading noise-canceling headphones',
  description = 'With premium sound, elevate your listening experience with the ability to personalize and control everything you hear.',
  primaryLabel = 'Shop now',
  secondaryLabel = 'Watch story',
}) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
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
    let autoPlayActive = false;
    let autoPlayStarted = false;
    let autoPlayStartTime = 0;
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

      if (isTouchDevice && autoPlayActive) {
        const elapsed = performance.now() - autoPlayStartTime;
        const progress = Math.min(1, elapsed / 1400);
        const eased = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        const finalX = rect.width * 0.6;
        const finalY = rect.height * 0.54;
        targetX = rect.width * 0.45 + (finalX - rect.width * 0.45) * eased;
        targetY = rect.height * 0.46 + (finalY - rect.height * 0.46) * eased;

        if (progress >= 1) {
          autoPlayActive = false;
          targetX = finalX;
          targetY = finalY;
        }
      }

      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (ready && revealImage && revealImage.complete) {
        const t = performance.now() * 0.0016;
        const points = [];
        const segments = 32;
        const isCompact = window.innerWidth < 1024;
        const fit = isCompact ? 'contain' : 'cover';
        const containerWidth = rect.width;
        const containerHeight = rect.height;
        const imageWidth = revealImage.naturalWidth || containerWidth;
        const imageHeight = revealImage.naturalHeight || containerHeight;
        let drawWidth = containerWidth;
        let drawHeight = containerHeight;
        let drawX = 0;
        let drawY = 0;

        if (fit === 'cover') {
          if (containerWidth / containerHeight > imageWidth / imageHeight) {
            drawHeight = containerHeight;
            drawWidth = (imageWidth / imageHeight) * drawHeight;
            drawX = (containerWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = containerWidth;
            drawHeight = (imageHeight / imageWidth) * drawWidth;
            drawX = 0;
            drawY = (containerHeight - drawHeight) / 2;
          }
        } else {
          if (containerWidth / containerHeight > imageWidth / imageHeight) {
            drawWidth = containerWidth;
            drawHeight = (imageHeight / imageWidth) * drawWidth;
            drawX = 0;
            drawY = (containerHeight - drawHeight) / 2;
          } else {
            drawHeight = containerHeight;
            drawWidth = (imageWidth / imageHeight) * drawHeight;
            drawX = (containerWidth - drawWidth) / 2;
            drawY = 0;
          }
        }

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
        ctx.drawImage(revealImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMove = (event) => {
      autoPlayActive = false;
      const rect = card.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
    };

    resize();

    if (isTouchDevice && !autoPlayStarted) {
      autoPlayStarted = true;
      autoPlayActive = true;
      autoPlayStartTime = performance.now();
    }

    draw();

    window.addEventListener('resize', resize);
    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', () => {
      const rect = card.getBoundingClientRect();
      targetX = rect.width * 0.5;
      targetY = rect.height * 0.5;
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      card.removeEventListener('pointermove', handleMove);
    };
  }, [ready, revealImage]);

  return (
    <section className="stage">
      <div className="card" ref={cardRef} aria-label="Interactive Sony headphones showcase">
        <div className="image-layer base">
          <img src={image1} alt="Sony headphones" />
        </div>
        <canvas ref={canvasRef} id="liquid" />
        <div className="copy">
          <div className="copy-stack">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              {eyebrow}
            </motion.p>
            <motion.h1
              aria-label={headline}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.035,
                    delayChildren: 0.08,
                  },
                },
              }}
            >
              {[...headline].map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  className="headline-letter"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              className="hero-paragraph"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.85 }}
            >
              {description}
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.05 }}
            >
              <a className="button primary" href="#">{primaryLabel}</a>
              <a className="button secondary" href="#">{secondaryLabel}</a>
            </motion.div>
            <motion.div
              className="feature-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
            >
              <span className="feature-pill">Adaptive ANC</span>
              <span className="feature-pill">Spatial Audio</span>
              <span className="feature-pill">24h battery</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
