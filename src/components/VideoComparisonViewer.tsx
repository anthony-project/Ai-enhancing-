import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Columns,
  Camera,
  RefreshCw,
  Check,
  Download,
  Film,
} from 'lucide-react';
import {
  VideoEnhanceOptions,
  getEnhancedVideoCssFilter,
  renderEnhancedVideoFrame,
  exportEnhancedVideo,
} from '../utils/videoEnhancer';
import { downloadEnhancedImage } from '../utils/reminiEnhancer';

interface VideoComparisonViewerProps {
  videoSrc: string;
  options: VideoEnhanceOptions;
  dimensions?: { width: number; height: number };
  duration?: number;
  fileName?: string;
  onExtractFrame?: (frameDataUrl: string) => void;
  hideDownloadButton?: boolean;
}

export const VideoComparisonViewer: React.FC<VideoComparisonViewerProps> = ({
  videoSrc,
  options,
  dimensions,
  duration,
  fileName,
  onExtractFrame,
  hideDownloadButton = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 - 100)
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide' | 'enhancedOnly'>('split');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const masterVideoRef = useRef<HTMLVideoElement>(null);
  const enhancedVideoRef = useRef<HTMLVideoElement>(null);
  const sideBySideOrigRef = useRef<HTMLVideoElement>(null);
  const sideBySideEnhRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Compute ultra-fast hardware GPU CSS filter
  const cssFilter = getEnhancedVideoCssFilter(options);
  const lastTimeUpdateRef = useRef<number>(0);

  // Bind native synchronized events across video elements for 0 lag and 60fps hardware sync
  useEffect(() => {
    const master = masterVideoRef.current;
    const enh = enhancedVideoRef.current;
    if (!master || !enh) return;

    const onMasterPlay = () => {
      enh.currentTime = master.currentTime;
      enh.play().catch(() => {});
      setIsPlaying(true);
    };

    const onMasterPause = () => {
      enh.pause();
      setIsPlaying(false);
    };

    const onMasterSeeking = () => {
      enh.currentTime = master.currentTime;
    };

    const onMasterSeeked = () => {
      enh.currentTime = master.currentTime;
    };

    const onMasterRateChange = () => {
      enh.playbackRate = master.playbackRate;
    };

    const onMasterWaiting = () => {
      enh.pause();
    };

    const onMasterPlaying = () => {
      if (enh.paused) {
        enh.currentTime = master.currentTime;
        enh.play().catch(() => {});
      }
    };

    master.addEventListener('play', onMasterPlay);
    master.addEventListener('pause', onMasterPause);
    master.addEventListener('seeking', onMasterSeeking);
    master.addEventListener('seeked', onMasterSeeked);
    master.addEventListener('ratechange', onMasterRateChange);
    master.addEventListener('waiting', onMasterWaiting);
    master.addEventListener('playing', onMasterPlaying);

    return () => {
      master.removeEventListener('play', onMasterPlay);
      master.removeEventListener('pause', onMasterPause);
      master.removeEventListener('seeking', onMasterSeeking);
      master.removeEventListener('seeked', onMasterSeeked);
      master.removeEventListener('ratechange', onMasterRateChange);
      master.removeEventListener('waiting', onMasterWaiting);
      master.removeEventListener('playing', onMasterPlaying);
    };
  }, [viewMode, videoSrc]);

  // Synchronize playback state across active videos
  const togglePlay = () => {
    const master = masterVideoRef.current;
    if (!master) return;

    if (master.paused) {
      if (enhancedVideoRef.current) {
        enhancedVideoRef.current.currentTime = master.currentTime;
        enhancedVideoRef.current.play().catch(() => {});
      }
      if (sideBySideOrigRef.current) sideBySideOrigRef.current.play().catch(() => {});
      if (sideBySideEnhRef.current) sideBySideEnhRef.current.play().catch(() => {});
      master.play().catch(() => {});
      setIsPlaying(true);
    } else {
      master.pause();
      if (enhancedVideoRef.current) enhancedVideoRef.current.pause();
      if (sideBySideOrigRef.current) sideBySideOrigRef.current.pause();
      if (sideBySideEnhRef.current) sideBySideEnhRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    const allVideos = [
      masterVideoRef.current,
      enhancedVideoRef.current,
      sideBySideOrigRef.current,
      sideBySideEnhRef.current,
    ];
    allVideos.forEach((v) => {
      if (v) v.currentTime = time;
    });
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    const now = Date.now();
    // Throttle React state updates to ~2 times per second to eliminate 60fps UI re-render lag
    if (now - lastTimeUpdateRef.current > 500) {
      lastTimeUpdateRef.current = now;
      setCurrentTime(vid.currentTime);
    }
  };

  // Slider Dragging with 60fps requestAnimationFrame throttling
  const handleSliderMove = useCallback((clientX: number) => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    });
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

  // Extract High-Res Frame
  const handleCaptureFrame = () => {
    const vid = masterVideoRef.current || enhancedVideoRef.current;
    if (!vid || vid.videoWidth === 0) return;

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = vid.videoWidth;
    offscreenCanvas.height = vid.videoHeight;

    renderEnhancedVideoFrame(vid, offscreenCanvas, options);
    const dataUrl = offscreenCanvas.toDataURL('image/png', 1.0);

    if (onExtractFrame) {
      onExtractFrame(dataUrl);
    } else {
      downloadEnhancedImage(dataUrl, `enhanced_video_frame_${Date.now()}.png`);
    }
  };

  // Export video
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(1);

    try {
      const { blob, filename } = await exportEnhancedVideo(
        videoSrc,
        options,
        (p) => setExportProgress(p),
        fileName ? `Enhanced_${fileName}` : undefined
      );

      setExportProgress(100);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `enhanced_8k_video_${Date.now()}.mp4`;
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

  const totalDuration =
    duration || (masterVideoRef.current ? masterVideoRef.current.duration : 0) || 0;

  return (
    <div className="space-y-3 select-none w-full">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900/95 p-2.5 rounded-xl border border-neutral-800 text-xs shadow-md">
        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer text-xs ${
              viewMode === 'split'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Interactive Split Slider (Before vs After)"
          >
            <Sliders className="w-3 h-3" />
            <span>Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer text-xs ${
              viewMode === 'sideBySide'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Side by Side Comparison"
          >
            <Columns className="w-3 h-3" />
            <span>Side by Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('enhancedOnly')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer text-xs ${
              viewMode === 'enhancedOnly'
                ? 'bg-amber-400 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-100'
            }`}
            title="Full 8K Enhanced Video View"
          >
            <Sparkles className="w-3 h-3" />
            <span>Enhanced 8K</span>
          </button>
        </div>

        {/* Action buttons: Extract Frame (and optional Download if enabled) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCaptureFrame}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-100 font-semibold rounded-lg border border-neutral-700 transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 text-xs"
            title="Capture current video frame as 8K Photo"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Capture 8K Frame</span>
          </button>

          {!hideDownloadButton && (
            <button
              type="button"
              onClick={handleExportVideo}
              disabled={isExporting}
              className="px-3 py-1 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-neutral-950 font-black rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95 text-xs"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-950 animate-spin" />
                  <span>Exporting ({exportProgress}%)...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Download Video</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Export Progress Bar when active */}
      {isExporting && (
        <div className="bg-neutral-900 border border-emerald-500/40 rounded-xl p-2.5 space-y-1.5 shadow-xl animate-fadeIn text-xs">
          <div className="flex items-center justify-between font-bold text-neutral-200">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Fast 8K Processing & MP4 Hardware Encoding</span>
            </span>
            <span className="font-mono text-emerald-400 font-black">{exportProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ================= SLEEK & COMPACT VIDEO VIEWPORT ================= */}
      <div
        ref={containerRef}
        className="relative w-full h-[280px] sm:h-[350px] max-h-[50vh] bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-xl flex items-center justify-center select-none"
      >
        {/* ================= VIEW MODE 1: SPLIT SLIDER ================= */}
        {viewMode === 'split' && Boolean(videoSrc) && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Original Video (Left side of slider) */}
            <video
              ref={masterVideoRef}
              src={videoSrc}
              playsInline
              preload="auto"
              loop
              muted={isMuted}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                willChange: 'clip-path, transform',
                transform: 'translate3d(0, 0, 0)',
              }}
              onTimeUpdate={handleVideoTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Enhanced Video with GPU Hardware CSS Filter (Right side of slider) */}
            <video
              ref={enhancedVideoRef}
              src={videoSrc}
              playsInline
              preload="auto"
              loop
              muted
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                filter: cssFilter,
                clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                willChange: 'clip-path, filter, transform',
                transform: 'translate3d(0, 0, 0)',
              }}
            />

            {/* Original Tag */}
            <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-neutral-300 border border-white/10 uppercase tracking-wider shadow flex items-center gap-1 pointer-events-none">
              <Film className="w-3 h-3 text-neutral-400" />
              <span>Original</span>
            </div>

            {/* 8K Enhanced Tag */}
            <div className="absolute top-2.5 right-2.5 bg-amber-950/85 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1 shadow pointer-events-none">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>8K Enhanced</span>
            </div>

            {/* ================= COMPACT VIDEO SLIDER HANDLE ================= */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
              style={{ left: `${sliderPosition}%` }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div
                className={`px-2.5 py-1 min-w-[70px] rounded-xl bg-neutral-950 text-amber-400 shadow-xl flex items-center justify-center gap-1.5 border border-amber-400 cursor-ew-resize select-none transition-transform hover:scale-105 active:scale-95 ${
                  isDraggingSlider ? 'scale-105 ring-2 ring-amber-400/50 bg-neutral-900' : ''
                }`}
                style={{ touchAction: 'none' }}
              >
                <span className="text-[10px] font-black text-amber-300">◀</span>
                <span className="text-[9px] font-black tracking-wider text-white">8K SLIDE</span>
                <span className="text-[10px] font-black text-amber-300">▶</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW MODE 2: SIDE BY SIDE ================= */}
        {viewMode === 'sideBySide' && Boolean(videoSrc) && (
          <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-1.5 p-1.5 bg-neutral-950">
            {/* Left Box: Original */}
            <div className="relative w-full h-full min-h-[130px] rounded-lg overflow-hidden border border-neutral-800 flex items-center justify-center bg-black shadow-inner">
              <video
                ref={sideBySideOrigRef}
                src={videoSrc}
                playsInline
                loop
                muted={isMuted}
                className="w-full h-full object-contain pointer-events-none"
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              <div className="absolute top-2 left-2 bg-neutral-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-neutral-300 border border-white/10 flex items-center gap-1 pointer-events-none">
                <Film className="w-3 h-3 text-neutral-400" />
                <span>Original</span>
              </div>
            </div>

            {/* Right Box: Enhanced 8K */}
            <div className="relative w-full h-full min-h-[130px] rounded-lg overflow-hidden border border-amber-500/40 flex items-center justify-center bg-black shadow-inner">
              <video
                ref={sideBySideEnhRef}
                src={videoSrc}
                playsInline
                loop
                muted
                style={{ filter: cssFilter }}
                className="w-full h-full object-contain pointer-events-none"
              />
              <div className="absolute top-2 left-2 bg-amber-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1 pointer-events-none">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>8K Enhanced</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW MODE 3: FULL ENHANCED 8K VIEW ================= */}
        {viewMode === 'enhancedOnly' && Boolean(videoSrc) && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={masterVideoRef}
              src={videoSrc}
              playsInline
              loop
              muted={isMuted}
              style={{ filter: cssFilter }}
              className="w-full h-full object-contain pointer-events-none"
              onTimeUpdate={handleVideoTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="absolute top-2.5 right-2.5 bg-amber-950/85 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1 shadow pointer-events-none">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Full 8K View</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Playback & Scrubber Controls Bar */}
      <div className="bg-neutral-900/95 border border-neutral-800 p-2.5 rounded-xl space-y-2 shadow-sm">
        {/* Scrubber Range */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
          <span className="font-bold text-amber-400 w-9">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={totalDuration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-neutral-800 accent-amber-400 rounded cursor-pointer"
          />
          <span className="text-neutral-400 w-9 text-right">{formatTime(totalDuration)}</span>
        </div>

        {/* Bottom Playback Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg font-black transition-transform active:scale-95 cursor-pointer shadow flex items-center gap-1.5 text-xs"
              title={isPlaying ? 'Pause Video' : 'Play Video'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-neutral-950" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const allVideos = [
                  masterVideoRef.current,
                  enhancedVideoRef.current,
                  sideBySideOrigRef.current,
                  sideBySideEnhRef.current,
                ];
                allVideos.forEach((v) => {
                  if (v) v.currentTime = 0;
                });
                setCurrentTime(0);
              }}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Speed Selector */}
            <div className="flex items-center text-[10px] bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 text-neutral-300 gap-1">
              <span className="text-neutral-400 font-semibold">Speed:</span>
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setPlaybackRate(rate);
                    const allVideos = [
                      masterVideoRef.current,
                      enhancedVideoRef.current,
                      sideBySideOrigRef.current,
                      sideBySideEnhRef.current,
                    ];
                    allVideos.forEach((v) => {
                      if (v) v.playbackRate = rate;
                    });
                  }}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    playbackRate === rate ? 'bg-amber-400 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {dimensions && (
            <div className="text-[10px] font-mono text-emerald-400 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{dimensions.width} × {dimensions.height} px</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
