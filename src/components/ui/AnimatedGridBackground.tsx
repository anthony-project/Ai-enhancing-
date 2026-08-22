import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Precision Subtle Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Static Ambient Glows (No continuous repaint animation) */}
      <div 
        className="absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full bg-amber-500/5 blur-[80px] pointer-events-none"
      />
      <div 
        className="absolute bottom-10 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none"
      />

      {/* Radial Depth Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/40 to-neutral-950/90 pointer-events-none" />
    </div>
  );
};
