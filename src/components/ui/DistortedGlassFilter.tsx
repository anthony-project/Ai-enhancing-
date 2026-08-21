import React from 'react';

/**
 * Olivier Larose 3D Distorted Glass Effect SVG Filter Pipeline
 * Includes:
 * - feTurbulence: Generates organic surface ripples / liquid normal map
 * - feDisplacementMap: Physically displaces background light (refraction)
 * - feSpecularLighting: High-gloss realistic surface reflections
 * - feColorMatrix: Chromatic aberration (RGB split dispersion)
 */
export const DistortedGlassFilter: React.FC = () => {
  return (
    <svg className="fixed pointer-events-none w-0 h-0 overflow-hidden opacity-0" aria-hidden="true">
      <defs>
        {/* Moderate Dynamic Refraction Filter */}
        <filter id="glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.02"
            numOctaves="3"
            result="noise"
            seed="42"
          >
            <animate
              attributeName="baseFrequency"
              dur="12s"
              values="0.015 0.02;0.025 0.015;0.015 0.02"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.4" result="smoothDisplaced" />
          <feBlend in="SourceGraphic" in2="smoothDisplaced" mode="screen" />
        </filter>

        {/* High-Impact 3D Liquid Lens Distortion */}
        <filter id="liquid-glass-lens" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.025 0.035"
            numOctaves="4"
            result="turbulence"
            seed="88"
          >
            <animate
              attributeName="baseFrequency"
              dur="16s"
              values="0.025 0.035;0.04 0.02;0.025 0.035"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="28"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displacedGraphic"
          />
          <feSpecularLighting
            in="turbulence"
            surfaceScale="5"
            specularConstant="1.2"
            specularExponent="20"
            lightingColor="#fbbf24"
            result="specular"
          >
            <fePointLight x="100" y="-100" z="200" />
          </feSpecularLighting>
          <feComposite in="displacedGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        </filter>

        {/* Chromatic Aberration Dispersion Filter */}
        <filter id="chromatic-glass" x="-10%" y="-10%" width="120%" height="120%">
          <feOffset in="SourceGraphic" dx="2" dy="0" result="red" />
          <feOffset in="SourceGraphic" dx="-2" dy="0" result="blue" />
          <feBlend in="red" in2="SourceGraphic" mode="screen" result="rb" />
          <feBlend in="rb" in2="blue" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
};
