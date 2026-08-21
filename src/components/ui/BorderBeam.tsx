import React from 'react';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  glow?: boolean;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  size = 180,
  duration = 6,
  anchor = 90,
  borderWidth = 3, // Thicker high-visibility running stroke as requested
  colorFrom = '#f59e0b',
  colorTo = '#10b981',
  delay = 0,
  glow = true,
}) => {
  return (
    <div
      style={
        {
          '--size': size,
          '--duration': duration,
          '--anchor': anchor,
          '--border-width': borderWidth,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay}s`,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-[border-beam_calc(var(--duration)*1s)_infinite_linear] after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))] ${
        glow ? 'after:[filter:drop-shadow(0_0_8px_var(--color-from))_drop-shadow(0_0_14px_var(--color-to))]' : ''
      } ${className}`}
    />
  );
};
