import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Precision Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Aurora Ambient Glow Orb 1 (Amber / Gold Top-Left) */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] animate-aurora pointer-events-none" 
      />

      {/* Aurora Ambient Glow Orb 2 (Emerald / Teal Bottom-Right) */}
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[130px] animate-aurora pointer-events-none"
        style={{ animationDelay: '-4s' }}
      />

      {/* Subtle Central Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/60 to-neutral-950/90 pointer-events-none" />
    </div>
  );
};
