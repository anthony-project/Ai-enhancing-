import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ShimmerButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'cyan' | 'neutral';
  shimmerColor?: string;
  className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  variant = 'amber',
  shimmerColor = 'rgba(255, 255, 255, 0.35)',
  className = '',
  ...props
}) => {
  const variantStyles = {
    amber:
      'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.35)] border-amber-300/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.55)]',
    emerald:
      'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-neutral-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] border-emerald-300/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.55)]',
    cyan:
      'bg-gradient-to-r from-cyan-500 via-blue-400 to-cyan-500 text-neutral-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] border-cyan-300/50 hover:shadow-[0_0_35px_rgba(6,182,212,0.55)]',
    neutral:
      'bg-neutral-850 hover:bg-neutral-800 text-neutral-100 border-neutral-750 shadow-md',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`group relative overflow-hidden rounded-2xl px-6 py-3.5 font-black text-sm tracking-wide border transition-all cursor-pointer select-none flex items-center justify-center gap-2 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Light Reflection Shimmer Sweep */}
      <div
        className="pointer-events-none absolute -inset-full animate-shimmer opacity-40 group-hover:opacity-75 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      {children}
    </motion.button>
  );
};
