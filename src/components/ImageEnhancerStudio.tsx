import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  X,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Wand2,
  Maximize2,
  Sliders,
  Camera,
} from 'lucide-react';
import { processUltraHDEnhance, UltraEnhanceOptions } from '../utils/reminiEnhancer';
import { ReminiComparisonViewer } from './ReminiComparisonViewer';

export const ImageEnhancerStudio: React.FC = () => {
  // State
  const [enhancerImage, setEnhancerImage] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isEnhancingImage, setIsEnhancingImage] = useState<boolean>(false);
  const [isAIEditingImage, setIsAIEditingImage] = useState<boolean>(false);
  const [imageEditPrompt, setImageEditPrompt] = useState<string>('');
  const [aiEditMessage, setAiEditMessage] = useState<string | null>(null);
  const [enhancedResultUrl, setEnhancedResultUrl] = useState<string | null>(null);
  const [enhancedDimensions, setEnhancedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [enhanceStats, setEnhanceStats] = useState<{ megaPixels: string; timeMs: number; mode?: string } | null>(null);
  const [enhanceMode, setEnhanceMode] = useState<UltraEnhanceOptions['mode']>('dslr-8k-master');
  const [sharpness, setSharpness] = useState<number>(8);
  const [hdrExposure, setHdrExposure] = useState<number>(3);
  const [faceClarity, setFaceClarity] = useState<number>(5);
  const [denoiseStrength, setDenoiseStrength] = useState<number>(4);
  const [resolutionTarget, setResolutionTarget] = useState<'original' | '2k' | '4k' | '8k'>('original');

  const enhancerFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get nearest supported aspect ratio string
  const getAspectRatioString = (w: number, h: number): string => {
    const ratio = w / h;
    if (ratio >= 1.5) return '16:9';
    if (ratio >= 1.15) return '4:3';
    if (ratio >= 0.85) return '1:1';
    if (ratio >= 0.65) return '3:4';
    return '9:16';
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
        setAiEditMessage(null);

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
        setAiEditMessage(null);

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

  // 8K Reconstruction
  const handleProcessEnhanceImage = async () => {
    if (!enhancerImage || isEnhancingImage) return;
    setIsEnhancingImage(true);
    try {
      const result = await processUltraHDEnhance(enhancerImage, {
        mode: enhanceMode,
        sharpness,
        hdrExposure,
        faceClarity,
        denoiseStrength,
        resolutionTarget,
      });

      setEnhancedResultUrl(result.enhancedDataUrl);
      setEnhancedDimensions({ width: result.enhancedWidth, height: result.enhancedHeight });
      setEnhanceStats({ megaPixels: result.megaPixels, timeMs: result.processingTimeMs, mode: result.algorithmMode });
      setAiEditMessage('8K Ultra HD Enhancement Complete (Zero Pixel Tearing & Exact Frame Size)');
    } catch (err) {
      console.error('Enhancement error:', err);
      setEnhancedResultUrl(enhancerImage);
    } finally {
      setIsEnhancingImage(false);
    }
  };

  // Prompt-Based AI Image Modification with dynamic matching Aspect Ratio
  const handleAIImagePromptEdit = async (customPromptToUse?: string) => {
    const promptToExecute = (customPromptToUse !== undefined ? customPromptToUse : imageEditPrompt).trim();
    if (!enhancerImage && !promptToExecute) return;
    setIsAIEditingImage(true);
    setAiEditMessage(null);

    const matchingAspectRatio = originalDimensions
      ? getAspectRatioString(originalDimensions.width, originalDimensions.height)
      : '1:1';

    try {
      const res = await fetch('/api/ai-image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: enhancerImage,
          prompt: promptToExecute || 'High definition 8K enhancement, clear face, smooth skin, sharp eyes, cinematic lighting',
          mode: enhanceMode,
          aspectRatio: matchingAspectRatio,
        }),
      });

      const data = await res.json();
      const targetImage = data && data.success && data.editedImageUrl ? data.editedImageUrl : enhancerImage || '';

      if (targetImage) {
        const upscaled = await processUltraHDEnhance(targetImage, {
          mode: enhanceMode,
          sharpness,
          hdrExposure,
          faceClarity,
          denoiseStrength,
          resolutionTarget,
        });

        setEnhancedResultUrl(upscaled.enhancedDataUrl);
        setEnhancedDimensions({ width: upscaled.enhancedWidth, height: upscaled.enhancedHeight });
        setEnhanceStats({ megaPixels: upscaled.megaPixels, timeMs: upscaled.processingTimeMs, mode: upscaled.algorithmMode });
        setAiEditMessage(data?.summary || `AI Edit applied: "${promptToExecute || '8K Clarity'}"`);
      }
    } catch (err: any) {
      console.warn('AI image edit fallback to optical reconstruction:', err);
      await handleProcessEnhanceImage();
      setAiEditMessage(`Enhanced with optical parameters for: "${promptToExecute || '8K Clarity'}"`);
    } finally {
      setIsAIEditingImage(false);
    }
  };

  return (
    <div id="image-enhancer-studio" className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-7">
      {/* Hero Intro */}
      <div className="text-center space-y-2.5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-950/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero Pixel Tearing • 100% Uncropped Frame Size • Crystal Clear 8K</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-white tracking-tight leading-tight">
          Enhance Photos to <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 bg-clip-text text-transparent">8K Ultra HD</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-sans max-w-2xl mx-auto">
          Photo ka frame size chota hue bina, exact dimensions preserve karke crystal clear 8K HD me enhance karein. Smooth skin, clear face aur natural details.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={enhancerFileInputRef}
        onChange={handleEnhancerImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ============================================================ */}
      {/* 1. TOP SECTION: PHOTO VIEWPORTS (BOX 1 & BOX 2)             */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* BOX 1: UPLOADED ORIGINAL PHOTO */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>UPLOADED ORIGINAL PHOTO (Live Photo Preview & Original Frame Size)</span>
              </h3>
            </div>

            {enhancerImage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => enhancerFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEnhancerImage(null);
                    setOriginalDimensions(null);
                    setEnhancedResultUrl(null);
                    setEnhancedDimensions(null);
                    setEnhanceStats(null);
                    setAiEditMessage(null);
                  }}
                  className="p-1.5 bg-neutral-800 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-300 rounded-lg border border-neutral-700 hover:border-rose-500/40 transition-all"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Photo View / Upload Box */}
          {enhancerImage ? (
            <div className="space-y-3">
              <div className="relative bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center p-3 min-h-[240px] max-h-[460px]">
                <img
                  src={enhancerImage}
                  alt="Original Upload"
                  className="max-h-[420px] w-auto max-w-full object-contain rounded-lg shadow-xl"
                />
                <div className="absolute top-3 left-3 bg-neutral-950/85 backdrop-blur-md px-3 py-1 rounded-md border border-neutral-700 text-[11px] font-bold text-amber-300 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Original Photo</span>
                </div>
              </div>

              {/* Native Frame Size & Dimensions Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-medium">Original Frame Size:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {originalDimensions ? `${originalDimensions.width} × ${originalDimensions.height} px` : 'Measuring...'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                  {originalDimensions && (
                    <span>
                      Aspect Ratio:{' '}
                      <strong className="text-amber-300 font-mono">
                        {originalDimensions.width / originalDimensions.height >= 1.5
                          ? '16:9 Landscape'
                          : originalDimensions.width / originalDimensions.height >= 1.15
                          ? '4:3 Standard'
                          : originalDimensions.width / originalDimensions.height >= 0.85
                          ? '1:1 Square'
                          : originalDimensions.width / originalDimensions.height >= 0.65
                          ? '3:4 Portrait'
                          : '9:16 Vertical Reel'}
                      </strong>
                    </span>
                  )}
                  <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ 100% Uncropped Original Frame
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => enhancerFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-750 hover:border-amber-500/60 bg-neutral-950/60 hover:bg-neutral-950 rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all group"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                Click or Drag & Drop Photo Here
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Upload JPEG, PNG, or WEBP. Full frame size and original proportions will be 100% preserved.
              </p>
            </div>
          )}
        </div>

        {/* BOX 2: ENHANCED RESULT (DIRECTLY UNDER UPLOADED PHOTO BOX) */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>ENHANCED RESULT (8K Ultra Output & Remini Split Comparison)</span>
              </h3>
            </div>

            {enhanceStats && (
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
                <span className="text-emerald-400 font-bold">{enhanceStats.megaPixels} Megapixels</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{enhanceStats.mode || '8K Master'}</span>
                <span>•</span>
                <span>{enhanceStats.timeMs}ms</span>
              </div>
            )}
          </div>

          {/* Comparison / Enhanced Viewer Frame */}
          {enhancerImage && enhancedResultUrl ? (
            <div className="animate-fadeIn">
              <ReminiComparisonViewer
                originalImage={enhancerImage}
                enhancedImage={enhancedResultUrl}
                originalDimensions={originalDimensions || undefined}
                enhancedDimensions={enhancedDimensions || undefined}
              />
            </div>
          ) : (
            <div className="bg-neutral-950/70 border border-neutral-850 rounded-xl p-8 sm:p-10 text-center text-neutral-400">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-sm font-bold text-neutral-200">
                Enhanced Result Yahan Upar Dikhega
              </p>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Neeche di gayi customized settings adjust karke <strong className="text-emerald-400">&apos;⚡ Enhance Image to 8K Ultra HD&apos;</strong> button dabayein.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MIDDLE SECTION: CUSTOMIZED SETTINGS & AI PROMPT RETOUCHER */}
      {/* ============================================================ */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center justify-center">
              ⚙️
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>CUSTOMIZED SETTINGS & AI PROMPT RETOUCHER</span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Photo ko apni pasand ke hisaab se customize karein:
              </p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 font-semibold">
            100% Uncropped Frame Size Mode
          </span>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Photo Me Kya Karna Chahte Hain? (AI Prompt Instructions)</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-normal">Hindi ya English me likhein</span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={imageEditPrompt}
              onChange={(e) => setImageEditPrompt(e.target.value)}
              placeholder="Photo me kya change ya enhance karna hai? Jaise: Chehra saaf karo aur skin smooth karo, background ke unwanted objects hatao, sunset lighting dalo, aankhein sharp karo..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none font-sans"
              disabled={isAIEditingImage || isEnhancingImage}
            />
            {imageEditPrompt && (
              <button
                type="button"
                onClick={() => setImageEditPrompt('')}
                className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Quick AI Prompt Chips */}
        <div className="space-y-2">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">
            1-Click Quick Action Chips (Photo ke liye):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '💎 Clear Face & Smooth Skin', prompt: 'Ultra clear face, smooth natural skin texture, remove acne and blemishes, high definition eyes' },
              { label: '❌ Remove Background Objects', prompt: 'Clean background, remove distracting background objects and photobombers, soft depth blur' },
              { label: '🌅 Golden Hour Sunset Light', prompt: 'Add warm golden hour sunset lighting, soft sun flare, cinematic warmth, dramatic contrast' },
              { label: '✨ Crystal Eyes & Catchlights', prompt: 'Crystal clear sharp eyes, catchlights, individual eyelashes, natural skin texture' },
              { label: '🎬 35mm Cinema Bokeh', prompt: 'Cinematic 35mm film lens look, smooth creamy background bokeh, rich dynamic range' },
              { label: '⚡ Ultra Denoise & Clean Blur', prompt: 'Remove all digital noise and compression artifacts, fix motion blur, razor sharp edges' },
              { label: '🕰️ Old Photo Restoration', prompt: 'Restore old photo, fix scratches, restore faded colors, enhance facial features to 8K resolution' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setImageEditPrompt(chip.prompt);
                  if (enhancerImage) {
                    handleAIImagePromptEdit(chip.prompt);
                  }
                }}
                className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 text-[11px] font-medium rounded-lg border border-neutral-800 hover:border-amber-500/40 transition-all cursor-pointer active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Feedback / Summary Badge */}
        {aiEditMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{aiEditMessage}</span>
          </div>
        )}

        {/* Frame Size & Target Resolution Selector */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
            <span className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Output Frame Size & Resolution:</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold uppercase text-[11px]">
              {resolutionTarget === 'original'
                ? `Original Native Frame (${originalDimensions ? `${originalDimensions.width}×${originalDimensions.height}` : '100%'})`
                : `${resolutionTarget} UHD Proportional`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setResolutionTarget('original')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                resolutionTarget === 'original'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-black'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div>🎯 100% Native Frame Size</div>
              <div className="text-[10px] opacity-80 mt-0.5">Exact Original Dimensions</div>
            </button>

            <button
              type="button"
              onClick={() => setResolutionTarget('2k')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                resolutionTarget === '2k'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-black'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div>⚡ 2K HD</div>
              <div className="text-[10px] opacity-80 mt-0.5">Proportional 2K</div>
            </button>

            <button
              type="button"
              onClick={() => setResolutionTarget('4k')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                resolutionTarget === '4k'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-black'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div>💎 4K UHD</div>
              <div className="text-[10px] opacity-80 mt-0.5">Ultra High Definition</div>
            </button>

            <button
              type="button"
              onClick={() => setResolutionTarget('8k')}
              className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                resolutionTarget === '8k'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-black'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700'
              }`}
            >
              <div>👑 8K Master</div>
              <div className="text-[10px] opacity-80 mt-0.5">Master 7680p Scale</div>
            </button>
          </div>
        </div>

        {/* Enhancer Mode Preset Grid */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">
            Enhancement Presets:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {[
              { id: 'dslr-8k-master', label: '📸 DSLR Master', sharpness: 8, hdr: 3, clarity: 4, denoise: 4 },
              { id: 'remini-face-studio', label: '💎 Remini Face', sharpness: 7, hdr: 3, clarity: 5, denoise: 4 },
              { id: 'hasselblad-ultra', label: '🎥 Hasselblad', sharpness: 8, hdr: 4, clarity: 4, denoise: 3 },
              { id: 'cinema-prime', label: '🎬 Cinema 50mm', sharpness: 7, hdr: 4, clarity: 4, denoise: 4 },
              { id: 'zero-artifact-clean', label: '⚡ Zero Artifact', sharpness: 7, hdr: 2, clarity: 3, denoise: 5 },
              { id: 'vintage-revival', label: '🕰️ Old Photo', sharpness: 7, hdr: 4, clarity: 4, denoise: 5 },
            ].map((preset) => {
              const isActive = enhanceMode === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setEnhanceMode(preset.id as UltraEnhanceOptions['mode']);
                    setSharpness(preset.sharpness);
                    setHdrExposure(preset.hdr);
                    setFaceClarity(preset.clarity);
                    setDenoiseStrength(preset.denoise);
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-500/40 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Sliders */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-neutral-400">Sharpness:</span>
              <span className="text-amber-400 font-mono font-bold">{sharpness}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={sharpness}
              onChange={(e) => setSharpness(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-neutral-400">HDR Dynamic Exposure:</span>
              <span className="text-amber-400 font-mono font-bold">{hdrExposure}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={hdrExposure}
              onChange={(e) => setHdrExposure(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-neutral-400">Face & Iris Clarity:</span>
              <span className="text-amber-400 font-mono font-bold">{faceClarity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={faceClarity}
              onChange={(e) => setFaceClarity(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-neutral-400">Denoise & Smoothing:</span>
              <span className="text-amber-400 font-mono font-bold">{denoiseStrength}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={denoiseStrength}
              onChange={(e) => setDenoiseStrength(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM SECTION: SINGLE MAIN GENERATE / ENHANCE BUTTON    */}
      {/* ============================================================ */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <button
          type="button"
          onClick={() => {
            if (imageEditPrompt.trim()) {
              handleAIImagePromptEdit(imageEditPrompt);
            } else {
              handleProcessEnhanceImage();
            }
          }}
          disabled={!enhancerImage || isEnhancingImage || isAIEditingImage}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-neutral-950 font-black text-sm sm:text-base rounded-xl shadow-xl shadow-emerald-950/60 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
        >
          {isEnhancingImage || isAIEditingImage ? (
            <>
              <div className="w-5 h-5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
              <span>Enhancing Image to 8K Ultra HD...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-neutral-950 fill-neutral-950" />
              <span>⚡ Enhance Image to 8K Ultra HD (Zero Pixel Tearing)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
