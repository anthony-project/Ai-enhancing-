import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface DistortedGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  tiltIntensity?: number;
  glassDistortion?: boolean;
  chromaticEdge?: boolean;
}

export const DistortedGlassCard: React.FC<DistortedGlassCardProps> = ({
  children,
  className = '',
  tiltIntensity = 12,
  glassDistortion = true,
  chromaticEdge = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  // Spring physics for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 22, stiffness: 260, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), springConfig);
  const scale = useSpring(isHovered ? 1.015 : 1, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized coordinates (-0.5 to 0.5)
      mouseX.set((x - width / 2) / width);
      mouseY.set((y - height / 2) / height);

      // Percentage for glare reflection
      setGlarePosition({
        x: Math.round((x / width) * 100),
        y: Math.round((y / height) * 100),
      });
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    setGlarePosition({ x: 50, y: 50 });
  }, [mouseX, mouseY]);

  return (
    <div style={{ perspective: 1200 }} className="w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-3xl backdrop-blur-2xl transition-shadow duration-300 ${
          chromaticEdge
            ? 'border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_1px_0_rgba(255,255,255,0.2)]'
            : 'border border-neutral-800/80'
        } ${className}`}
        {...(props as any)}
      >
        {/* 3D Distorted Glass Noise & Refraction Texture Layer */}
        {glassDistortion && (
          <div
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay z-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              filter: 'url(#glass-distortion)',
            }}
          />
        )}

        {/* Dynamic Specular Glare Reflection (Larose style) */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 0.45 : 0.1,
            background: `radial-gradient(550px circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4), rgba(245, 158, 11, 0.15) 30%, transparent 70%)`,
          }}
        />

        {/* Chromatic Aberration Edge Highlight (Prismatic Rainbow Rim) */}
        {chromaticEdge && (
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 z-10"
            style={{
              boxShadow: `inset 1px 1px 0 rgba(255, 255, 255, 0.4), inset -1px -1px 0 rgba(245, 158, 11, 0.25), 0 0 20px rgba(245, 158, 11, ${
                isHovered ? '0.2' : '0.05'
              })`,
            }}
          />
        )}

        {/* Content with 3D Depth translation */}
        <div className="relative z-20" style={{ transform: 'translateZ(15px)' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
};
