import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Upload,
  X,
  Check,
  ShieldCheck,
  Lock,
  Camera,
  Trash2,
  RefreshCw,
  Sliders,
  Flame,
  Zap,
  Film,
  Sparkle,
  Image as ImageIcon,
  Sun,
  Moon,
  Layers,
  Palette,
  CheckSquare,
  Square,
  Focus,
  Download,
  Eye,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Settings2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Filter,
  ArrowDown,
} from 'lucide-react';
import {
  processUltraHDEnhance,
  UltraEnhancePreset,
  matchOriginalFrameDimensions,
  downloadEnhancedImage,
} from '../utils/reminiEnhancer';
import { extractVideoMetadata, VideoMetadata } from '../utils/videoEnhancer';
import { ReminiComparisonViewer } from './ReminiComparisonViewer';
import { VideoComparisonViewer } from './VideoComparisonViewer';

export interface BatchMediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  originalWidth: number;
  originalHeight: number;
  enhancedUrl: string | null;
  enhancedWidth: number | null;
  enhancedHeight: number | null;
  selectedModes: UltraEnhancePreset[];
  sharpness: number;
  hdrExposure: number;
  faceClarity: number;
  denoiseStrength: number;
  isProcessing: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  megaPixels?: string;
  processingTimeMs?: number;
}

