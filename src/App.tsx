import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageEnhancerStudio } from './components/ImageEnhancerStudio';
import { PromptInput } from './components/PromptInput';
import { MoviePlayer } from './components/MoviePlayer';
import { SceneTimeline } from './components/SceneTimeline';
import { ScriptViewer } from './components/ScriptViewer';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SavedMoviesModal } from './components/SavedMoviesModal';
import { MovieScript, GenerationOptions, SupportedLanguage } from './types';
import { createClientSideFallbackMovie } from './utils/fallbackMovieGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('Hindi');
  const [currentMovie, setCurrentMovie] = useState<MovieScript | null>(null);
  const [savedMovies, setSavedMovies] = useState<MovieScript[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Load saved movies from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cineai_saved_movies');
      if (stored) {
        setSavedMovies(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load saved movies:', e);
    }
  }, []);

  // Save movies to localStorage
  const saveMoviesToStorage = (movies: MovieScript[]) => {
    setSavedMovies(movies);
    try {
      localStorage.setItem('cineai_saved_movies', JSON.stringify(movies));
    } catch (e) {
      console.warn('Failed to save movies to localStorage:', e);
    }
  };

  const handleSaveMovie = (movieToSave: MovieScript) => {
    const exists = savedMovies.some((m) => m.id === movieToSave.id);
    if (exists) {
      const updated = savedMovies.filter((m) => m.id !== movieToSave.id);
      saveMoviesToStorage(updated);
    } else {
      const updated = [movieToSave, ...savedMovies];
      saveMoviesToStorage(updated);
    }
  };

  const handleDeleteMovie = (id: string) => {
    const updated = savedMovies.filter((m) => m.id !== id);
    saveMoviesToStorage(updated);
  };

  const handleGenerateMovie = async (options: GenerationOptions) => {
    setIsGenerating(true);
    setActiveSceneIndex(0);

    try {
      const res = await fetch('/api/movie/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (data && data.success && data.movie) {
        setCurrentMovie(data.movie);
      } else {
        const fallback = createClientSideFallbackMovie(options);
        setCurrentMovie(fallback);
      }
    } catch (err) {
      console.warn('API error, using fallback video story engine:', err);
      const fallback = createClientSideFallbackMovie(options);
      setCurrentMovie(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSceneImage = async (sceneIndex: number) => {
    if (!currentMovie || !currentMovie.scenes[sceneIndex]) return;
    const scene = currentMovie.scenes[sceneIndex];

    try {
      const res = await fetch('/api/movie/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: scene.visualPrompt || currentMovie.title,
          aspectRatio: currentMovie.aspectRatio,
        }),
      });

      const data = await res.json();
      if (data && data.imageUrl) {
        const updatedScenes = [...currentMovie.scenes];
        updatedScenes[sceneIndex] = {
          ...updatedScenes[sceneIndex],
          imageUrl: data.imageUrl,
        };
        setCurrentMovie({
          ...currentMovie,
          scenes: updatedScenes,
        });
      }
    } catch (e) {
      console.warn('Failed to regenerate scene visual:', e);
    }
  };

  return (
    <div id="enhance-ai-app" className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black pb-16">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedMoviesCount={savedMovies.length}
        onOpenSavedMovies={() => setIsSavedModalOpen(true)}
      />

      {/* Main Studio Views */}
      <main className="transition-all">
        {activeTab === 'photo' ? (
          <ImageEnhancerStudio />
        ) : (
          <div className="space-y-6">
            {/* Loading Overlay */}
            {isGenerating && <LoadingOverlay language={selectedLanguage} />}

            {/* Movie Player & Scene Timeline if Movie Exists */}
            {currentMovie && (
              <div className="space-y-6 animate-fadeIn">
                <MoviePlayer
                  movie={currentMovie}
                  onSaveMovie={handleSaveMovie}
                  isSaved={savedMovies.some((m) => m.id === currentMovie.id)}
                />

                <SceneTimeline
                  movie={currentMovie}
                  activeSceneIndex={activeSceneIndex}
                  onSelectScene={setActiveSceneIndex}
                  onRegenerateSceneImage={handleRegenerateSceneImage}
                />

                <ScriptViewer movie={currentMovie} />
              </div>
            )}

            {/* Prompt & Options Input */}
            <PromptInput
              onGenerate={handleGenerateMovie}
              isGenerating={isGenerating}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />

            {/* Saved Movies Library Modal */}
            <SavedMoviesModal
              isOpen={isSavedModalOpen}
              onClose={() => setIsSavedModalOpen(false)}
              savedMovies={savedMovies}
              onSelectMovie={(movie) => {
                setCurrentMovie(movie);
                setActiveTab('video');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDeleteMovie={handleDeleteMovie}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-850 py-6 text-center text-xs text-neutral-500">
        <p>EnhanceAI • DSLR Master 8K Super Resolution & Remini AI Studio • 100% Free & Unlimited</p>
      </footer>
    </div>
  );
}
