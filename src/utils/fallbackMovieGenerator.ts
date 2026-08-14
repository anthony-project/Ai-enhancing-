import { GenerationOptions, MovieScript, Scene } from '../types';

export function createClientSideFallbackMovie(options: GenerationOptions): MovieScript {
  const cleanPrompt = (options.prompt || 'AI Cinematic Journey').trim();
  const title = cleanPrompt.length > 35 ? cleanPrompt.slice(0, 35) + '...' : cleanPrompt;
  const lang = options.language || 'Hindi';
  const voiceGender = options.voiceGender || 'Male';
  const narrator = voiceGender === 'Female' ? 'Female Narrator' : 'Male Narrator';

  // Determine scenes needed based on duration
  let count = 4;
  if (options.targetDuration === '30 sec') count = 3;
  if (options.targetDuration === '1 min') count = 5;
  if (options.targetDuration === '2 min') count = 7;
  if (options.targetDuration === '3 min') count = 9;
  if (options.targetDuration === '5 min') count = 12;

  const fallbackStockImages = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1600&q=80',
  ];

  const motions = [
    'Smooth 60FPS push-in cinematic pan with anamorphic lens flare',
    'Dynamic tracking camera glide with low-angle hero framing',
    'Slow dramatic zoom-in with shallow depth of field and bokeh',
    'Aerial sweeping drone shot descending through atmospheric mist',
    'Orbiting 360-degree crane motion capturing cinematic lighting',
  ];

  const soundFx = [
    'Deep sub-bass swell, ambient wind, cinematic risers',
    'Atmospheric synth pulse, orchestral string crescendo',
    'Echoing footsteps, resonant thunder roll, sonic impact',
    'High-tech electronic hum, mechanical whir, subtle chime',
  ];

  const scenes: Scene[] = [];

  for (let i = 1; i <= count; i++) {
    let narration = '';
    let translation = '';

    if (lang === 'Hindi') {
      if (i === 1) {
        narration = `यह कहानी शुरू होती है एक अद्भुत दुनिया में, जहाँ ${cleanPrompt} का नया युग जन्म ले रहा है।`;
        translation = `This story begins in a wondrous world, where a new era of ${cleanPrompt} is dawning.`;
      } else if (i === count) {
        narration = `और इस तरह, इतिहास के पन्नों पर हमेशा के लिए अमर हो गई यह अमर दास्तान।`;
        translation = `And thus, this immortal saga became etched forever in the annals of history.`;
      } else {
        narration = `जैसे-जैसे समय का पहिया आगे बढ़ा, रहस्य और भी गहरा होता चला गया। हर कदम पर एक नया मोड़।`;
        translation = `As the wheel of time moved forward, the mystery deepened further with every step.`;
      }
    } else if (lang === 'Hinglish') {
      if (i === 1) {
        narration = `Yeh kahani shuru hoti hai ek aisi duniya se jahan ${cleanPrompt} ki nayi shuruat ho rahi hai.`;
        translation = `This story begins in a world where a new journey of ${cleanPrompt} unfolds.`;
      } else if (i === count) {
        narration = `Aur is tarah ye safar ek yaadgaar manzil par aakar pura hua.`;
        translation = `And thus, this extraordinary journey reached its unforgettable climax.`;
      } else {
        narration = `Har ek pal ke sath suspense aur drama badhta chala gaya. Ek naya mod aur nayi ummeed.`;
        translation = `With every passing moment, the suspense and emotion kept rising.`;
      }
    } else {
      if (i === 1) {
        narration = `In a realm beyond ordinary imagination, the story of ${cleanPrompt} begins to unfold.`;
        translation = `In a realm beyond ordinary imagination, the story of ${cleanPrompt} begins to unfold.`;
      } else if (i === count) {
        narration = `A testament to courage and wonder, marking an unforgettable cinematic climax.`;
        translation = `A testament to courage and wonder, marking an unforgettable cinematic climax.`;
      } else {
        narration = `Through shifting shadows and rising tension, every step brings a deeper revelation.`;
        translation = `Through shifting shadows and rising tension, every step brings a deeper revelation.`;
      }
    }

    let imgUrl = fallbackStockImages[(i - 1) % fallbackStockImages.length];
    if (i === 1 && options.uploadedImageBase64) {
      imgUrl = options.uploadedImageBase64;
    }

    scenes.push({
      sceneNumber: i,
      title: `Sequence ${i}: The Journey`,
      timeOfDayAndLocation: `EXT. CINEMATIC HORIZON - SCENE ${i}`,
      visualPrompt: `Masterpiece 8K cinematic shot, ultra photorealistic, ${options.genre || 'Cinematic'} atmosphere, dramatic lighting, volumetric rays, 60 FPS clarity: ${cleanPrompt}`,
      narrationScript: narration,
      englishTranslation: translation,
      speakerVoice: narrator,
      cameraMotion: motions[(i - 1) % motions.length],
      soundEffects: soundFx[(i - 1) % soundFx.length],
      colorPalette: 'Cinematic Amber Gold & Teal Horizon',
      durationSeconds: Math.max(6, Math.floor(60 / count)),
      imageUrl: imgUrl,
    });
  }

  return {
    id: 'vid-' + Date.now(),
    title: title || 'AI Cinematic Journey',
    tagline: 'An epic visual experience powered by artificial intelligence',
    synopsis: `An extraordinary visual odyssey depicting ${cleanPrompt} with stunning cinematic clarity.`,
    language: lang,
    resolution: options.resolution || '4K Ultra HD',
    aspectRatio: options.aspectRatio || '16:9 Cinema',
    genre: options.genre || 'Sci-Fi / Cyberpunk',
    voiceGender: voiceGender,
    voiceType: options.voiceType || 'Dramatic Deep Male',
    targetDuration: options.targetDuration || '1 min',
    frameRate: options.frameRate || '30 FPS (HD)',
    enhanceVideo: !!options.enhanceVideo,
    noWatermark: !!options.noWatermark,
    uploadedImageBase64: options.uploadedImageBase64,
    ambientAudioMood: 'Epic Orchestral Ambient Score',
    posterPrompt: `Epic 8K cinematic theatrical poster for ${cleanPrompt}`,
    posterUrl: options.uploadedImageBase64 || fallbackStockImages[0],
    totalDurationSeconds: scenes.reduce((acc, s) => acc + s.durationSeconds, 0),
    createdAt: new Date().toISOString(),
    scenes,
  };
}
