import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Precision 3D Refractive Dot Mesh */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #ffffff 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating 3D Liquid Glass Caustic Orb 1 (Amber / Gold) */}
      <div 
        className="absolute top-1/6 -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-amber-600/15 via-amber-400/20 to-orange-500/10 blur-[120px] animate-aurora pointer-events-none" 
      />

      {/* Floating 3D Liquid Glass Caustic Orb 2 (Emerald / Cyan) */}
      <div 
        className="absolute top-2/3 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-teal-500/15 via-emerald-400/20 to-cyan-500/10 blur-[130px] animate-aurora pointer-events-none"
        style={{ animationDelay: '-5s' }}
      />

      {/* Center Chromatic Ambient Prism */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[300px] rounded-full bg-gradient-to-r from-amber-500/5 via-violet-500/5 to-teal-500/5 blur-[100px] pointer-events-none"
      />

      {/* Radial Depth Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/50 to-neutral-950/90 pointer-events-none" />
    </div>
  );
};
