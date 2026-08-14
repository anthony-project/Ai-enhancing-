import { GenerationOptions } from '../types';

export interface PresetPrompt {
  id: string;
  title: string;
  description: string;
  options: GenerationOptions;
  thumbnailUrl: string;
  badge: string;
}

export const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: '1',
    title: 'Varanasi 2150 AD (Sci-Fi Cyberpunk)',
    description: 'Flying ghats on Ganga, holograms of ancient chants, cyber-sadhus guarding glowing energy crystals in futuristic Varanasi.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    badge: '8K Ultra',
    options: {
      prompt: 'Year 2150 AD in Varanasi. Flying brass ships over golden glowing Ganga river, neon holographic mantras floating in night fog, cybernetic sadhus meditating near quantum energy ghats, cinematic anamorphic lighting, 8k resolution sci-fi masterpiece.',
      language: 'Hindi',
      resolution: '8K Cinema Master',
      aspectRatio: '2.39:1 Anamorphic',
      genre: 'Sci-Fi / Cyberpunk',
      voiceGender: 'Male',
      voiceType: 'Dramatic Deep Male',
      targetDuration: '1 min',
      frameRate: '60 FPS (Ultra Smooth)',
      enhanceVideo: true,
      noWatermark: true,
      sceneCount: 5,
    },
  },
  {
    id: '2',
    title: 'Voyage to Black Hole Horizon (Space Epic)',
    description: 'An astronaut spaceship crew discovering a glowing pink event horizon at the edge of the universe.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    badge: '4K Cinema',
    options: {
      prompt: 'Deep space exploration vessel named Helios-9 entering a shimmering pink and golden black hole event horizon. Floating dust, starry nebulae, dramatic orchestral silence, intense cinematic wonder.',
      language: 'English',
      resolution: '4K Ultra HD',
      aspectRatio: '16:9 Cinema',
      genre: 'Sci-Fi / Cyberpunk',
      voiceGender: 'Female',
      voiceType: 'Serene Cinematic Female',
      targetDuration: '1 min',
      frameRate: '30 FPS (HD)',
      enhanceVideo: true,
      noWatermark: true,
      sceneCount: 4,
    },
  },
  {
    id: '3',
    title: 'Himalayan Mountain Dragon (Mythological Fantasy)',
    description: 'Himalaya ke baraf bhare pahado me sadiyon se soya hua blue crystal dragon jagta hai.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    badge: 'Hinglish Popular',
    options: {
      prompt: 'In snow-covered Himalayan peaks, an ancient blue crystal dragon wakes up after 1000 years. Glacial winds, glowing sapphire scales, majestic temples surrounded by clouds, epic mythological cinema.',
      language: 'Hinglish',
      resolution: '8K Cinema Master',
      aspectRatio: '16:9 Cinema',
      genre: 'Epic Fantasy',
      voiceGender: 'Male',
      voiceType: 'Dramatic Deep Male',
      targetDuration: '2 min',
      frameRate: '60 FPS (Ultra Smooth)',
      enhanceVideo: true,
      noWatermark: true,
      sceneCount: 5,
    },
  },
  {
    id: '4',
    title: 'Rainy Night Neo-Tokyo Detective (Noir Thriller)',
    description: 'Cyberpunk rainy alleyway detective investigating a mysterious glowing envelope under neon lights.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    badge: 'Noir 4K',
    options: {
      prompt: 'Neo-Tokyo 2099 rainy night neon street reflection. Trench coat detective walking through steam, glowing holographic signs, saxophone jazz ambient, mysterious crime noir cinematic.',
      language: 'English',
      resolution: '4K Ultra HD',
      aspectRatio: '2.39:1 Anamorphic',
      genre: 'Horror / Mystery',
      voiceGender: 'Male',
      voiceType: 'Storyteller Narrator',
      targetDuration: '1 min',
      frameRate: '24 FPS (Cinema)',
      enhanceVideo: true,
      noWatermark: true,
      sceneCount: 4,
    },
  },
  {
    id: '5',
    title: 'Chola Dynasty Naval Voyage (Historical Action)',
    description: 'Chola Samraajya ke vishaal samudri jahaz shahi jhande ke sath samudri toofan me aage badhte hue.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    badge: 'Epic Historical',
    options: {
      prompt: 'Ancient Chola empire majestic warship fleet sailing across roaring stormy ocean waves. Golden lion flags fluttering, thunderous sky, heroic naval warriors standing tall on wooden deck.',
      language: 'Tamil',
      resolution: '4K Ultra HD',
      aspectRatio: '16:9 Cinema',
      genre: 'Mythological / Historical',
      voiceGender: 'Male',
      voiceType: 'Heroic Action Male',
      targetDuration: '2 min',
      frameRate: '30 FPS (HD)',
      enhanceVideo: true,
      noWatermark: true,
      sceneCount: 5,
    },
  },
];
