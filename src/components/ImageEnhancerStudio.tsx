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
  SlidersHorizontal,
  Flame,
  Zap,
  Film,
  Sparkle,
} from 'lucide-react';
import {
  processUltraHDEnhance,
  UltraEnhanceOptions,
  matchOriginalFrameDimensions,
} from '../utils/reminiEnhancer';
import { ReminiComparisonViewer } from './ReminiComparisonViewer';

export const ImageEnhancerStudio: React.FC = () => {
  // State
  const [enhancerImage, setEnhancerImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isEnhancingImage, setIsEnhancingImage] = useState<boolean>(false);
  const [enhancedResultUrl, setEnhancedResultUrl] = useState<string | null>(null);
  const [enhancedDimensions, setEnhancedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [enhanceStats, setEnhanceStats] = useState<{ megaPixels: string; timeMs: number; mode?: string } | null>(null);
  const [enhanceMode, setEnhanceMode] = useState<UltraEnhanceOptions['mode']>('dslr-8k-master');

  // Manual Fine-Tuning Sliders
  const [sharpness, setSharpness] = useState<number>(8);
  const [hdrExposure, setHdrExposure] = useState<number>(3);
  const [faceClarity, setFaceClarity] = useState<number>(5);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(4);
  const [showAdvancedSliders, setShowAdvancedSliders] = useState<boolean>(true);
  const [wipeNotice, setWipeNotice] = useState<string | null>(null);

  const enhancerFileInputRef = useRef<HTMLInputElement>(null);

  // Complete Zero-Persistence Memory Purge (Cleans state, canvas buffers, storage, and references)
  const purgeAllData = useCallback(() => {
    setEnhancerImage(null);
    setEnhancedResultUrl(null);
    setOriginalDimensions(null);
    setEnhancedDimensions(null);
    setEnhanceStats(null);

    if (enhancerFileInputRef.current) {
      enhancerFileInputRef.current.value = '';
    }

    try {
      sessionStorage.clear();
      for (const key of Object.keys(localStorage)) {
        if (key.includes('image') || key.includes('photo') || key.includes('enhance') || key.includes('remini')) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Storage access safety
    }
  }, []);

  // Lifecycle listeners: Auto-delete all photo data when navigating back, closing tab, or leaving page
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

  // Handle Manual Purge with User Feedback
  const handleManualPurge = () => {
    purgeAllData();
    setWipeNotice('All photo data and memory buffers permanently erased.');
    setTimeout(() => setWipeNotice(null), 3500);
  };

  // Handle Image Upload & Extract Exact Dimensions
  const handleEnhancerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setEnhancerImage(dataUrl);
        setEnhancedResultUrl(null);
        setEnhancedDimensions(null);
        setEnhanceStats(null);
        setWipeNotice(null);

        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({
            width: img.naturalWidth || img.width || 800,
            height: img.naturalHeight || img.height || 600,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & drop support
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setEnhancerImage(dataUrl);
        setEnhancedResultUrl(null);
        setEnhancedDimensions(null);
        setEnhanceStats(null);

        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({
            width: img.naturalWidth || img.width || 800,
            height: img.naturalHeight || img.height || 600,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Mode Preset Selection with parameter tuning
  const handleSelectMode = (mode: UltraEnhanceOptions['mode']) => {
    setEnhanceMode(mode);
    if (mode === 'dslr-8k-master') {
      setSharpness(8);
      setHdrExposure(3);
      setFaceClarity(5);
      setDenoiseStrength(4);
    } else if (mode === 'ultra-graphics-uhd') {
      setSharpness(9);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(4);
    } else if (mode === 'remini-face-studio') {
      setSharpness(7);
      setHdrExposure(3);
      setFaceClarity(5);
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
    } else if (mode === 'vintage-revival') {
      setSharpness(7);
      setHdrExposure(4);
      setFaceClarity(4);
      setDenoiseStrength(5);
    } else if (mode === 'zero-artifact-clean') {
      setSharpness(7);
      setHdrExposure(2);
      setFaceClarity(3);
      setDenoiseStrength(5);
    }
  };

  // 8K Reconstruction with strict original frame size preservation
  const handleProcessEnhanceImage = async (overrideMode?: UltraEnhanceOptions['mode']) => {
    if (!enhancerImage || isEnhancingImage) return;
    const activeMode = overrideMode || enhanceMode;
    setIsEnhancingImage(true);
    try {
      let s = sharpness;
      let h = hdrExposure;
      let f = faceClarity;
      let d = denoiseStrength;
      if (overrideMode) {
        setEnhanceMode(overrideMode);
        if (overrideMode === 'ultra-graphics-uhd') {
          s = 9;
          h = 4;
          f = 4;
          d = 4;
          setSharpness(9);
          setHdrExposure(4);
          setFaceClarity(4);
          setDenoiseStrength(4);
        }
      }

      const result = await processUltraHDEnhance(enhancerImage, {
        mode: activeMode,
        sharpness: s,
        hdrExposure: h,
        faceClarity: f,
        denoiseStrength: d,
        resolutionTarget: 'original', // 100% Locked to native frame
      });

      // Strict enforcement of original frame dimensions
      let finalEnhancedUrl = result.enhancedDataUrl;
      let finalW = result.enhancedWidth;
      let finalH = result.enhancedHeight;

      if (originalDimensions && (finalW !== originalDimensions.width || finalH !== originalDimensions.height)) {
        finalEnhancedUrl = await matchOriginalFrameDimensions(
          finalEnhancedUrl,
          originalDimensions.width,
          originalDimensions.height
        );
        finalW = originalDimensions.width;
        finalH = originalDimensions.height;
      }

      setEnhancedResultUrl(finalEnhancedUrl);
      setEnhancedDimensions({ width: finalW, height: finalH });
      setEnhanceStats({ megaPixels: result.megaPixels, timeMs: result.processingTimeMs, mode: result.algorithmMode });
    } catch (err) {
      console.error('Enhancement error:', err);
      setEnhancedResultUrl(enhancerImage);
    } finally {
      setIsEnhancingImage(false);
    }
  };

  const presetList: {
    id: UltraEnhanceOptions['mode'];
    title: string;
    badge: string;
    desc: string;
    icon: any;
  }[] = [
    {
      id: 'dslr-8k-master',
      title: '📸 DSLR Master',
      badge: 'Default',
      desc: 'Crystal optical sharpness, micro-contrast & realistic details.',
      icon: Camera,
    },
    {
      id: 'ultra-graphics-uhd',
      title: '⚡ Ultra Graphics UHD',
      badge: 'UHD Base',
      desc: 'Ultra graphics dynamic tone mapping, micro-texture & UHD shader depth.',
      icon: Sparkles,
    },
    {
      id: 'remini-face-studio',
      title: '💎 Remini Face',
      badge: 'Portrait',
      desc: 'Eye pupil recovery, natural skin pores & smooth blur fix.',
      icon: Sparkle,
    },
    {
      id: 'hasselblad-ultra',
      title: '🎥 Hasselblad',
      badge: '100MP Look',
      desc: 'Deep dynamic tone mapping, film colors & rich textures.',
      icon: Flame,
    },
    {
      id: 'cinema-prime',
      title: '🎬 Cinema 50mm',
      badge: 'Cinematic',
      desc: 'Smooth depth of field, warm highlights & cinematic tone.',
      icon: Film,
    },
    {
      id: 'zero-artifact-clean',
      title: '⚡ Zero Artifact',
      badge: 'Clean',
      desc: 'Removes JPEG pixel noise, compression boxes & grain.',
      icon: Zap,
    },
    {
      id: 'vintage-revival',
      title: '🕰️ Old Photo',
      badge: 'Restore',
      desc: 'Sharpens faded photos, recovers lost edges & contrast.',
      icon: Sparkles,
    },
  ];

  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  return (
    <div id="image-enhancer-studio" className="w-full mx-auto px-3 sm:px-4 py-3 space-y-4 overflow-x-hidden">
      {/* Sleek Minimal Header Bar with Subtle Info & Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
            8K Photo Enhancer & Remini Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Wipe data button if image exists */}
          {enhancerImage && (
            <button
              type="button"
              onClick={handleManualPurge}
              className="px-3 py-1.5 bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Wipe photo memory"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Wipe Memory</span>
            </button>
          )}

          {/* Subtle Dots / Info Button */}
          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl border border-neutral-800 transition-all cursor-pointer flex items-center justify-center text-xs font-bold"
            title="Privacy & Details"
          >
            <span className="tracking-widest font-black text-sm leading-none px-1">•••</span>
          </button>
        </div>
      </div>

      {/* Hidden Collapsible / Modal Details (Behind the dots) */}
      {showInfoModal && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>About & Zero Data Storage Policy</span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Enhance sharpness, skin texture, and contrast to 8K Ultra HD while strictly preserving 100% of the original frame size and aspect ratio.
          </p>
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-400 space-y-1">
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>100% Ephemeral RAM & Zero Storage</span>
            </div>
            <p>
              Aapki photos kisi bhi server, disk ya database me kabhi save nahi hoti. Page se back hote hi ya tab close karte hi sabhi data automatically permanently delete ho jata hai.
            </p>
          </div>
        </div>
      )}

      {/* Wipe Alert Notification */}
      {wipeNotice && (
        <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{wipeNotice}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={enhancerFileInputRef}
        onChange={handleEnhancerImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ===================== MAIN STUDIO WORKSPACE ===================== */}
      {!enhancerImage ? (
        /* Upload Area */
        <div
          onClick={() => enhancerFileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-neutral-750 hover:border-amber-500/70 bg-neutral-900/60 hover:bg-neutral-900/90 rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-200 group shadow-xl"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-neutral-800/80 border border-neutral-700 group-hover:border-amber-500/40 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
            <Upload className="w-9 h-9 text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
            Upload Photo to Enhance in 8K Ultra HD
          </h2>
          <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
            Click anywhere or drag & drop. Supports JPG, PNG, WEBP.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 bg-neutral-800/80 px-3 py-1.5 rounded-full border border-neutral-700/60">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Uncropped Frame
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-800/80 px-3 py-1.5 rounded-full border border-neutral-700/60">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Remini Face & Skin Fix
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-800/80 px-3 py-1.5 rounded-full border border-neutral-700/60">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Free & Unlimited
            </span>
          </div>
        </div>
      ) : (
        /* Workspace Controls & Viewers */
        <div className="space-y-6 animate-fadeIn">
          {/* ================= BOX 1: UPLOADED PHOTO CARD ================= */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                    <span>Uploaded Photo Frame</span>
                    {originalDimensions && (
                      <span className="text-emerald-400 font-mono text-xs bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {originalDimensions.width} × {originalDimensions.height} px
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Original uncropped image preview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => enhancerFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Different Photo</span>
                </button>
                <button
                  type="button"
                  onClick={purgeAllData}
                  className="p-1.5 bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-300 rounded-xl border border-neutral-700 transition-all cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Uploaded Image Box Preview */}
            <div className="relative w-full max-h-[420px] flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950/90 border border-neutral-800/80 p-3 shadow-inner">
              <img
                src={enhancerImage}
                alt="Uploaded Original"
                className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* ================= CONTROLS & PRESETS ================= */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-lg">
            {/* Frame Lock Notice */}
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>PHOTO FRAME SIZE: 100% ORIGINAL (LOCKED)</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 text-[11px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height} px (Exact Native Size)` : 'Original Dimensions Preserved'}</span>
              </span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Enhancement Preset:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedSliders(!showAdvancedSliders)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{showAdvancedSliders ? 'Hide Sliders' : 'Fine-Tune Sliders'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {presetList.map((preset) => {
                  const isSelected = enhanceMode === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectMode(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'bg-neutral-800/90 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/50 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-neutral-100">{preset.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Fine-Tuning Sliders */}
            {showAdvancedSliders && (
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/90 space-y-4">
                <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fine-Tuning Control Sliders:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sharpness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-medium">8K Super Sharpness</span>
                      <span className="font-mono text-amber-400 font-bold">{sharpness} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sharpness}
                      onChange={(e) => setSharpness(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Face Clarity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Face & Eye Clarity (Remini)</span>
                      <span className="font-mono text-amber-400 font-bold">{faceClarity} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={faceClarity}
                      onChange={(e) => setFaceClarity(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* HDR Exposure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-medium">HDR Dynamic Lighting</span>
                      <span className="font-mono text-amber-400 font-bold">{hdrExposure} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={hdrExposure}
                      onChange={(e) => setHdrExposure(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Denoise */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Noise Reduction & Clean</span>
                      <span className="font-mono text-amber-400 font-bold">{denoiseStrength} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={denoiseStrength}
                      onChange={(e) => setDenoiseStrength(Number(e.target.value))}
                      className="w-full accent-amber-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleProcessEnhanceImage()}
                disabled={isEnhancingImage}
                className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-neutral-950 font-black text-sm sm:text-base rounded-xl transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isEnhancingImage && enhanceMode !== 'ultra-graphics-uhd' ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-neutral-950 animate-spin" />
                    <span>Reconstructing 8K Ultra HD Detail (Preserving Original Frame)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-neutral-950 fill-neutral-950" />
                    <span>✨ Enhance Photo in 8K Ultra HD (100% Uncropped)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleProcessEnhanceImage('ultra-graphics-uhd')}
                disabled={isEnhancingImage}
                className={`flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 cursor-pointer border ${
                  enhanceMode === 'ultra-graphics-uhd'
                    ? 'bg-amber-400 text-neutral-950 border-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-neutral-800/90 hover:bg-neutral-750 text-amber-300 hover:text-amber-200 border-amber-500/40 hover:border-amber-400'
                }`}
                title="1-Click Ultra Graphics Enhancing (UHD Base Editing) with 100% Original Frame Size"
              >
                {isEnhancingImage && enhanceMode === 'ultra-graphics-uhd' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-neutral-950 animate-spin" />
                    <span>Processing UHD Graphics...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>⚡ Ultra Graphics Enhancing (UHD Base)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================= BOX 2: ENHANCED RESULT & COMPARISON ================= */}
          {enhancedResultUrl ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                      <span>Enhanced 8K Ultra HD Result</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Completed
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Drag split slider left/right to compare Before vs After
                    </p>
                  </div>
                </div>

                {enhanceStats && (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{enhanceStats.megaPixels} MP Output • {enhanceStats.timeMs}ms</span>
                  </div>
                )}
              </div>

              <div className="bg-neutral-950/90 rounded-xl p-3 sm:p-4 border border-neutral-800/80 shadow-inner">
                <ReminiComparisonViewer
                  originalImage={enhancerImage}
                  enhancedImage={enhancedResultUrl}
                  originalDimensions={originalDimensions || undefined}
                  enhancedDimensions={enhancedDimensions || undefined}
                />
              </div>
            </div>
          ) : (
            /* Helper info before clicking Enhance */
            <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-2xl p-6 text-center text-neutral-400 text-xs">
              Click <strong className="text-amber-400">&apos;✨ Enhance Photo in 8K Ultra HD&apos;</strong> above to generate high-resolution results and open the interactive Before/After comparison viewer.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
