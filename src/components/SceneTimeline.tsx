import React, { useState } from 'react';
import { Camera, Volume2, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { Scene, MovieScript } from '../types';

interface SceneTimelineProps {
  movie: MovieScript;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onRegenerateSceneImage: (sceneIndex: number) => void;
}

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  movie,
  activeSceneIndex,
  onSelectScene,
  onRegenerateSceneImage,
}) => {
  const [loadingRegenIndex, setLoadingRegenIndex] = useState<number | null>(null);

  const handleRegenClick = async (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setLoadingRegenIndex(index);
    await onRegenerateSceneImage(index);
    setLoadingRegenIndex(null);
  };

  return (
    <div id="scene-timeline-section" className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Scene Filmstrip ({movie.scenes.length} Scenes)</span>
        </h3>
        <span className="text-xs text-neutral-500 font-mono">
          Language: {movie.language}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {movie.scenes.map((scene, index) => {
          const isActive = index === activeSceneIndex;
          const isRegen = loadingRegenIndex === index;

          return (
            <div
              key={scene.sceneNumber}
              onClick={() => onSelectScene(index)}
              className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                isActive
                  ? 'bg-neutral-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {/* Image Preview Box */}
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                    No visual frame
                  </div>
                )}

                <span className="absolute top-2 left-2 bg-neutral-950/80 text-amber-400 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-amber-500/20">
                  SCENE {scene.sceneNumber}
                </span>

                {/* Regenerate Visual Button */}
                <button
                  onClick={(e) => handleRegenClick(e, index)}
                  disabled={isRegen}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 text-neutral-300 hover:text-amber-400 text-xs transition-all opacity-0 group-hover:opacity-100"
                  title="Regenerate scene visual frame"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegen ? 'animate-spin text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Scene Metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white font-serif truncate">
                    {scene.title}
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                    {scene.durationSeconds || 8}s
                  </span>
                </div>

                <p className="text-[10px] text-neutral-400 font-mono truncate">
                  {scene.timeOfDayAndLocation}
                </p>

                {/* Script snippet */}
                <p className="text-xs text-neutral-300 line-clamp-2 italic bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/50">
                  "{scene.narrationScript}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                  <span className="flex items-center gap-1 text-amber-300/80">
                    <Camera className="w-3 h-3" />
                    {scene.cameraMotion}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
