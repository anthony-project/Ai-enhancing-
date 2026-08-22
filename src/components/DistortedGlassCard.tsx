import React from 'react';

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
  ...props
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 transition-all duration-200 ${className}`}
      {...props}
    >
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
