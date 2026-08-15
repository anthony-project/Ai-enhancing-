import { SupportedLanguage } from '../types';

// Speech Synthesis Helper
export interface SpeechOptions {
  text: string;
  language: SupportedLanguage;
  voiceGender?: 'Male' | 'Female';
  pitch?: number;
  rate?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakNarration({
  text,
  language,
  voiceGender = 'Male',
  pitch,
  rate = 0.92,
  onEnd,
  onError,
}: SpeechOptions) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Custom pitch tuning based on gender
  if (pitch !== undefined) {
    utterance.pitch = pitch;
  } else {
    utterance.pitch = voiceGender === 'Female' ? 1.2 : 0.88;
  }

  utterance.rate = rate;
  utterance.volume = 1.0;

  // Language mapping
  const langMap: Record<SupportedLanguage, string> = {
    Hindi: 'hi-IN',
    Hinglish: 'hi-IN',
    English: 'en-US',
    Spanish: 'es-ES',
    French: 'fr-FR',
    Japanese: 'ja-JP',
    German: 'de-DE',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Arabic: 'ar-SA',
  };

  utterance.lang = langMap[language] || 'en-US';

  // Try finding a matching voice with gender preference
  const selectVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const targetLangPrefix = utterance.lang.split('-')[0];
      const matchingVoices = voices.filter(
        (v) => v.lang.startsWith(targetLangPrefix) || v.lang.includes(targetLangPrefix)
      );

      if (matchingVoices.length > 0) {
        if (voiceGender === 'Female') {
          const femaleVoice = matchingVoices.find(
            (v) =>
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('lekha') ||
              v.name.toLowerCase().includes('heera') ||
              v.name.toLowerCase().includes('kavya') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('karen')
          );
          utterance.voice = femaleVoice || matchingVoices[0];
        } else {
          const maleVoice = matchingVoices.find(
            (v) =>
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('george') ||
              v.name.toLowerCase().includes('ravi') ||
              v.name.toLowerCase().includes('alex') ||
              v.name.toLowerCase().includes('guy') ||
              v.name.toLowerCase().includes('daniel')
          );
          utterance.voice = maleVoice || matchingVoices[0];
        }
      }
    }
  };

  selectVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = selectVoice;
  }

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    activeUtterance = null;
    if (onError) onError(e);
    else if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Web Audio API Ambient Cinematic Score Synthesizer
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeOscillators: OscillatorNode[] = [];

export function startAmbientScore(mood: string = 'sci-fi') {
  if (typeof window === 'undefined') return;

  try {
    stopAmbientScore();

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    // Smooth ramp up
    masterGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 3);
    masterGain.connect(audioCtx.destination);

    const lowerMood = mood.toLowerCase();

    // Determine frequencies for ambient chord
    let freqs = [55, 110, 164.81, 220]; // A minor ambient drone
    if (lowerMood.includes('scifi') || lowerMood.includes('cyber')) {
      freqs = [41.2, 82.4, 123.47, 164.81]; // E minor deep space
    } else if (lowerMood.includes('action') || lowerMood.includes('hero')) {
      freqs = [65.41, 130.81, 196.0, 261.63]; // C minor power
    } else if (lowerMood.includes('mystery') || lowerMood.includes('horror')) {
      freqs = [38.89, 77.78, 116.54, 155.56]; // D# / Eb eerie minor
    }

    activeOscillators = [];

    freqs.forEach((freq, idx) => {
      if (!audioCtx || !masterGain) return;

      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      // Sine & Sawtooth blend for cinematic pad feel
      osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Low pass filter to make sound warm and atmospheric
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + idx * 100, audioCtx.currentTime);

      // Subtle LFO for breathing swell effect
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.15 + idx * 0.05; // slow breath
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start();
      activeOscillators.push(osc);
    });
  } catch (err) {
    console.warn('Web Audio API initialized with restriction or error:', err);
  }
}

export function stopAmbientScore() {
  if (masterGain && audioCtx) {
    try {
      masterGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
      setTimeout(() => {
        activeOscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        });
        activeOscillators = [];
        if (audioCtx && audioCtx.state !== 'closed') {
          audioCtx.close();
        }
        audioCtx = null;
        masterGain = null;
      }, 1600);
    } catch (e) {
      activeOscillators = [];
      audioCtx = null;
      masterGain = null;
    }
  }
}
