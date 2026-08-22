import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import { Sparkles, Eye, Zap } from 'lucide-react';

export const FloatingGlassLens: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const mouseX = useMotionValue(100);
  const mouseY = useMotionValue(100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handlePointerMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 60);
      mouseY.set(e.clientY - 60);
    };

    window.addEventListener('mousemove', handlePointerMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Floating 3D Distorted Glass Lens Toggle Pill */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 select-none">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsActive(!isActive)}
          className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full backdrop-blur-2xl border transition-all shadow-2xl cursor-pointer ${
            isActive
              ? 'bg-amber-400/20 border-amber-400/80 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
              : 'bg-neutral-900/80 border-white/15 text-neutral-300 hover:border-amber-400/50 hover:text-white'
          }`}
          title="Toggle 3D Distorted Glass Lens Effect (Olivier Larose style)"
        >
          {/* Chromatic Edge Sheen */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-transparent to-teal-400/20 opacity-70 pointer-events-none" />
          
          <div className="relative w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_#fbbf24]" />
          <span className="text-[11px] font-black tracking-wide">
            {isActive ? '3D Glass Lens: ON' : '3D Glass Effect'}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
        </motion.button>
      </div>

      {/* Interactive 3D Refractive Glass Lens Overlay */}
      {isActive && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-0 left-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none z-40 rounded-full"
        >
          {/* Glass Lens Body with Refractive Filter & Chromatic Fringe */}
          <div
            className="w-full h-full rounded-full backdrop-blur-[6px] border-2 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_0_30px_rgba(255,255,255,0.4),0_0_30px_rgba(245,158,11,0.25)] relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, rgba(245,158,11,0.1) 40%, rgba(16,185,129,0.1) 70%, transparent 100%)',
              filter: 'url(#liquid-glass-lens)',
            }}
          >
            {/* Specular Highlight Glare */}
            <div className="absolute top-2 left-4 w-12 h-6 rounded-full bg-white/60 blur-[1px] transform -rotate-45 pointer-events-none" />
            <div className="absolute bottom-3 right-5 w-6 h-3 rounded-full bg-white/30 blur-[1px] transform -rotate-45 pointer-events-none" />
          </div>

          {/* Iris Ring Indicator */}
          <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping opacity-25 pointer-events-none" />
        </motion.div>
      )}
    </>
  );
};
