import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Subtitles,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Sparkles,
  Camera,
  Film,
  Music,
  Check,
} from 'lucide-react';
import { MovieScript, Scene } from '../types';
import { speakNarration, stopSpeech, startAmbientScore, stopAmbientScore } from '../utils/audioSynth';

interface MoviePlayerProps {
  movie: MovieScript;
  onClose?: () => void;
  onSaveMovie?: (movie: MovieScript) => void;
  isSaved?: boolean;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({
  movie,
  onClose,
  onSaveMovie,
  isSaved = false,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [enableVoice, setEnableVoice] = useState(true);
  const [enableAudioScore, setEnableAudioScore] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(isSaved);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentScene: Scene = movie.scenes[currentSceneIndex] || movie.scenes[0];

  // Sync saved status
  useEffect(() => {
    setIsSavedLocally(isSaved);
  }, [isSaved]);

  // Handle Playback Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying) {
      // 1. Play Speech Narration if enabled
      if (enableVoice && currentScene?.narrationScript) {
        speakNarration({
          text: currentScene.narrationScript,
          language: movie.language,
          voiceGender: movie.voiceGender || 'Male',
          rate: 0.92,
        });
      }

      // 2. Play Ambient Score if enabled
      if (enableAudioScore) {
        startAmbientScore(movie.ambientAudioMood || movie.genre);
      }

      // 3. Auto advance to next scene after scene duration
      const duration = (currentScene?.durationSeconds || 8) * 1000;
      timer = setTimeout(() => {
        if (currentSceneIndex < movie.scenes.length - 1) {
          setCurrentSceneIndex((prev) => prev + 1);
        } else {
          // Reached end of movie
          setIsPlaying(false);
          stopSpeech();
          stopAmbientScore();
        }
      }, duration);
    } else {
      stopSpeech();
      stopAmbientScore();
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isPlaying, currentSceneIndex, enableVoice, enableAudioScore, movie]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopAmbientScore();
    };
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    stopSpeech();
    setCurrentSceneIndex(0);
    setIsPlaying(true);
  };

  const handleNextScene = () => {
    stopSpeech();
    if (currentSceneIndex < movie.scenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1);
    }
  };

  const handlePrevScene = () => {
    stopSpeech();
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const handleSaveToggle = () => {
    if (onSaveMovie) {
      onSaveMovie(movie);
      setIsSavedLocally(!isSavedLocally);
    }
  };

  // Export SRT Subtitles
  const handleExportSRT = () => {
    let srtContent = '';
    let currentTime = 0;

    movie.scenes.forEach((scene, idx) => {
      const startTimeStr = formatSRTTime(currentTime);
      const endTime = currentTime + (scene.durationSeconds || 8);
      const endTimeStr = formatSRTTime(endTime);

      srtContent += `${idx + 1}\n`;
      srtContent += `${startTimeStr} --> ${endTimeStr}\n`;
      srtContent += `${scene.narrationScript}\n`;
      if (scene.englishTranslation && scene.englishTranslation !== scene.narrationScript) {
        srtContent += `(${scene.englishTranslation})\n`;
      }
      srtContent += `\n`;

      currentTime = endTime;
    });

    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${movie.title.replace(/\s+/g, '_')}_subtitles.srt`;
    link.click();
  };

  // Export Screenplay JSON/Text
  const handleExportScreenplay = () => {
    let text = `=====================================================\n`;
    text += `TITLE: ${movie.title}\n`;
    text += `TAGLINE: ${movie.tagline}\n`;
    text += `LANGUAGE: ${movie.language}\n`;
    text += `GENRE: ${movie.genre}\n`;
    text += `SYNOPSIS: ${movie.synopsis}\n`;
    text += `=====================================================\n\n`;

    movie.scenes.forEach((s) => {
      text += `SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}\n`;
      text += `LOCATION: ${s.timeOfDayAndLocation}\n`;
      text += `CAMERA: ${s.cameraMotion}\n`;
      text += `VISUAL PROMPT: ${s.visualPrompt}\n`;
      text += `SPEAKER (${s.speakerVoice}): "${s.narrationScript}"\n`;
      text += `SUBTITLE (ENG): "${s.englishTranslation}"\n`;
      text += `SOUND FX: ${s.soundEffects}\n`;
      text += `-----------------------------------------------------\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${movie.title.replace(/\s+/g, '_')}_screenplay.txt`;
    link.click();
  };

  function formatSRTTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (n: number, z = 2) => String(n).padStart(z, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  return (
    <div id="movie-player-container" ref={containerRef} className="w-full max-w-5xl mx-auto px-4 py-6">
      {/* Movie Main Screen Frame */}
      <div className="relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl group">
        {/* Aspect Ratio Container */}
        <div className={`relative w-full overflow-hidden flex items-center justify-center bg-neutral-950 ${
          movie.aspectRatio.includes('9:16')
            ? 'aspect-[9/16] max-h-[70vh]'
            : movie.aspectRatio.includes('2.39')
            ? 'aspect-[2.39/1]'
            : 'aspect-video'
        }`}>
          {/* Active Scene Visual Frame with Ken Burns Animation */}
          {currentScene?.imageUrl && (
            <img
              key={currentScene.sceneNumber}
              src={currentScene.imageUrl}
              alt={currentScene.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
                isPlaying ? 'scale-115 translate-x-1 -translate-y-1' : 'scale-100'
              }`}
            />
          )}

          {/* Cinematic Letterbox Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />

          {/* Top Header Bar inside screen */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
            {/* Resolution & Genre Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500/90 text-neutral-950 font-bold text-[10px] sm:text-xs uppercase px-2.5 py-1 rounded-md shadow-md backdrop-blur-md">
                {movie.resolution}
              </span>
              <span className="bg-emerald-950/90 text-emerald-300 font-semibold text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-emerald-500/40 backdrop-blur-md">
                {movie.voiceGender || 'Male'} Voice
              </span>
              {movie.frameRate && (
                <span className="bg-neutral-900/80 text-amber-300 text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-neutral-700/60 backdrop-blur-md hidden sm:inline">
                  {movie.frameRate}
                </span>
              )}
              <span className="bg-purple-900/80 text-purple-200 text-[10px] sm:text-xs px-2.5 py-1 rounded-md border border-purple-700/60 backdrop-blur-md">
                {movie.language}
              </span>
            </div>

            {/* Scene Counter */}
            <div className="bg-neutral-900/80 text-neutral-200 text-xs font-mono px-3 py-1 rounded-md border border-neutral-700/60 backdrop-blur-md">
              SCENE {currentSceneIndex + 1} / {movie.scenes.length}
            </div>
          </div>

          {/* Camera Motion Overlay Badge */}
          {currentScene?.cameraMotion && (
            <div className="absolute top-16 left-4 bg-neutral-950/70 border border-neutral-800 backdrop-blur-md text-amber-300/90 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
              <Camera className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{currentScene.cameraMotion}</span>
            </div>
          )}

          {/* Subtitles Overlay */}
          {enableSubtitles && currentScene && (
            <div className="absolute bottom-16 left-6 right-6 text-center z-20 pointer-events-none space-y-1">
              {/* Primary Subtitle */}
              <div className="inline-block bg-neutral-950/85 border border-neutral-800/80 backdrop-blur-md px-4 py-2 rounded-xl max-w-2xl mx-auto shadow-2xl">
                <p className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wide leading-relaxed font-sans drop-shadow-md">
                  {currentScene.narrationScript}
                </p>
                {/* Secondary English Subtitle if primary is non-English */}
                {movie.language !== 'English' && currentScene.englishTranslation && (
                  <p className="text-amber-300/90 text-xs sm:text-sm font-medium mt-1 italic border-t border-neutral-800 pt-1">
                    "{currentScene.englishTranslation}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Center Big Play Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-all z-20 group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center shadow-2xl shadow-amber-500/50 transform group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-neutral-950" />
              </div>
            </button>
          )}
        </div>

        {/* Timeline Progress Bar */}
        <div className="w-full bg-neutral-900 h-1.5 flex cursor-pointer relative">
          {movie.scenes.map((scene, idx) => (
            <div
              key={scene.sceneNumber}
              onClick={() => {
                stopSpeech();
                setCurrentSceneIndex(idx);
              }}
              className="h-full flex-1 border-r border-neutral-950 relative overflow-hidden group"
            >
              <div
                className={`h-full transition-all ${
                  idx < currentSceneIndex
                    ? 'bg-amber-500'
                    : idx === currentSceneIndex
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-neutral-800'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Player Controls Bar */}
        <div className="bg-neutral-950 p-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
          {/* Left Controls: Play, Replay, Prev, Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all cursor-pointer shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-neutral-950" /> : <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />}
            </button>

            <button
              onClick={handleReplay}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
              title="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 border-l border-neutral-800 pl-2 ml-1">
              <button
                onClick={handlePrevScene}
                disabled={currentSceneIndex === 0}
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 transition-colors"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextScene}
                disabled={currentSceneIndex === movie.scenes.length - 1}
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 transition-colors"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Info Title */}
          <div className="hidden md:block text-center max-w-xs">
            <h3 className="text-sm font-bold text-white font-serif truncate">{movie.title}</h3>
            <p className="text-xs text-neutral-400 truncate">{currentScene?.title}</p>
          </div>

          {/* Right Controls: Subtitles, Audio Toggles, Export, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Toggle Speech Voice */}
            <button
              onClick={() => setEnableVoice(!enableVoice)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                enableVoice
                  ? 'bg-neutral-900 border-amber-500/50 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title="Toggle AI Speech Voiceover"
            >
              {enableVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Toggle Audio Score */}
            <button
              onClick={() => setEnableAudioScore(!enableAudioScore)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                enableAudioScore
                  ? 'bg-neutral-900 border-purple-500/50 text-purple-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title="Toggle Ambient Score"
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Toggle Subtitles */}
            <button
              onClick={() => setEnableSubtitles(!enableSubtitles)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                enableSubtitles
                  ? 'bg-neutral-900 border-rose-500/50 text-rose-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500'
              }`}
              title="Toggle Subtitles"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Save to Library */}
            <button
              onClick={handleSaveToggle}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                isSavedLocally
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
              }`}
              title="Save Movie to Library"
            >
              {isSavedLocally ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs flex items-center gap-1 transition-all cursor-pointer"
                title="Export & Download Options"
              >
                <Download className="w-4 h-4 text-emerald-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 bottom-12 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
                  {currentScene?.imageUrl && (
                    <a
                      href={currentScene.imageUrl}
                      download={`scene_${currentSceneIndex + 1}_frame.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:bg-neutral-800 rounded-lg flex items-center gap-2"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Current Frame (HD)</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      handleExportSRT();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2"
                  >
                    <Subtitles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Download Subtitles (.SRT)</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportScreenplay();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Script (.TXT)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Movie Details Summary Bar */}
      <div className="mt-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-serif">{movie.title}</h2>
          <p className="text-xs text-amber-400 italic">"{movie.tagline}"</p>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">{movie.synopsis}</p>
        </div>
        <div className="text-right text-xs text-neutral-500 font-mono space-y-1 shrink-0">
          <div>SPEAKER: {currentScene?.speakerVoice || 'AI Narrator'}</div>
          <div>EST DURATION: ~{movie.totalDurationSeconds}s</div>
        </div>
      </div>
    </div>
  );
};
