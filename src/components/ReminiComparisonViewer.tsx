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
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
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
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Pan shift helper
  const handlePan = (dx: number, dy: number) => {
    setPanOffset((prev) => ({
      x: Math.max(-500, Math.min(500, prev.x + dx)),
      y: Math.max(-500, Math.min(500, prev.y + dy)),
    }));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Handle Dragging
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

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
          : 'w-full my-2'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 bg-neutral-900/95 border-b border-neutral-800 backdrop-blur-md gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold text-white tracking-wide flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>8K COMPARISON</span>
          </span>
        </div>

        {/* View Mode Selectors */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sideBySide')}
            className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'sideBySide'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('after')}
            className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'after'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>8K</span>
          </button>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1">
          {/* Quick Zoom Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 mr-1">
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                zoomLevel === 1 ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              1X
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(2)}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all cursor-pointer ${
                zoomLevel === 2 ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              2X
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(5)}
              className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer flex items-center gap-0.5 ${
                zoomLevel === 5
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
              title="500X Extreme Macro Inspection (Lossless Edge Clarity)"
            >
              <span>500X</span>
              <Sparkles className="w-2.5 h-2.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, +(prev - 0.5).toFixed(1)))}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className={`text-[10px] font-mono w-11 text-center font-black rounded px-1 py-0.5 ${zoomLevel >= 5 ? 'bg-amber-400 text-neutral-950' : 'text-neutral-300'}`}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(5.0, +(prev + 0.5).toFixed(1)))}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Zoom In (up to 500X)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Sub-bar: Directional Navigation (Left, Right, Up, Down, Center) directly under Zoom */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-neutral-800/80 text-neutral-300 gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Move className="w-3 h-3 text-amber-400" />
          <span className="font-semibold text-neutral-300">Move:</span>
        </div>

        {/* Small Directional Buttons: Left, Right, Up, Down */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePan(50, 0)}
            className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-90 rounded-md border border-neutral-700 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Move Left"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-200" />
          </button>
          <button
            type="button"
            onClick={() => handlePan(-50, 0)}
            className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-90 rounded-md border border-neutral-700 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Move Right"
          >
            <ArrowRight className="w-3.5 h-3.5 text-neutral-200" />
          </button>
          <button
            type="button"
            onClick={() => handlePan(0, 50)}
            className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-90 rounded-md border border-neutral-700 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5 text-neutral-200" />
          </button>
          <button
            type="button"
            onClick={() => handlePan(0, -50)}
            className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 active:scale-90 rounded-md border border-neutral-700 transition-all cursor-pointer shadow-sm flex items-center justify-center"
            title="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5 text-neutral-200" />
          </button>
          {(panOffset.x !== 0 || panOffset.y !== 0 || zoomLevel !== 1) && (
            <button
              type="button"
              onClick={handleResetView}
              className="px-2 py-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 hover:bg-amber-900 active:scale-95 rounded-md border border-amber-500/50 transition-all cursor-pointer ml-1"
              title="Reset Position to Center"
            >
              Center
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className={`relative w-full overflow-hidden bg-neutral-950 flex items-center justify-center select-none ${
          isFullscreen ? 'flex-1 h-full' : 'h-[360px] sm:h-[450px]'
        }`}
      >
        {/* VIEW MODE 1: REMINI SPLIT SLIDER WITH TOUCH-LOCK POINTER CAPTURE */}
        {viewMode === 'split' && (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-full cursor-ew-resize overflow-hidden flex items-center justify-center select-none"
            style={{ touchAction: 'none' }}
          >
            {/* Zoom & Pan Wrapper */}
            <div
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
              className="relative w-full h-full transition-transform duration-100 flex items-center justify-center pointer-events-none"
            >
              {/* Background Layer: Enhanced (After) Image */}
              <img
                src={enhancedImage}
                alt="8K Enhanced After"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* Foreground Layer: Original (Before) Image with clip path */}
              <div
                style={{
                  clipPath: isHoldingOriginal
                    ? 'inset(0 0 0 0)'
                    : `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
              >
                <img
                  src={originalImage}
                  alt="Original Low-Res Before"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter contrast-90 brightness-95 pointer-events-none select-none"
                  draggable={false}
                />
              </div>

              {/* Draggable Split Line & Handle with Clear Sliding Arrows */}
              {!isHoldingOriginal && (
                <div
                  style={{ left: `${sliderPosition}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] pointer-events-none flex items-center justify-center z-20"
                >
                  <div
                    className={`w-10 h-10 -ml-5 rounded-full bg-gradient-to-br from-white to-neutral-200 text-neutral-950 shadow-2xl border-2 border-neutral-900 flex items-center justify-center pointer-events-auto cursor-ew-resize select-none transition-transform ${
                      isDragging ? 'scale-110 ring-4 ring-amber-400/50' : 'hover:scale-105'
                    }`}
                    style={{ touchAction: 'none' }}
                  >
                    <div className="flex items-center text-neutral-900 justify-center">
                      <ChevronLeft className="w-3.5 h-3.5 -mr-1" />
                      <ChevronRight className="w-3.5 h-3.5 -ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges on stage */}
            <div className="absolute top-3 left-3 z-30 pointer-events-none select-none">
              <span className="bg-neutral-950/85 backdrop-blur-md text-neutral-300 text-[10px] font-mono px-2.5 py-1 rounded-md border border-neutral-850">
                BEFORE
              </span>
            </div>
            <div className="absolute top-3 right-3 z-30 pointer-events-none select-none">
              <span className="bg-gradient-to-r from-amber-400 to-emerald-400 text-neutral-950 font-black text-[10px] font-mono px-2.5 py-1 rounded-md shadow-lg">
                AFTER (8K)
              </span>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: SIDE BY SIDE */}
        {viewMode === 'sideBySide' && (
          <div
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
            className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 transition-transform duration-100"
          >
            <div className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <span className="absolute top-2 left-2 bg-neutral-950/80 text-neutral-400 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 z-10">
                Original
              </span>
              <img
                src={originalImage}
                alt="Before"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain filter contrast-90 brightness-95"
                draggable={false}
              />
            </div>
            <div className="relative w-full h-full bg-neutral-900 rounded-xl overflow-hidden border border-amber-500/40 flex items-center justify-center">
              <span className="absolute top-2 right-2 bg-amber-400 text-neutral-950 text-[10px] font-bold font-mono px-2 py-0.5 rounded shadow z-10">
                8K Ultra HD
              </span>
              <img
                src={enhancedImage}
                alt="After"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* VIEW MODE 3: 8K RESULT ONLY */}
        {viewMode === 'after' && (
          <div
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
            className="w-full h-full flex items-center justify-center p-2 transition-transform duration-100"
          >
            <img
              src={enhancedImage}
              alt="8K Enhanced Result"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              draggable={false}
            />
          </div>
        )}

        {/* Bottom Quick-Tip / Hold Button */}
        {viewMode === 'split' && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onPointerDown={() => setIsHoldingOriginal(true)}
              onPointerUp={() => setIsHoldingOriginal(false)}
              onPointerLeave={() => setIsHoldingOriginal(false)}
              className="px-3 py-1 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 text-[11px] font-medium rounded-full border border-neutral-700 backdrop-blur-md shadow-lg transition-all active:bg-amber-400 active:text-neutral-950 cursor-pointer select-none"
            >
              Hold for Original
            </button>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-3 sm:p-4 bg-neutral-900/95 border-t border-neutral-800 flex flex-col gap-3">
        {/* Specs Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
          <span className="font-mono text-neutral-200 font-bold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            {enhancedDimensions
              ? `${enhancedDimensions.width} × ${enhancedDimensions.height} px`
              : '8K Ultra HD'}
          </span>
          <span className="text-emerald-400 font-semibold">100% Uncropped Original Frame</span>
        </div>

        {/* Action Buttons with Download Menu */}
        <div className="flex items-center gap-2 w-full">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            className="flex items-center justify-center gap-1 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl border border-neutral-700 transition-all cursor-pointer shrink-0"
            title="Copy Image to Clipboard"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span className="text-xs">{copySuccess ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Primary 8K Download Button & Dropdown */}
          <div className="relative flex items-center flex-1" ref={downloadMenuRef}>
            <button
              type="button"
              onClick={() => handleDirectDownload('png')}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-l-xl shadow-lg transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download 8K</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-600 text-white border-l border-emerald-600 rounded-r-xl transition-all cursor-pointer"
              title="More Options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Dropdown Options */}
            {showDownloadMenu && (
              <div className="absolute right-0 bottom-12 w-52 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleDirectDownload('png')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download PNG (Lossless)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDownload('jpeg')}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download JPG</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenFullSize}
                  className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-800 rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all cursor-pointer shrink-0"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
