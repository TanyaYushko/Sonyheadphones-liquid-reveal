import { motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';

const CARD_STEP = 240;
const VISIBLE_COUNT = 7;

export default function InfiniteCarousel({ images }) {
  const [position, setPosition] = useState(0);
  const pointerRef = useRef({ active: false, lastX: 0, velocity: 0 });

  const loopedImages = useMemo(() => [...images, ...images, ...images], [images]);

  const wrapPosition = (value) => {
    const cycle = CARD_STEP * images.length;
    return ((value % cycle) + cycle) % cycle;
  };

  const handleAdvance = (delta) => {
    setPosition((prev) => wrapPosition(prev + delta));
  };

  const handleWheel = (event) => {
    event.preventDefault();
    handleAdvance(event.deltaY * 0.6);
  };

  const handlePointerDown = (event) => {
    pointerRef.current.active = true;
    pointerRef.current.lastX = event.clientX;
    pointerRef.current.velocity = 0;
  };

  const handlePointerMove = (event) => {
    if (!pointerRef.current.active) {
      return;
    }

    const delta = event.clientX - pointerRef.current.lastX;
    pointerRef.current.velocity = delta * 0.04;
    pointerRef.current.lastX = event.clientX;
    setPosition((prev) => wrapPosition(prev - delta * 0.4));
  };

  const handlePointerUp = () => {
    if (!pointerRef.current.active) {
      return;
    }

    pointerRef.current.active = false;
    const momentum = pointerRef.current.velocity * 18;
    if (Math.abs(momentum) > 6) {
      handleAdvance(momentum);
    }
  };

  const visibleItems = useMemo(() => {
    const baseIndex = Math.round(position / CARD_STEP);
    return Array.from({ length: VISIBLE_COUNT }, (_, index) => {
      const relative = index - Math.floor(VISIBLE_COUNT / 2);
      const itemIndex = (baseIndex + relative + loopedImages.length) % loopedImages.length;
      return {
        image: loopedImages[itemIndex],
        relative,
      };
    });
  }, [loopedImages, position]);

  return (
    <section
      className="carousel-shell"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="carousel-copy">
        <p className="carousel-eyebrow">Gallery</p>
        <h1>Infinite curved carousel</h1>
        <p className="carousel-description">
          Scroll, drag, or swipe to move through the gallery as each card glides along a refined 3D arc.
        </p>
      </div>

      <div className="carousel-stage">
        <div className="carousel-track" aria-label="Interactive gallery carousel">
          {visibleItems.map(({ image, relative }, index) => {
            const translateX = relative * 210;
            const translateY = -Math.abs(relative) * 24;
            const translateZ = -Math.abs(relative) * 70;
            const rotateY = relative * -24;
            const scale = 1 - Math.abs(relative) * 0.1;
            const opacity = 1 - Math.abs(relative) * 0.14;
            const zIndex = VISIBLE_COUNT - Math.abs(relative);

            return (
              <motion.article
                key={`${image}-${index}`}
                className="carousel-card"
                style={{
                  zIndex,
                  opacity,
                  transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity, scale }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              >
                <img src={image} alt={`Gallery image ${index + 1}`} />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
