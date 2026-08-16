export type SupportedLanguage = 
  | 'Hindi'
  | 'Hinglish'
  | 'English'
  | 'Spanish'
  | 'French'
  | 'Japanese'
  | 'German'
  | 'Tamil'
  | 'Telugu'
  | 'Arabic';

export type MovieResolution = '1080p HD' | '4K Ultra HD' | '8K Cinema Master';

export type AspectRatio = '16:9 Cinema' | '2.39:1 Anamorphic' | '9:16 Vertical';

export type MovieGenre = 
  | 'Sci-Fi / Cyberpunk'
  | 'Cinematic Drama'
  | 'Action Thriller'
  | 'Horror / Mystery'
  | 'Epic Fantasy'
  | 'Documentary'
  | 'Anime / Animation'
  | 'Mythological / Historical';

export type VoiceGender = 'Male' | 'Female';

export type VoiceType = 
  | 'Dramatic Deep Male'
  | 'Heroic Action Male'
  | 'Serene Cinematic Female'
  | 'Enchanting Storyteller Female'
  | 'Storyteller Narrator'
  | 'Intense Action Voice'
  | 'Narrator Voice';

export type VideoDuration = '30 sec' | '1 min' | '2 min' | '3 min' | '5 min' | '9 min';

export type FrameRate = '24 FPS (Cinema)' | '30 FPS (HD)' | '60 FPS (Ultra Smooth)';

export interface Scene {
  sceneNumber: number;
  title: string;
  timeOfDayAndLocation: string;
  visualPrompt: string;
  imageUrl?: string;
  narrationScript: string;
  englishTranslation: string;
  speakerVoice: string;
  cameraMotion: string;
  soundEffects: string;
  colorPalette: string;
  durationSeconds: number;
}

export interface MovieScript {
  id: string;
  title: string;
  tagline: string;
  synopsis: string;
  language: SupportedLanguage;
  resolution: MovieResolution;
  aspectRatio: AspectRatio;
  genre: MovieGenre;
  voiceGender?: VoiceGender;
  voiceType: VoiceType;
  targetDuration?: VideoDuration;
  frameRate?: FrameRate;
  enhanceVideo?: boolean;
  noWatermark?: boolean;
  uploadedImageBase64?: string;
  ambientAudioMood: string;
  posterPrompt: string;
  posterUrl?: string;
  totalDurationSeconds: number;
  createdAt: string;
  scenes: Scene[];
}

export interface GenerationOptions {
  prompt: string;
  uploadedImageBase64?: string;
  language: SupportedLanguage;
  resolution: MovieResolution;
  aspectRatio: AspectRatio;
  genre: MovieGenre;
  voiceGender?: VoiceGender;
  voiceType: VoiceType;
  targetDuration?: VideoDuration;
  frameRate?: FrameRate;
  enhanceVideo?: boolean;
  noWatermark?: boolean;
  sceneCount?: number;
}

