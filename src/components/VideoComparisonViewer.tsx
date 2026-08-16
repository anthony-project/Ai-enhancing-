import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Check,
  Sparkles,
  Sliders,
  Columns,
  Camera,
  RefreshCw,
  Zap,
  Film,
} from 'lucide-react';
import { VideoEnhanceOptions, renderEnhancedVideoFrame, exportEnhancedVideo } from '../utils/videoEnhancer';
import { downloadEnhancedImage } from '../utils/reminiEnhancer';

interface VideoComparisonViewerProps {
  videoSrc: string;
  options: VideoEnhanceOptions;
  dimensions?: { width: number; height: number };
  duration?: number;
  onExtractFrame?: (frameDataUrl: string) => void;
}

export const VideoComparisonViewer: React.FC<VideoComparisonViewerProps> = ({
  videoSrc,
  options,
  dimensions,
  duration,
  onExtractFrame,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide' | 'enhancedOnly'>('split');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const sideBySideOrigVideoRef = useRef<HTMLVideoElement>(null);
  const splitOrigVideoRef = useRef<HTMLVideoElement>(null);
  const enhancedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Synchronous GPU frame rendering
  const renderFrame = useCallback(() => {
    if (originalVideoRef.current && enhancedCanvasRef.current) {
      const vid = originalVideoRef.current;
      const canvas = enhancedCanvasRef.current;

      if (vid.videoWidth > 0 && vid.videoHeight > 0) {
        if (canvas.width !== vid.videoWidth || canvas.height !== vid.videoHeight) {
          canvas.width = vid.videoWidth;
          canvas.height = vid.videoHeight;
        }
        renderEnhancedVideoFrame(vid, canvas, options);
      }
    }
  }, [options]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (originalVideoRef.current && !originalVideoRef.current.paused) {
        renderFrame();
        setCurrentTime(originalVideoRef.current.currentTime);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // Robust Initial & Static draw: ensures enhanced frame is visible IMMEDIATELY without requiring play
  useEffect(() => {
    const vid = originalVideoRef.current;
    if (vid) {
      const onReady = () => {
        renderFrame();
      };

      vid.addEventListener('loadedmetadata', onReady);
      vid.addEventListener('loadeddata', onReady);
      vid.addEventListener('canplay', onReady);
      vid.addEventListener('seeked', onReady);
      vid.addEventListener('timeupdate', onReady);

      // Eager initial render attempts in case video is already cached/buffered
      renderFrame();
      const retryInterval = setInterval(() => {
        if (vid.readyState >= 1 && vid.videoWidth > 0) {
          renderFrame();
        }
      }, 100);

      const stopRetry = setTimeout(() => {
        clearInterval(retryInterval);
      }, 2000);

      return () => {
        vid.removeEventListener('loadedmetadata', onReady);
        vid.removeEventListener('loadeddata', onReady);
        vid.removeEventListener('canplay', onReady);
        vid.removeEventListener('seeked', onReady);
        vid.removeEventListener('timeupdate', onReady);
        clearInterval(retryInterval);
        clearTimeout(stopRetry);
      };
    }
  }, [renderFrame, videoSrc]);

  // Redraw when options change
  useEffect(() => {
    renderFrame();
  }, [options, renderFrame]);

  const togglePlay = () => {
    if (originalVideoRef.current) {
      if (originalVideoRef.current.paused) {
        originalVideoRef.current.play();
        if (splitOrigVideoRef.current) splitOrigVideoRef.current.play().catch(() => {});
        if (sideBySideOrigVideoRef.current) sideBySideOrigVideoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        originalVideoRef.current.pause();
        if (splitOrigVideoRef.current) splitOrigVideoRef.current.pause();
        if (sideBySideOrigVideoRef.current) sideBySideOrigVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (originalVideoRef.current) {
      originalVideoRef.current.currentTime = time;
      if (splitOrigVideoRef.current) splitOrigVideoRef.current.currentTime = time;
      if (sideBySideOrigVideoRef.current) sideBySideOrigVideoRef.current.currentTime = time;
      renderFrame();
    }
  };

  // Slider dragging logic
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingSlider(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handleSliderMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    e.preventDefault();
    handleSliderMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingSlider(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Extract high-res frame
  const handleCaptureFrame = () => {
    if (enhancedCanvasRef.current) {
      const dataUrl = enhancedCanvasRef.current.toDataURL('image/png', 1.0);
      if (onExtractFrame) {
        onExtractFrame(dataUrl);
      } else {
        downloadEnhancedImage(dataUrl, `enhanced_video_frame_${Date.now()}.png`);
      }
    }
  };

  // Export video with strictly guaranteed 100% completion (No loop restart)
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(1);

    try {
      const blob = await exportEnhancedVideo(
        videoSrc,
        options,
        (p) => setExportProgress(p)
      );

      setExportProgress(100);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_8k_video_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 2500);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Video export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDuration = duration || (originalVideoRef.current ? originalVideoRef.current.duration : 0) || 0;

  return (
    <div className="space-y-4 select-none w-full">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-neutral-900/95 p-3 rounded-2xl border border-neutral-800 text-xs shadow-md">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
              viewMode === 'split'
                ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-300'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Interactive Large Split Slider (Before vs After)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
              viewMode === 'sideBySide'
                ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-300'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Side by Side Large Comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side by Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('enhancedOnly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
              viewMode === 'enhancedOnly'
                ? 'bg-amber-400 text-neutral-950 shadow-md ring-1 ring-amber-300'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Full 8K Enhanced Video View"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Enhanced 8K</span>
          </button>
        </div>

        {/* Action buttons: Extract Frame & Download */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-100 font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Capture current video frame as 8K Photo"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Capture 8K Frame</span>
          </button>

          <button
            type="button"
            onClick={handleExportVideo}
            disabled={isExporting}
            className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-neutral-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95 text-xs sm:text-sm"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 text-neutral-950 animate-spin" />
                <span>Exporting 8K Video ({exportProgress}%)...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-neutral-950 stroke-[3]" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Enhanced Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Progress Bar when active */}
      {isExporting && (
        <div className="bg-neutral-900 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Fast 8K Processing & GPU Encoding</span>
            </span>
            <span className="font-mono text-emerald-400 text-sm font-black">{exportProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400 text-center">
            {exportProgress < 100
              ? 'Rendering high dynamic contrast & temporal detail without quality loss...'
              : 'Encoding finished! Preparing high-res download...'}
          </p>
        </div>
      )}

      {/* ================= EXTRA LARGE & IMMERSIVE VIDEO VIEWPORT ================= */}
      <div
        ref={containerRef}
        className="relative w-full min-h-[460px] sm:min-h-[560px] md:min-h-[640px] max-h-[82vh] bg-black rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-2xl flex items-center justify-center select-none"
      >
        {/* Hidden Master Video Element (Hardware synchronized) */}
        <video
          ref={originalVideoRef}
          src={videoSrc}
          playsInline
          loop
          muted={isMuted}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-0"
          onTimeUpdate={() => {
            if (originalVideoRef.current) {
              setCurrentTime(originalVideoRef.current.currentTime);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />

        {/* ================= VIEW MODE 1: SPLIT SLIDER WITH ENLARGED TOUCH HANDLE ================= */}
        {viewMode === 'split' && (
          <div className="relative w-full h-full min-h-[460px] sm:min-h-[560px] md:min-h-[640px] flex items-center justify-center overflow-hidden">
            {/* Background Canvas: 8K Enhanced (Full View) */}
            <canvas
              ref={enhancedCanvasRef}
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Foreground: Original Video (Clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <video
                ref={splitOrigVideoRef}
                src={videoSrc}
                playsInline
                loop
                muted
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                  height: containerRef.current ? `${containerRef.current.clientHeight}px` : '100%',
                }}
                onLoadedMetadata={() => {
                  if (splitOrigVideoRef.current && originalVideoRef.current) {
                    splitOrigVideoRef.current.currentTime = originalVideoRef.current.currentTime;
                  }
                }}
              />
              {/* Original Tag */}
              <div className="absolute top-4 left-4 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-300 border border-white/10 uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-neutral-400" />
                <span>Original Video</span>
              </div>
            </div>

            {/* 8K Enhanced Tag */}
            <div className="absolute top-4 right-4 bg-amber-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>8K Enhanced Video</span>
            </div>

            {/* ================= PROMINENT & EXTRA LARGE VIDEO SLIDER BOX ================= */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.9)] cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
              style={{ left: `${sliderPosition}%` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* EXTRA LARGE SLIDER HANDLE BOX (Requested: Only Video mode me bada box) */}
              <div
                className={`min-w-[95px] px-3.5 py-2 rounded-2xl bg-neutral-950 text-amber-400 shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center justify-center gap-2 border-2 border-amber-400 cursor-ew-resize select-none transition-transform hover:scale-105 active:scale-95 ${
                  isDraggingSlider ? 'scale-110 ring-4 ring-amber-400/50 bg-neutral-900' : ''
                }`}
                style={{ touchAction: 'none' }}
              >
                <span className="text-[13px] font-black text-amber-300 animate-pulse">◀</span>
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[11px] font-black tracking-wider text-white">8K UHD</span>
                  <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tight">SLIDE</span>
                </div>
                <span className="text-[13px] font-black text-amber-300 animate-pulse">▶</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW MODE 2: EXTRA LARGE SIDE BY SIDE ================= */}
        {viewMode === 'sideBySide' && (
          <div className="w-full h-full min-h-[460px] sm:min-h-[560px] md:min-h-[640px] grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-neutral-950">
            {/* Left Box: Original */}
            <div className="relative w-full h-full min-h-[260px] md:min-h-[540px] rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center bg-black shadow-inner">
              <video
                ref={sideBySideOrigVideoRef}
                src={videoSrc}
                playsInline
                loop
                muted
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                  if (sideBySideOrigVideoRef.current && originalVideoRef.current) {
                    sideBySideOrigVideoRef.current.currentTime = originalVideoRef.current.currentTime;
                  }
                }}
              />
              <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-300 border border-white/10 flex items-center gap-1.5 shadow-md">
                <Film className="w-3.5 h-3.5 text-neutral-400" />
                <span>Original Video</span>
              </div>
            </div>

            {/* Right Box: Enhanced 8K */}
            <div className="relative w-full h-full min-h-[260px] md:min-h-[540px] rounded-xl overflow-hidden border-2 border-amber-500/50 flex items-center justify-center bg-black shadow-inner">
              <canvas
                ref={enhancedCanvasRef}
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-amber-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>8K Enhanced (UHD Dynamic)</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW MODE 3: FULL ENHANCED 8K VIEW ================= */}
        {viewMode === 'enhancedOnly' && (
          <div className="relative w-full h-full min-h-[460px] sm:min-h-[560px] md:min-h-[640px] flex items-center justify-center bg-black">
            <canvas
              ref={enhancedCanvasRef}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 right-4 bg-amber-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full 8K Enhanced Video View</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Playback & Scrubber Controls Bar */}
      <div className="bg-neutral-900/95 border border-neutral-800 p-3.5 rounded-2xl space-y-3 shadow-lg">
        {/* Scrubber Range */}
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span className="font-bold text-amber-400 w-10">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={totalDuration || 100}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-neutral-800 accent-amber-400 rounded-lg cursor-pointer transition-all"
          />
          <span className="text-neutral-400 w-10 text-right">{formatTime(totalDuration)}</span>
        </div>

        {/* Bottom Playback Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black transition-transform active:scale-95 cursor-pointer shadow-md flex items-center gap-2"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-neutral-950" />
                  <span className="text-xs">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-neutral-950" />
                  <span className="text-xs">Play Video</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (originalVideoRef.current) {
                  originalVideoRef.current.currentTime = 0;
                  if (splitOrigVideoRef.current) splitOrigVideoRef.current.currentTime = 0;
                  if (sideBySideOrigVideoRef.current) sideBySideOrigVideoRef.current.currentTime = 0;
                  renderFrame();
                }
              }}
              className="p-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl transition-colors cursor-pointer"
              title="Restart Video from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center text-xs bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-neutral-800 text-neutral-300 gap-1.5">
              <span className="text-[11px] text-neutral-400 font-semibold">Speed:</span>
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(rate);
                    if (originalVideoRef.current) originalVideoRef.current.playbackRate = rate;
                    if (splitOrigVideoRef.current) splitOrigVideoRef.current.playbackRate = rate;
                    if (sideBySideOrigVideoRef.current) sideBySideOrigVideoRef.current.playbackRate = rate;
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    playbackRate === rate ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {dimensions && (
            <div className="text-[11px] font-mono text-emerald-400 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{dimensions.width} × {dimensions.height} px (100% Native)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
