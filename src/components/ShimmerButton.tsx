import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { BorderBeam } from './BorderBeam';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'cyan' | 'neutral' | 'rose';
  shimmerColor?: string;
  className?: string;
  showBorderBeam?: boolean;
  beamBorderWidth?: number;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'amber',
  shimmerColor = 'rgba(255, 255, 255, 0.35)',
  className = '',
  showBorderBeam = true,
  beamBorderWidth = 3,
  ...props
}) => {
  const variantStyles = {
    amber:
      'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] border-amber-300/60 hover:shadow-[0_0_35px_rgba(245,158,11,0.65)]',
    emerald:
      'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] border-emerald-300/60 hover:shadow-[0_0_35px_rgba(16,185,129,0.65)]',
    cyan:
      'bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500 text-neutral-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] border-cyan-300/60 hover:shadow-[0_0_35px_rgba(6,182,212,0.65)]',
    rose:
      'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] border-rose-300/60 hover:shadow-[0_0_35px_rgba(244,63,94,0.65)]',
    neutral:
      'bg-neutral-850 hover:bg-neutral-800 text-neutral-100 border-neutral-700 shadow-md',
  };

  const beamColors = {
    amber: { from: '#fef08a', to: '#f59e0b' },
    emerald: { from: '#a7f3d0', to: '#10b981' },
    cyan: { from: '#bae6fd', to: '#06b6d4' },
    rose: { from: '#fecdd3', to: '#f43f5e' },
    neutral: { from: '#fbbf24', to: '#10b981' },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`group relative overflow-hidden rounded-2xl px-6 py-3.5 font-black text-sm tracking-wide border transition-all cursor-pointer select-none flex items-center justify-center gap-2 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Active Running Glowing Border Beam (Thick & Glowing) */}
      {showBorderBeam && (
        <BorderBeam
          size={140}
          duration={5}
          borderWidth={beamBorderWidth}
          colorFrom={beamColors[variant].from}
          colorTo={beamColors[variant].to}
          glow={true}
        />
      )}

      {/* Light Reflection Shimmer Sweep */}
      <div
        className="pointer-events-none absolute -inset-full animate-shimmer opacity-40 group-hover:opacity-75 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />

      <div className="relative z-10 flex items-center justify-center gap-2 w-full">
        {children}
      </div>
    </motion.button>
  );
};
