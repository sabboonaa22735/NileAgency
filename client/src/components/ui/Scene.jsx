import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import FloatingShapes from './FloatingShapes';

export function Scene({ children, className = '', contentClassName = '' }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className={`cinematic-page ${className}`}>
      <motion.div
        style={{ x: springX, y: springY, willChange: 'transform' }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="scene-grid absolute inset-0 opacity-20" />
        <div className="scene-noise" />
        
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/[0.08] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07111f] to-transparent" />
        
        <div className="absolute left-[-5%] top-[5%] h-64 w-64 rounded-full bg-cyan-300/8 blur-[100px]" />
        <div className="absolute left-[20%] top-[30%] h-48 w-48 rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="absolute right-[5%] top-[15%] h-56 w-56 rounded-full bg-purple-500/8 blur-[90px]" />
        <div className="absolute right-[20%] bottom-[20%] h-48 w-48 rounded-full bg-emerald-300/8 blur-[80px]" />
        <div className="absolute left-[40%] bottom-[10%] h-40 w-40 rounded-full bg-rose-300/6 blur-[70px]" />
      </motion.div>

      <div className="canvas-container pointer-events-none">
        <CanvasContainer />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07111f] z-[1]" />

      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}

function CanvasContainer() {
  return (
    <Suspense fallback={null}>
      <FloatingShapes />
    </Suspense>
  );
}

export function Reveal({ children, delay = 0, y = 24, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({ children, className = '', glare = true }) {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18 });
  const glareX = useSpring(useMotionValue(50), { stiffness: 180, damping: 20 });
  const glareY = useSpring(useMotionValue(50), { stiffness: 180, damping: 20 });

  const transform = useMotionTemplate`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28), transparent 36%)`;

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 12);
    rotateY.set((px - 0.5) * 14);
    glareX.set(px * 100);
    glareY.set(py * 100);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      style={{ transformStyle: 'preserve-3d', transform }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}
    >
      {glare ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80"
          style={{ background: glareBg }}
        />
      ) : null}
      <div style={{ transform: 'translateZ(40px)' }} className="relative h-full">
        {children}
      </div>
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, body, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {eyebrow ? <p className="soft-label mb-4">{eyebrow}</p> : null}
      <h2 className="text-4xl md:text-6xl font-bold">{title}</h2>
      {body ? <p className="mt-5 text-base md:text-lg text-slate-300/85">{body}</p> : null}
    </div>
  );
}