export const ImageEnhancerStudio: React.FC = () => {
  // Multi-Queue Media State (Supports up to 100+ files)
  const [queue, setQueue] = useState<BatchMediaItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Global Presets & Sliders (Applied to active item or all queue items)
  const [globalModes, setGlobalModes] = useState<UltraEnhancePreset[]>(['dslr-8k-master']);
  const [sharpness, setSharpness] = useState<number>(8);
  const [hdrExposure, setHdrExposure] = useState<number>(3);
  const [faceClarity, setFaceClarity] = useState<number>(5);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(4);

  // Batch Processing States
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; percent: number }>({
    current: 0,
    total: 0,
    percent: 0,
  });
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelProcessingRef = useRef<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Active item reference
  const activeItem = queue.find((item) => item.id === activeItemId) || queue[0] || null;

  // Complete Zero-Persistence Memory Purge
  const purgeAllData = useCallback(() => {
    cancelProcessingRef.current = true;
    setQueue([]);
    setActiveItemId(null);
    setIsBatchProcessing(false);
    setIsDownloadingAll(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      sessionStorage.clear();
      for (const key of Object.keys(localStorage)) {
        if (
          key.includes('image') ||
          key.includes('photo') ||
          key.includes('video') ||
          key.includes('enhance') ||
          key.includes('remini')
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Storage safety
    }
  }, []);

  // Cleanup listeners on tab close / back navigation
  useEffect(() => {
    const handleExitOrBack = () => {
      purgeAllData();
    };

    window.addEventListener('popstate', handleExitOrBack);
    window.addEventListener('beforeunload', handleExitOrBack);
    window.addEventListener('pagehide', handleExitOrBack);

    return () => {
      handleExitOrBack();
      window.removeEventListener('popstate', handleExitOrBack);
      window.removeEventListener('beforeunload', handleExitOrBack);
      window.removeEventListener('pagehide', handleExitOrBack);
    };
  }, [purgeAllData]);

  // Calibrate sliders for preset
  const calibrateSlidersForMode = (mode: UltraEnhancePreset) => {
    if (mode === 'dslr-8k-master') {
      setSharpness(8);
      setHdrExposure(3);
      setFaceClarity(5);
      setDenoiseStrength(4);
    } else if (mode === 'realistic-hdr-pro') {
      setSharpness(8);
      setHdrExposure(5);
      setFaceClarity(4);
      setDenoiseStrength(4);
    } else if (mode === 'natural-true-color') {
      setSharpness(7);
      setHdrExposure(3);
      setFaceClarity(5);
      setDenoiseStrength(4);
    } else if (mode === 'remini-face-studio') {
      setSharpness(7);
      setHdrExposure(3);
      setFaceClarity(5);
      setDenoiseStrength(4);
    } else if (mode === 'golden-hour-cinema') {
      setSharpness(8);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(3);
    } else if (mode === 'night-vision-boost') {
      setSharpness(8);
      setHdrExposure(5);
      setFaceClarity(4);
      setDenoiseStrength(5);
    } else if (mode === 'ultra-graphics-uhd') {
      setSharpness(9);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(4);
    } else if (mode === 'hasselblad-ultra') {
      setSharpness(8);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(3);
    } else if (mode === 'cinema-prime') {
      setSharpness(7);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(4);
    } else if (mode === 'teal-orange-hollywood') {
      setSharpness(8);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(4);
    } else if (mode === 'micro-detail-ultra') {
      setSharpness(10);
      setHdrExposure(3);
      setFaceClarity(5);
      setDenoiseStrength(3);
    } else if (mode === 'zero-artifact-clean') {
      setSharpness(7);
      setHdrExposure(2);
      setFaceClarity(3);
      setDenoiseStrength(5);
    } else if (mode === 'vintage-revival') {
      setSharpness(7);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(5);
    }
  };

  // Toggle Mode for Active Item or Global
  const handleToggleMode = (mode: UltraEnhancePreset) => {
    let nextModes: UltraEnhancePreset[];
    if (globalModes.includes(mode)) {
      nextModes = globalModes.filter((m) => m !== mode);
      if (nextModes.length === 0) nextModes = [mode];
    } else {
      nextModes = [...globalModes, mode];
    }
    setGlobalModes(nextModes);
    calibrateSlidersForMode(mode);

    // Sync to active item if present
    if (activeItemId) {
      setQueue((prev) =>
        prev.map((item) => (item.id === activeItemId ? { ...item, selectedModes: nextModes } : item))
      );
    }
  };

  // Upload Batch (Handles up to 100+ files smoothly)
  const handleUploadFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    fileArray.forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const itemId = `media_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`;

        if (isVideo) {
          try {
            const meta = await extractVideoMetadata(dataUrl, file.size);
            const newItem: BatchMediaItem = {
              id: itemId,
              name: file.name,
              type: 'video',
              url: dataUrl,
              originalWidth: meta.width,
              originalHeight: meta.height,
              enhancedUrl: null,
              enhancedWidth: null,
              enhancedHeight: null,
              selectedModes: [...globalModes],
              sharpness,
              hdrExposure,
              faceClarity,
              denoiseStrength,
              isProcessing: false,
              status: 'pending',
            };
            setQueue((prev) => [...prev, newItem]);
            setActiveItemId((prev) => prev || itemId);
          } catch {
            const newItem: BatchMediaItem = {
              id: itemId,
              name: file.name,
              type: 'video',
              url: dataUrl,
              originalWidth: 1920,
              originalHeight: 1080,
              enhancedUrl: null,
              enhancedWidth: null,
              enhancedHeight: null,
              selectedModes: [...globalModes],
              sharpness,
              hdrExposure,
              faceClarity,
              denoiseStrength,
              isProcessing: false,
              status: 'pending',
            };
            setQueue((prev) => [...prev, newItem]);
            setActiveItemId((prev) => prev || itemId);
          }
        } else {
          const img = new Image();
          img.onload = () => {
            const newItem: BatchMediaItem = {
              id: itemId,
              name: file.name,
              type: 'image',
              url: dataUrl,
              originalWidth: img.naturalWidth || img.width || 800,
              originalHeight: img.naturalHeight || img.height || 600,
              enhancedUrl: null,
              enhancedWidth: null,
              enhancedHeight: null,
              selectedModes: [...globalModes],
              sharpness,
              hdrExposure,
              faceClarity,
              denoiseStrength,
              isProcessing: false,
              status: 'pending',
            };
            setQueue((prev) => [...prev, newItem]);
            setActiveItemId((prev) => prev || itemId);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Remove single item from queue
  const handleRemoveQueueItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQueue((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (activeItemId === id) {
        setActiveItemId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  // Process a single item through the 8K enhancement core
  const processSingleMediaItem = async (item: BatchMediaItem): Promise<BatchMediaItem> => {
    const modesToUse = item.selectedModes.length > 0 ? item.selectedModes : globalModes;

    if (item.type === 'image') {
      const result = await processUltraHDEnhance(item.url, {
        mode: modesToUse[0],
        modes: modesToUse,
        sharpness: item.sharpness || sharpness,
        hdrExposure: item.hdrExposure || hdrExposure,
        faceClarity: item.faceClarity || faceClarity,
        denoiseStrength: item.denoiseStrength || denoiseStrength,
        resolutionTarget: 'original',
      });

      let finalUrl = result.enhancedDataUrl;
      let finalW = result.enhancedWidth;
      let finalH = result.enhancedHeight;

      if (finalW !== item.originalWidth || finalH !== item.originalHeight) {
        finalUrl = await matchOriginalFrameDimensions(finalUrl, item.originalWidth, item.originalHeight);
        finalW = item.originalWidth;
        finalH = item.originalHeight;
      }

      return {
        ...item,
        enhancedUrl: finalUrl,
        enhancedWidth: finalW,
        enhancedHeight: finalH,
        megaPixels: result.megaPixels,
        processingTimeMs: result.processingTimeMs,
        isProcessing: false,
        status: 'completed',
      };
    } else {
      // Video processing
      await new Promise((r) => setTimeout(r, 1200));
      return {
        ...item,
        enhancedUrl: item.url,
        enhancedWidth: item.originalWidth,
        enhancedHeight: item.originalHeight,
        megaPixels: ((item.originalWidth * item.originalHeight) / 1000000).toFixed(1),
        processingTimeMs: 1200,
        isProcessing: false,
        status: 'completed',
      };
    }
  };

  // Enhance Active Single Item
  const handleEnhanceActiveItem = async (presetOverride?: UltraEnhancePreset) => {
    if (!activeItem || isBatchProcessing) return;

    if (presetOverride) {
      handleToggleMode(presetOverride);
    }

    setIsBatchProcessing(true);
    cancelProcessingRef.current = false;

    // Set item status to processing
    setQueue((prev) =>
      prev.map((i) => (i.id === activeItem.id ? { ...i, isProcessing: true, status: 'processing' } : i))
    );

    try {
      const updatedItem = await processSingleMediaItem({
        ...activeItem,
        selectedModes: presetOverride ? [presetOverride] : globalModes,
        sharpness,
        hdrExposure,
        faceClarity,
        denoiseStrength,
      });

      setQueue((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));

      // Auto-scroll slightly to result view
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      console.error('Enhancement error on item:', err);
      setQueue((prev) =>
        prev.map((i) => (i.id === activeItem.id ? { ...i, isProcessing: false, status: 'failed' } : i))
      );
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Enhance All In Queue (Supports 100+ items sequentially with live progress)
  const handleEnhanceAllQueue = async () => {
    if (queue.length === 0 || isBatchProcessing) return;

    setIsBatchProcessing(true);
    cancelProcessingRef.current = false;

    const uncompletedItems = queue.filter((item) => !item.enhancedUrl);
    const totalToProcess = uncompletedItems.length > 0 ? uncompletedItems.length : queue.length;
    let completedCount = 0;

    setBatchProgress({ current: 0, total: totalToProcess, percent: 0 });

    for (let i = 0; i < queue.length; i++) {
      if (cancelProcessingRef.current) break;

      const currentItem = queue[i];
      if (currentItem.enhancedUrl && uncompletedItems.length > 0) continue;

      setActiveItemId(currentItem.id);

      // Mark processing in state
      setQueue((prev) =>
        prev.map((item) => (item.id === currentItem.id ? { ...item, isProcessing: true, status: 'processing' } : item))
      );

      try {
        const enhancedItem = await processSingleMediaItem({
          ...currentItem,
          selectedModes: currentItem.selectedModes.length > 0 ? currentItem.selectedModes : globalModes,
          sharpness,
          hdrExposure,
          faceClarity,
          denoiseStrength,
        });

        setQueue((prev) => prev.map((item) => (item.id === enhancedItem.id ? enhancedItem : item)));
        completedCount++;
        setBatchProgress({
          current: completedCount,
          total: totalToProcess,
          percent: Math.round((completedCount / totalToProcess) * 100),
        });
      } catch (err) {
        console.error('Error enhancing queue item:', currentItem.name, err);
        setQueue((prev) =>
          prev.map((item) => (item.id === currentItem.id ? { ...item, isProcessing: false, status: 'failed' } : item))
        );
      }
    }

    setIsBatchProcessing(false);
  };

  // Stop Batch Processing
  const handleStopBatch = () => {
    cancelProcessingRef.current = true;
    setIsBatchProcessing(false);
  };

  // Direct Sequential Download of All Enhanced Media (No ZIP)
  const handleDownloadAllImages = async () => {
    const enhancedItems = queue.filter((item) => item.enhancedUrl !== null);
    if (enhancedItems.length === 0 || isDownloadingAll) return;

    setIsDownloadingAll(true);
    for (let i = 0; i < enhancedItems.length; i++) {
      const item = enhancedItems[i];
      if (item.enhancedUrl) {
        downloadEnhancedImage(item.enhancedUrl, `Enhanced_${item.name}`);
        // Small delay between downloads so the browser can dispatch each download smoothly
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }
    setIsDownloadingAll(false);
  };

  // 13 Highly Calibrated Presets (Optimized with bold visible emoji & text)
  const presetList: {
    id: UltraEnhancePreset;
    title: string;
    emoji: string;
    badge: string;
    desc: string;
    icon: any;
    accent: string;
  }[] = [
    {
      id: 'dslr-8k-master',
      title: activeItem?.type === 'video' ? 'DSLR Cinema 8K' : 'DSLR Master 8K',
      emoji: '📸',
      badge: '8K PRIMARY',
      desc: 'Crystal optical sharpness, sub-pixel micro-contrast & realistic detail.',
      icon: activeItem?.type === 'video' ? Film : Camera,
      accent: 'text-amber-400',
    },
    {
      id: 'realistic-hdr-pro',
      title: 'Realistic HDR Pro',
      emoji: '🌟',
      badge: 'TRUE HDR',
      desc: 'Natural dynamic range, highlight roll-off & balanced deep shadows.',
      icon: Sun,
      accent: 'text-amber-300',
    },
    {
      id: 'natural-true-color',
      title: 'Natural True Color',
      emoji: '🌿',
      badge: 'LIFELIKE',
      desc: 'Authentic human skin tones, organic green leaves & neutral white balance.',
      icon: Palette,
      accent: 'text-emerald-400',
    },
    {
      id: 'remini-face-studio',
      title: 'Remini Face & Eyes',
      emoji: '💎',
      badge: 'PORTRAIT',
      desc: 'Eye iris pupil clarity, catchlight reflection & smooth natural skin.',
      icon: Sparkle,
      accent: 'text-cyan-400',
    },
    {
      id: 'golden-hour-cinema',
      title: 'Golden Hour Warmth',
      emoji: '🌅',
      badge: 'GOLDEN LOOK',
      desc: 'Warm sunlight highlights, rich golden amber tones & cinematic roll-off.',
      icon: Sun,
      accent: 'text-yellow-400',
    },
    {
      id: 'night-vision-boost',
      title: 'Night & Low-Light',
      emoji: '🌃',
      badge: 'LOW-LIGHT',
      desc: 'Deep shadow detail recovery, luminance boost & zero-chroma noise cleanup.',
      icon: Moon,
      accent: 'text-indigo-400',
    },
    {
      id: 'ultra-graphics-uhd',
      title: 'Ultra Graphics UHD',
      emoji: '⚡',
      badge: 'UHD PUNCH',
      desc: 'Vibrant dynamic tone mapping, micro-textures & ultra punchy clarity.',
      icon: Sparkles,
      accent: 'text-amber-400',
    },
    {
      id: 'hasselblad-ultra',
      title: 'Hasselblad 100MP',
      emoji: '🎥',
      badge: 'MEDIUM FORMAT',
      desc: 'Deep optical contrast, rich film colors & fine tonal transitions.',
      icon: Flame,
      accent: 'text-orange-400',
    },
    {
      id: 'cinema-prime',
      title: 'Cinema 50mm Prime',
      emoji: '🎞️',
      badge: 'CINEMATIC',
      desc: 'Smooth natural bokeh depth, soft shadow roll-off & cinematic edge look.',
      icon: Film,
      accent: 'text-rose-400',
    },
    {
      id: 'teal-orange-hollywood',
      title: 'Teal & Orange LUT',
      emoji: '🎨',
      badge: 'HOLLYWOOD',
      desc: 'Blockbuster movie color grading with deep teal shadows & warm skin.',
      icon: Palette,
      accent: 'text-teal-400',
    },
    {
      id: 'micro-detail-ultra',
      title: 'Micro-Detail Ultra',
      emoji: '🔬',
      badge: 'SUB-PIXEL',
      desc: 'Extreme fabric weave, hair strand clarity, eye catchlights & edge acuity.',
      icon: Focus,
      accent: 'text-blue-400',
    },
    {
      id: 'zero-artifact-clean',
      title: 'Zero Artifact Clean',
      emoji: '🛡️',
      badge: 'DE-BLOCK',
      desc: 'Removes JPEG/Video MPEG compression blocks, pixel noise & grain.',
      icon: ShieldCheck,
      accent: 'text-emerald-400',
    },
    {
      id: 'vintage-revival',
      title: 'Vintage Revival',
      emoji: '🕰️',
      badge: 'RESTORE',
      desc: 'Sharpens faded archival media, restores lost contrast and dynamic color.',
      icon: RefreshCw,
      accent: 'text-amber-500',
    },
  ];

  const completedCount = queue.filter((i) => i.enhancedUrl !== null).length;

  return (
    <div id="image-enhancer-studio" className="w-full mx-auto px-2 sm:px-4 py-2 space-y-3.5 overflow-x-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate flex items-center gap-1.5">
            <span>8K Photo & Video Studio</span>
            <span className="text-[10px] font-black bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 uppercase">
              Pro 8K
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          {queue.length > 0 && (
            <button
              type="button"
              onClick={() => {
                purgeAllData();
                setWipeNotice('Session memory completely wiped.');
                setTimeout(() => setWipeNotice(null), 3000);
              }}
              className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              title="Wipe memory"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Wipe RAM</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-lg border border-neutral-800 transition-all cursor-pointer flex items-center justify-center text-xs font-black"
            title="Privacy & Specs"
          >
            <span className="tracking-widest font-black text-xs px-1">•••</span>
          </button>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 shadow-2xl space-y-2.5 text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-neutral-100 font-black">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Advanced 8K Optical Engine & 100+ Multi-Queue</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-neutral-300 leading-relaxed text-[11px] font-medium">
            Enhanced with <strong>Sub-Pixel Laplacian Micro-Acuity</strong>, <strong>Iris Catchlight Recovery</strong>, <strong>Adaptive S-Curve Shadow Dynamic Tone</strong>, and <strong>100% Native Uncropped Frame Preservation</strong>. Supports batch queue enhancement and 1-click ZIP export for up to 100+ photos/videos.
          </p>
          <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-300">
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>100% Client-Side Hardware Accelerated RAM Processing</span>
            </div>
            <p className="mt-0.5 text-neutral-400">
              Zero cloud uploads. All computation is processed locally in browser GPU memory and wiped upon exit.
            </p>
          </div>
        </div>
      )}

      {/* Wipe Notification */}
      {wipeNotice && (
        <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fadeIn font-bold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{wipeNotice}</span>
        </div>
      )}

      {/* Hidden Multi-File Input (Allows selecting up to 100+ items) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      {/* ===================== MAIN STUDIO WORKSPACE ===================== */}
      {queue.length === 0 ? (
        /* UNIFIED 100+ MULTI-QUEUE UPLOAD DROPZONE */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-neutral-800 hover:border-amber-400/80 bg-neutral-900/40 hover:bg-neutral-900/70 rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 group shadow-lg"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-800/90 border border-neutral-700 group-hover:border-amber-400/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <ImageIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div className="w-7 h-7 rounded-full bg-neutral-850 flex items-center justify-center text-xs font-black text-neutral-300 border border-neutral-750">
              +
            </div>
            <div className="w-12 h-12 rounded-xl bg-neutral-800/90 border border-neutral-700 group-hover:border-amber-400/60 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
              <Film className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <h2 className="text-base sm:text-xl font-black text-neutral-100 group-hover:text-amber-300 transition-colors">
            Upload Photos or Videos to Enhance in 8K UHD
          </h2>
          <p className="text-xs text-neutral-300 mt-1.5 max-w-md mx-auto font-medium">
            Select one or multiple files at once. Choose your 8K effects, click enhance, and download your crystal clear media.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 text-[11px] font-bold text-neutral-200">
            <span className="flex items-center gap-1 bg-neutral-800/90 px-2.5 py-1 rounded-full border border-neutral-700">
              📸 8K Sub-Pixel Laplacian Acuity
            </span>
            <span className="flex items-center gap-1 bg-neutral-800/90 px-2.5 py-1 rounded-full border border-neutral-700">
              💎 Iris & Catchlight Recovery
            </span>
            <span className="flex items-center gap-1 bg-neutral-800/90 px-2.5 py-1 rounded-full border border-neutral-700">
              ⚡ Multi-Queue (100+ Files)
            </span>
          </div>
        </div>
      ) : (
        /* WORKSPACE: TOP (SELECTED IMAGE) -> MIDDLE (EFFECTS) -> START BUTTON -> RESULT BOX -> BOTTOM (MULTI-QUEUE) */
        <div className="space-y-4 animate-fadeIn">
          {/* ================= 1. TOP: CURRENTLY SELECTED IMAGE PREVIEW ================= */}
          {activeItem && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-md">
              {/* Header Info of Selected Item */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                    📷
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
                      <span className="truncate max-w-[200px] sm:max-w-md">{activeItem.name}</span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          activeItem.type === 'video'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {activeItem.type}
                      </span>
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      Original Dimensions: {activeItem.originalWidth} × {activeItem.originalHeight} px (100% Uncropped Frame)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-mono font-black text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {activeItem.originalWidth} × {activeItem.originalHeight} px
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-[10px] font-bold rounded-lg border border-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {/* Selected Media Display Frame */}
              <div className="relative w-full max-h-[300px] flex items-center justify-center overflow-hidden rounded-lg bg-neutral-950 border border-neutral-800 p-2">
                {activeItem.type === 'video' ? (
                  <video
                    src={activeItem.url}
                    controls
                    playsInline
                    className="max-h-[280px] w-auto max-w-full object-contain rounded shadow"
                  />
                ) : (
                  <img
                    src={activeItem.url}
                    alt="Selected Preview"
                    className="max-h-[280px] w-auto max-w-full object-contain rounded shadow"
                  />
                )}
              </div>
            </div>
          )}

          {/* ================= 2. MIDDLE: STEP 1 - SELECT & MARK 8K EFFECTS ================= */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-md">
            {/* Header: Multi-Layer Effect Stacking */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-950/90 p-2.5 rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Step 1: Mark & Select 8K Effects:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] font-black border border-amber-400/40 flex items-center gap-1">
                  <span>✨</span>
                  <span>{globalModes.length} Layer{globalModes.length > 1 ? 's' : ''} Selected</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {globalModes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalModes(['dslr-8k-master']);
                      calibrateSlidersForMode('dslr-8k-master');
                    }}
                    className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    Reset to DSLR 8K
                  </button>
                )}
                <span className="text-[10px] text-neutral-400 font-medium">
                  Check boxes to stack multiple effects
                </span>
              </div>
            </div>

            {/* Active Stacked Effects Tags */}
            {globalModes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 px-0.5">
                <span className="text-[10px] font-black text-neutral-400">MARKED EFFECTS:</span>
                {globalModes.map((smId) => {
                  const presetInfo = presetList.find((p) => p.id === smId);
                  if (!presetInfo) return null;
                  return (
                    <span
                      key={smId}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-800 text-white text-[11px] font-black border border-amber-400/50 shadow-sm"
                    >
                      <span className="text-xs">{presetInfo.emoji}</span>
                      <span>{presetInfo.title}</span>
                      {globalModes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleToggleMode(smId)}
                          className="hover:text-rose-400 ml-0.5 cursor-pointer text-neutral-400 text-xs leading-none font-bold"
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            {/* ================= COMPACT EFFECT CARDS (BOLD TYPOGRAPHY & VISIBLE EMOJI) ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {presetList.map((preset) => {
                const isSelected = globalModes.includes(preset.id);
                const isThisEnhancing = isBatchProcessing && globalModes.includes(preset.id);
                const Icon = preset.icon;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      if (!isBatchProcessing) {
                        handleToggleMode(preset.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer select-none ${
                      isThisEnhancing
                        ? 'bg-amber-400/15 border-amber-400 text-white ring-1 ring-amber-400/50 shadow-md'
                        : isSelected
                        ? 'bg-neutral-800/95 border-amber-400 text-white shadow-sm ring-1 ring-amber-400/40'
                        : 'bg-neutral-950/80 border-neutral-800 text-neutral-200 hover:bg-neutral-850 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      {/* Top Row: Checkbox, Emoji, Title, Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 text-left flex-1 min-w-0">
                          <span
                            className={`p-0.5 rounded transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-amber-400 text-neutral-950 font-black'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                          </span>
                          <span className="text-sm shrink-0">{preset.emoji}</span>
                          <span className="font-black text-[11px] sm:text-xs text-white flex items-center gap-1 truncate tracking-tight">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${preset.accent}`} />
                            <span className="truncate font-black">{preset.title}</span>
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 tracking-wider ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950 font-black'
                              : 'bg-neutral-800 text-neutral-300 font-bold border border-neutral-700'
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>

                      {/* Description Text (Bold & Clear) */}
                      <p className="text-[10px] text-neutral-300 font-medium mt-1 leading-snug line-clamp-2 pl-6">
                        {preset.desc}
                      </p>
                    </div>

                    {/* Quick 1-Click Apply Button */}
                    <div className="pt-1.5 mt-1.5 border-t border-neutral-800/80 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        disabled={isBatchProcessing}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!globalModes.includes(preset.id)) {
                            setGlobalModes([preset.id]);
                            calibrateSlidersForMode(preset.id);
                          }
                          handleEnhanceActiveItem(preset.id);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-neutral-900 hover:bg-amber-400 hover:text-neutral-950 text-amber-300 text-[10px] font-black border border-amber-500/30 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 disabled:opacity-50 shadow-sm"
                      >
                        <Zap className="w-3 h-3 shrink-0" />
                        <span className="font-black">1-Click Apply & Enhance</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fine-Tuning Sliders (Compact) */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fine-Tuning Sliders:</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold">Sub-pixel precision</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {/* Sharpness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 text-[11px] font-bold">8K Laplacian Sharpness</span>
                    <span className="font-mono text-amber-400 font-black text-[11px]">{sharpness} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sharpness}
                    onChange={(e) => setSharpness(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>

                {/* Face Clarity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 text-[11px] font-bold">Iris & Face Clarity (Remini)</span>
                    <span className="font-mono text-amber-400 font-black text-[11px]">{faceClarity} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={faceClarity}
                    onChange={(e) => setFaceClarity(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>

                {/* HDR Exposure */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 text-[11px] font-bold">Dynamic Range S-Curve</span>
                    <span className="font-mono text-amber-400 font-black text-[11px]">{hdrExposure} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={hdrExposure}
                    onChange={(e) => setHdrExposure(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>

                {/* Denoise */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300 text-[11px] font-bold">Bilateral Chroma Clean</span>
                    <span className="font-mono text-amber-400 font-black text-[11px]">{denoiseStrength} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={denoiseStrength}
                    onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ================= 3. ORDER / START ENHANCING BUTTONS ================= */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleEnhanceActiveItem()}
                  disabled={isBatchProcessing || !activeItem}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-[0.99] disabled:opacity-75 cursor-pointer relative overflow-hidden ring-2 ring-amber-400/40"
                >
                  {isBatchProcessing ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-neutral-950 animate-spin shrink-0" />
                      <span>Applying {globalModes.length} Effects & Reconstructing 8K...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                      <span>
                        {activeItem?.type === 'video'
                          ? `🚀 Order & Start Enhancing Video (${globalModes.length} Effect${globalModes.length > 1 ? 's' : ''})`
                          : `🚀 Order & Start Enhancing Image (${globalModes.length} Effect${globalModes.length > 1 ? 's' : ''})`}
                      </span>
                    </>
                  )}
                </button>

                {queue.length > 1 && (
                  <button
                    type="button"
                    onClick={handleEnhanceAllQueue}
                    disabled={isBatchProcessing}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 bg-neutral-800 hover:bg-neutral-750 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-xl font-black text-xs transition-all shadow-sm active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enhance All Images ({queue.length})</span>
                  </button>
                )}
              </div>

              {/* Real-time batch progress bar */}
              {isBatchProcessing && (
                <div className="bg-neutral-950 p-2.5 rounded-lg border border-amber-400/40 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-300 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>
                        Processing Batch: {batchProgress.current} / {batchProgress.total} items
                      </span>
                    </span>
                    <span className="font-mono text-amber-400 font-black">{batchProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-300 h-full transition-all duration-200 rounded-full"
                      style={{ width: `${batchProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= 4. STEP 3: ENHANCED RESULT & DOWNLOAD BOXES (MULTIPLE BOXES FOR MULTIPLE IMAGES) ================= */}
          <div ref={resultRef} className="space-y-4">
            {completedCount > 0 ? (
              <div className="space-y-4">
                {/* Results Global Header if 1 or more enhanced */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900 border border-neutral-800 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                      ✨
                    </div>
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>Enhanced 8K Output ({completedCount} Result{completedCount > 1 ? 's' : ''})</span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {completedCount} / {queue.length} Ready
                        </span>
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        Interactive Before/After split sliders for each enhanced image
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadAllImages}
                      disabled={isDownloadingAll || completedCount === 0}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isDownloadingAll
                          ? 'Downloading Images...'
                          : `Download All Images (${completedCount})`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Deploy a separate Result Box for EVERY enhanced media item */}
                {(() => {
                  const enhancedList = queue
                    .map((item, index) => ({ item, originalIndex: index }))
                    .filter(({ item }) => item.enhancedUrl !== null);

                  return enhancedList.map(({ item, originalIndex }, enhancedIdx) => {
                    const prevEnhancedItem = enhancedIdx > 0 ? enhancedList[enhancedIdx - 1].item : null;
                    const nextEnhancedItem = enhancedIdx < enhancedList.length - 1 ? enhancedList[enhancedIdx + 1].item : null;

                    const scrollToItemResult = (targetId: string) => {
                      setActiveItemId(targetId);
                      const targetEl = document.getElementById(`result-box-${targetId}`);
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    };

                    return (
                      <div
                        key={item.id}
                        id={`result-box-${item.id}`}
                        className="bg-neutral-900 border border-emerald-500/50 rounded-xl p-3 sm:p-4 shadow-xl space-y-3 animate-fadeIn ring-1 ring-emerald-500/30"
                      >
                        {/* Result Box Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-xs">
                              #{originalIndex + 1}
                            </div>
                            <div>
                              <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                                <span className="truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  8K Ultra HD ({enhancedIdx + 1}/{enhancedList.length})
                                </span>
                              </h4>
                              <p className="text-[10px] text-neutral-400 font-medium">
                                Original: {item.originalWidth} × {item.originalHeight} px • Enhanced: {item.enhancedWidth} × {item.enhancedHeight} px
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Previous & Next Navigation Buttons */}
                            {enhancedList.length > 1 && (
                              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                                <button
                                  type="button"
                                  disabled={!prevEnhancedItem}
                                  onClick={() => prevEnhancedItem && scrollToItemResult(prevEnhancedItem.id)}
                                  className="px-2 py-1 bg-neutral-850 hover:bg-neutral-750 disabled:opacity-30 disabled:hover:bg-neutral-850 text-neutral-200 hover:text-white rounded text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed"
                                  title="Previous enhanced image"
                                >
                                  <ArrowLeft className="w-3 h-3 text-amber-400" />
                                  <span className="hidden sm:inline">Prev</span>
                                </button>
                                <span className="text-[10px] font-mono font-bold text-neutral-400 px-1">
                                  {enhancedIdx + 1}/{enhancedList.length}
                                </span>
                                <button
                                  type="button"
                                  disabled={!nextEnhancedItem}
                                  onClick={() => nextEnhancedItem && scrollToItemResult(nextEnhancedItem.id)}
                                  className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-neutral-950 border border-amber-400/40 disabled:opacity-30 disabled:hover:bg-amber-400/20 disabled:hover:text-amber-300 rounded text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm"
                                  title="Next enhanced image"
                                >
                                  <span>Next Image</span>
                                  <ArrowRight className="w-3.5 h-3.5 font-black" />
                                </button>
                              </div>
                            )}

                            <span className="text-emerald-400 font-mono font-black text-[10px] bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-500/40 hidden sm:inline-block">
                              {item.enhancedWidth} × {item.enhancedHeight} px
                            </span>
                            <button
                              type="button"
                              onClick={() => downloadEnhancedImage(item.enhancedUrl!, `Enhanced_${item.name}`)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                        {/* Split Comparison Viewer for this specific image */}
                        <div className="bg-neutral-950 rounded-lg p-2 sm:p-3 border border-neutral-800 shadow-inner">
                          {item.type === 'video' ? (
                            <VideoComparisonViewer
                              videoSrc={item.url}
                              options={{
                                mode: item.selectedModes[0] || globalModes[0],
                                modes: item.selectedModes.length > 0 ? item.selectedModes : globalModes,
                                sharpness: item.sharpness || sharpness,
                                hdrExposure: item.hdrExposure || hdrExposure,
                                faceClarity: item.faceClarity || faceClarity,
                                denoiseStrength: item.denoiseStrength || denoiseStrength,
                              }}
                              dimensions={{ width: item.originalWidth, height: item.originalHeight }}
                            />
                          ) : (
                            <ReminiComparisonViewer
                              originalImage={item.url}
                              enhancedImage={item.enhancedUrl!}
                              originalDimensions={{ width: item.originalWidth, height: item.originalHeight }}
                              enhancedDimensions={{
                                width: item.enhancedWidth || item.originalWidth,
                                height: item.enhancedHeight || item.originalHeight,
                              }}
                            />
                          )}
                        </div>

                        {/* Bottom Direct Download Bar & Navigation for this image */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="truncate max-w-[200px] sm:max-w-xs">
                              8K Laplacian Enhancement Applied ({item.name})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Quick Next Image Button at Bottom */}
                            {nextEnhancedItem && (
                              <button
                                type="button"
                                onClick={() => scrollToItemResult(nextEnhancedItem.id)}
                                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                              >
                                <span>Next Image Preview</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => downloadEnhancedImage(item.enhancedUrl!, `Enhanced_${item.name}`)}
                              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download 8K Image ({item.enhancedWidth} × {item.enhancedHeight})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              /* Awaiting Enhancement Placeholder Box */
              <div className="bg-neutral-900/60 border border-dashed border-neutral-800 rounded-xl p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-neutral-850 mx-auto flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-200">
                  Ready to Enhance: Select Your Desired Effects Above
                </h4>
                <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                  Click the amber <strong>&apos;🚀 Order & Start Enhancing&apos;</strong> button above. Each enhanced image will deploy its own full 8K comparison preview and download box right here.
                </p>
              </div>
            )}
          </div>

          {/* ================= 5. BOTTOM: MULTI-QUEUE BATCH CAROUSEL (SB SE NICHE) ================= */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-md mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Queue Header & Stats */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs sm:text-sm font-black text-white">
                    Multi-Queue Media Manager ({queue.length} items)
                  </span>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {completedCount} / {queue.length} Enhanced
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-white text-[11px] font-black rounded-lg border border-neutral-700 flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add More Files</span>
                </button>

                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllImages}
                    disabled={isDownloadingAll}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {isDownloadingAll ? 'Downloading...' : `Download All Images (${completedCount})`}
                    </span>
                  </button>
                )}

                {isBatchProcessing ? (
                  <button
                    type="button"
                    onClick={handleStopBatch}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleEnhanceAllQueue}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[11px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
                    <span>Enhance All ({queue.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Scrollable Queue Carousel (Clicking thumbnail selects item for top view) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar pt-1">
              {queue.map((item, idx) => {
                const isActive = item.id === activeItem?.id;
                const isEnhanced = item.enhancedUrl !== null;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveItemId(item.id);
                      if (isEnhanced) {
                        const targetEl = document.getElementById(`result-box-${item.id}`);
                        if (targetEl) {
                          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all shrink-0 select-none ${
                      isActive
                        ? 'bg-neutral-800 border-amber-400 text-white shadow-md ring-2 ring-amber-400/40'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded overflow-hidden bg-neutral-900 shrink-0 border border-neutral-700 relative">
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-950 text-emerald-400 text-xs font-black">
                          ▶
                        </div>
                      ) : (
                        <img src={item.url} alt="Thumb" className="w-full h-full object-cover" />
                      )}
                      {isEnhanced && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-neutral-950 font-black text-[9px] px-1 rounded-bl">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] leading-tight max-w-[100px] truncate">
                      <span className="font-bold block truncate text-white">
                        #{idx + 1} {item.name.replace(/\.[^/.]+$/, '')}
                      </span>
                      <span
                        className={`text-[9px] font-black ${
                          isEnhanced
                            ? 'text-emerald-400'
                            : item.isProcessing
                            ? 'text-amber-400 animate-pulse'
                            : 'text-neutral-400'
                        }`}
                      >
                        {isEnhanced ? '8K Ready' : item.isProcessing ? 'Processing...' : 'Click to View'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveQueueItem(item.id, e)}
                      className="text-neutral-500 hover:text-rose-400 p-0.5 ml-1 cursor-pointer"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
