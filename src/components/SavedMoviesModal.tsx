import React from 'react';
import { X, Play, Trash2, Film, Calendar, Monitor, Sparkles } from 'lucide-react';
import { MovieScript } from '../types';

interface SavedMoviesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMovies: MovieScript[];
  onSelectMovie: (movie: MovieScript) => void;
  onDeleteMovie: (id: string) => void;
}

export const SavedMoviesModal: React.FC<SavedMoviesModalProps> = ({
  isOpen,
  onClose,
  savedMovies,
  onSelectMovie,
  onDeleteMovie,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-serif">
              My Saved AI Movies ({savedMovies.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {savedMovies.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Sparkles className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-neutral-400 text-sm">You haven't saved any AI movies yet.</p>
              <p className="text-neutral-500 text-xs">Generate a movie from prompt and click the save icon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="group bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                    {(movie.scenes[0]?.imageUrl || movie.posterUrl) ? (
                      <img
                        src={movie.scenes[0]?.imageUrl || movie.posterUrl}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600 text-xs">
                        No Preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                    
                    <span className="absolute top-2.5 left-2.5 bg-neutral-950/80 text-amber-400 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-500/20">
                      {movie.language}
                    </span>

                    <span className="absolute top-2.5 right-2.5 bg-neutral-950/80 text-neutral-300 font-mono text-[10px] px-2 py-0.5 rounded border border-neutral-800">
                      {movie.resolution}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white font-serif line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-amber-400 italic line-clamp-1">
                        "{movie.tagline}"
                      </p>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {movie.synopsis}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-900 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onSelectMovie(movie);
                          onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-neutral-950" />
                        <span>Play Movie</span>
                      </button>

                      <button
                        onClick={() => onDeleteMovie(movie.id)}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-800/50 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
