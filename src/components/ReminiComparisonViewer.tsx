import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Sliders,
  Columns,
  Eye,
  Check,
  Zap,
  Copy,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { downloadEnhancedImage, copyImageToClipboard } from '../utils/reminiEnhancer';

interface ReminiComparisonViewerProps {
  originalImage: string;
  enhancedImage: string;
  originalDimensions?: { width: number; height: number };
  enhancedDimensions?: { width: number; height: number };
  onClose?: () => void;
  onUseForVideo?: (enhancedImg: string) => void;
}

export const ReminiComparisonViewer: React.FC<ReminiComparisonViewerProps> = ({
  originalImage,
  enhancedImage,
  originalDimensions,
  enhancedDimensions,
  onClose,
  onUseForVideo,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide' | 'after'>('split');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Handle Dragging
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowLeft' && viewMode === 'split') {
        setSliderPosition((prev) => Math.max(0, prev - 5));
      } else if (e.key === 'ArrowRight' && viewMode === 'split') {
        setSliderPosition((prev) => Math.min(100, prev + 5));
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, viewMode]);

  // Close download menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safe Blob-Based Download Trigger
  const handleDirectDownload = async (format: 'png' | 'jpeg' = 'png') => {
    setIsDownloading(true);
    setShowDownloadMenu(false);
    try {
      const filename = `ultra_hd_8k_enhanced_${Date.now()}.${format}`;
      const success = await downloadEnhancedImage(enhancedImage, filename, format);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy to Clipboard
  const handleCopyClipboard = async () => {
    setShowDownloadMenu(false);
    const ok = await copyImageToClipboard(enhancedImage);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  // Open Full-Size in New Tab
  const handleOpenFullSize = () => {
    setShowDownloadMenu(false);
    const win = window.open();
    if (win) {
      win.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Ultra HD 8K Enhanced Image</title>
            <style>
              body { margin: 0; background: #09090b; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; color: #fff; }
              .header { position: fixed; top: 0; left: 0; right: 0; padding: 12px 24px; background: rgba(15,15,20,0.9); backdrop-filter: blur(12px); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; z-index: 100; }
              .btn { background: #10b981; color: #000; font-weight: 700; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 13px; }
              img { max-width: 96%; height: auto; margin-top: 70px; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); }
            </style>
          </head>
          <body>
            <div class="header">
              <span style="font-weight:bold;color:#f59e0b;">✨ Ultra HD 8K Master Output</span>
              <a class="btn" href="${enhancedImage}" download="ultra_8k_photo_${Date.now()}.png">Save 8K Image</a>
            </div>
            <img src="${enhancedImage}" alt="Ultra HD 8K Output" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div
      className={`relative bg-neutral-950 border border-neutral-800/90 rounded-2xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none flex flex-col'
          : 'w-full my-4'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ULTRA HD 8K COMPARISON VIEWER
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-medium">
            Zero Watermark • 8K UHD
          </span>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden md:inline">Split Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'sideBySide'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span className="hidden md:inline">Side by Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('after')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'after'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">8K Result Only</span>
          </button>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-300 w-12 text-center font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(5.0, +(prev + 0.5).toFixed(1)))}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Zoom In (Up to 500% / 100x Detail)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all ml-1 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className={`relative w-full overflow-hidden bg-neutral-950 flex items-center justify-center select-none ${
          isFullscreen ? 'flex-1 h-full' : 'h-[380px] sm:h-[500px]'
        }`}
      >
        {/* VIEW MODE 1: REMINI SPLIT SLIDER */}
        {viewMode === 'split' && (
          <div
            ref={containerRef}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onMouseMove={handleMouseMove}
            onTouchStart={(e) => {
              setIsDragging(true);
              if (e.touches[0]) handleMove(e.touches[0].clientX);
            }}
            onTouchMove={handleTouchMove}
            className="relative w-full h-full cursor-ew-resize overflow-hidden flex items-center justify-center"
          >
            {/* Zoom Wrapper */}
            <div
              style={{ transform: `scale(${zoomLevel})` }}
              className="relative w-full h-full transition-transform duration-100 flex items-center justify-center"
            >
              {/* Background Layer: Enhanced (After) Image */}
              <img
                src={enhancedImage}
                alt="8K Enhanced After"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              {/* Foreground Layer: Original (Before) Image with clip path */}
              <div
                style={{
                  clipPath: isHoldingOriginal
                    ? 'inset(0 0 0 0)'
                    : `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
              >
                <img
                  src={originalImage}
                  alt="Original Low-Res Before"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter contrast-90 brightness-95"
                />
              </div>

              {/* Draggable Split Line & Handle */}
              {!isHoldingOriginal && (
                <div
                  style={{ left: `${sliderPosition}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] pointer-events-none flex items-center justify-center z-20"
                >
                  <div className="w-8 h-8 rounded-full bg-white text-neutral-900 shadow-2xl border-2 border-neutral-950 flex items-center justify-center font-bold text-xs pointer-events-auto cursor-ew-resize transform active:scale-110 transition-transform">
                    <Sliders className="w-4 h-4 text-neutral-900" />
                  </div>
                </div>
              )}
            </div>

            {/* Badges on stage */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <span className="bg-neutral-950/80 backdrop-blur-md text-neutral-300 text-[11px] font-mono px-3 py-1 rounded-md border border-neutral-800">
                BEFORE (Original)
              </span>
            </div>
            <div className="absolute top-4 right-4 z-30 pointer-events-none">
              <span className="bg-gradient-to-r from-amber-500 to-emerald-400 text-neutral-950 font-extrabold text-[11px] font-mono px-3 py-1 rounded-md shadow-lg">
                AFTER (Ultra 8K AI)
              </span>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: SIDE BY SIDE */}
        {viewMode === 'sideBySide' && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-2 p-2"
          >
            <div className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <span className="absolute top-3 left-3 bg-neutral-950/80 text-neutral-400 text-[10px] font-mono px-2.5 py-1 rounded border border-neutral-700 z-10">
                Original (Low Res)
              </span>
              <img
                src={originalImage}
                alt="Before"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter contrast-90 brightness-95"
              />
            </div>
            <div className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden border border-amber-500/40 flex items-center justify-center">
              <span className="absolute top-3 right-3 bg-amber-500 text-neutral-950 text-[10px] font-bold font-mono px-2.5 py-1 rounded shadow z-10">
                Ultra 8K AI Enhanced
              </span>
              <img
                src={enhancedImage}
                alt="After"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* VIEW MODE 3: 8K RESULT ONLY */}
        {viewMode === 'after' && (
          <div
            style={{ transform: `scale(${zoomLevel})` }}
            className="w-full h-full flex items-center justify-center p-2"
          >
            <img
              src={enhancedImage}
              alt="8K Enhanced Result"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Bottom Quick-Tip / Hold Button */}
        {viewMode === 'split' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className="px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 text-xs font-medium rounded-full border border-neutral-700 backdrop-blur-md shadow-lg transition-all active:bg-amber-500 active:text-neutral-950 cursor-pointer"
            >
              Hold to See Original
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 bg-neutral-900/95 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Specs Info */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <span className="font-mono text-neutral-200 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            {enhancedDimensions
              ? `${enhancedDimensions.width} × ${enhancedDimensions.height} px`
              : '7680 × 4320 (8K UHD)'}
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">Zero Watermark</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">Neural Micro-Sharpened</span>
        </div>

        {/* Action Buttons with Download Menu */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {onUseForVideo && (
            <button
              type="button"
              onClick={() => onUseForVideo(enhancedImage)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Use in AI Video</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl border border-neutral-700 transition-all cursor-pointer"
            title="Copy Image to Clipboard"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="hidden md:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Primary 8K Download Button & Dropdown */}
          <div className="relative flex items-center" ref={downloadMenuRef}>
            <button
              type="button"
              onClick={() => handleDirectDownload('png')}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold rounded-l-xl shadow-xl shadow-emerald-950/60 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Downloaded 8K Image!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Image...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Ultra 8K Image</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-600 text-white border-l border-emerald-600 rounded-r-xl transition-all cursor-pointer"
              title="More Download Options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Options */}
            {showDownloadMenu && (
              <div className="absolute right-0 bottom-12 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleDirectDownload('png')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download 8K PNG (Lossless)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDownload('jpeg')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download JPG (Fast / Compact)</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenFullSize}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Full 8K in New Tab</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span>Copy Image to Clipboard</span>
                </button>
              </div>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
