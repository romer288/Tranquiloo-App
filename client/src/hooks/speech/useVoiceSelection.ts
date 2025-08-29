import { useMemo } from 'react';

export type Lang = 'en' | 'es';

const EN_PREFERENCES = [
  // Prefer natural‑sounding US voices first
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Jenny Online (Natural) - English (United States)',
  'Google US English',
  'Samantha',
  'Victoria',
  // Fall back to any other available English voice
  'Microsoft Hazel Online (Natural) - English (United Kingdom)',
  'Microsoft Libby Online (Natural) - English (United Kingdom)',
  'Google UK English Female',
];

const ES_PREFERENCES = [
  // Latin accent preference
  'Microsoft Paloma Online (Natural) - Spanish (Mexico)',
  'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
  'Google español de Estados Unidos',
  'Google español',
  'Paulina',
  'Monica',
];

const pickFirstAvailable = (names: string[], voices: SpeechSynthesisVoice[]) => {
  for (const name of names) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  return null;
};

export const useVoiceSelection = () => {
  const findBestVoiceForLanguage = useMemo(
    () => (lang: Lang): SpeechSynthesisVoice | null => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null;
      let voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        // best-effort: poke to load voices
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
        window.speechSynthesis.cancel();
        voices = window.speechSynthesis.getVoices();
      }

      if (lang === 'es') {
        return (
          pickFirstAvailable(ES_PREFERENCES, voices) ||
          voices.find(v => v.lang?.toLowerCase().startsWith('es-')) ||
          voices[0] ||
          null
        );
      }
      return (
        pickFirstAvailable(EN_PREFERENCES, voices) ||
        voices.find(v => v.lang?.toLowerCase().startsWith('en-')) ||
        voices[0] ||
        null
      );
    },
    []
  );

  return { findBestVoiceForLanguage };
};