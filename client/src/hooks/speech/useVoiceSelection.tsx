//Author: Harsh Dugar 
// This file is about hooks for voice selection and management using Web Speech API
import { useState, useEffect } from 'react';

export const useVoiceSelection = () => {
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    console.log('Initializing voice selection...');
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        if (voices.length > 0) {
          setAvailableVoices(voices);
          setVoicesLoaded(true);
          
          // Log all English voices for debugging
          const englishVoices = voices.filter(v => v.lang.startsWith('en'));
          console.log('All English voices:', englishVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
          
          // Log British voices specifically
          const britishVoices = voices.filter(v => 
            v.lang.includes('GB') || v.lang.includes('UK') || 
            v.name.toLowerCase().includes('british') ||
            v.name.toLowerCase().includes('uk') ||
            v.name.toLowerCase().includes('kate') ||
            v.name.toLowerCase().includes('serena') ||
            v.name.toLowerCase().includes('daniel')
          );
          console.log('British voices found:', britishVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
        }
      };

      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Multiple attempts for mobile compatibility
      setTimeout(loadVoices, 100);
      setTimeout(loadVoices, 500);
      setTimeout(loadVoices, 1000);
    }
  }, []);

  const findBestVoiceForLanguage = (language: 'en' | 'es') => {
    if (availableVoices.length === 0) {
      console.log('No voices available yet');
      return null;
    }

    console.log(`Finding best voice for language: ${language}`);
    
    // Check if we're in a PWA or mobile environment
    const isMobilePWA = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone || 
                        document.referrer.includes('android-app://');
    
    if (language === 'en') {
      // For mobile PWA, prioritize local voices for reliability
      if (isMobilePWA) {
        const localEnglishVoices = availableVoices.filter(v => 
          v.lang.startsWith('en') && v.localService === true
        );
        
        if (localEnglishVoices.length > 0) {
          // Prefer female voices on mobile
          const femaleLocalVoice = localEnglishVoices.find(v => 
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('karen')
          );
          
          if (femaleLocalVoice) {
            console.log('📱 PWA: Selected local female voice:', femaleLocalVoice.name);
            return femaleLocalVoice;
          }
          
          console.log('📱 PWA: Selected local voice:', localEnglishVoices[0].name);
          return localEnglishVoices[0];
        }
      }
      const naturalBritishVoices = [
        'Microsoft Libby Neural - English (United Kingdom)',
        'Microsoft Sonia Neural - English (United Kingdom)',
        'Microsoft Mia Neural - English (United Kingdom)',
        'Microsoft Hazel Neural - English (United Kingdom)',
        'Microsoft Susan Neural - English (United Kingdom)',
        'Google UK English Female (Neural)',
        'Google UK English Female (Wavenet)',

        'Google UK English Female (Enhanced)',
        'Google UK English Female (Premium)',
        'Google UK English Female (Natural)',
        'Microsoft Hazel Desktop - English (United Kingdom)',
        'Microsoft Susan Desktop - English (United Kingdom)',
        'Microsoft Libby Desktop - English (United Kingdom)',
        'Microsoft Sonia Desktop - English (United Kingdom)',

        'Microsoft Hazel Mobile',
        'Microsoft Susan Mobile',
        'Microsoft Libby Mobile',
        'Microsoft Sonia Mobile',
        'Microsoft Hazel Desktop',
        'Microsoft Susan Desktop',
        'Microsoft Libby Desktop',
        'Microsoft Sonia Desktop',

        'Microsoft Hazel Neural',
        'Microsoft Susan Neural',
        'Microsoft Libby Neural',
        'Microsoft Sonia Neural',
        'Google UK English Female Neural',

        'Google UK English Female',
        'Kate',
        'Serena',
        'Fiona',
        'Moira',
        'Tessa',
        'Stephanie',
        'Victoria',
        'Emma',
        'Amy',
        'Zoe',
        'Chloe',
        'Lucy',
        'Sophie',
        'Olivia',
        'Isabella',
        'Charlotte',
        'Rishi'
      ];

      for (const voiceName of naturalBritishVoices) {
        const voice = availableVoices.find(v => 
          v.name === voiceName && 
          (v.lang.includes('GB') || v.lang.includes('UK') || v.lang.startsWith('en'))
        );
        if (voice) {
          return voice;
        }
      }

      // Then try to find any voice with British locale
      const britishLocaleVoices = availableVoices.filter(v => 
        v.lang === 'en-GB' || v.lang === 'en-UK'
      );

      if (britishLocaleVoices.length > 0) {
        // Enhanced filtering for natural-sounding voices
        const roboticKeywords = [
          'robot', 'synthetic', 'computer', 'machine', 'artificial', 'digital', 'mechanical',
          'alex', 'fred', 'tom', 'david', 'mark', 'john', 'male', 'man', 'guy', 'dude',
          'basic', 'standard', 'default', 'generic', 'simple', 'voice 1', 'voice1'
        ];

        const naturalKeywords = [
          'enhanced', 'premium', 'natural', 'neural', 'ai', 'high quality', 'hq',
          'advanced', 'pro', 'professional', 'expressive', 'lifelike', 'human'
        ];

        // First, filter out obviously robotic voices
        const nonRoboticVoices = britishLocaleVoices.filter(voice =>
          !roboticKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
        );

        // Then prioritize natural-sounding voices
        const naturalBritishVoices = nonRoboticVoices.sort((a, b) => {
          const aIsNatural = naturalKeywords.some(keyword => a.name.toLowerCase().includes(keyword));
          const bIsNatural = naturalKeywords.some(keyword => b.name.toLowerCase().includes(keyword));

          if (aIsNatural && !bIsNatural) return -1;
          if (!aIsNatural && bIsNatural) return 1;
          return 0;
        });

        if (naturalBritishVoices.length > 0) {
          // Enhanced female voice detection with more British names
          const femaleVoices = naturalBritishVoices.filter(voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            ['kate', 'serena', 'fiona', 'moira', 'tessa', 'susan', 'hazel', 'stephanie', 'victoria', 'emma', 'amy', 'rishi', 'zoe', 'chloe', 'lucy', 'sophie', 'libby', 'sonia', 'mia', 'olivia', 'isabella', 'charlotte'].some(name =>
              voice.name.toLowerCase().includes(name)
            )
          );

          if (femaleVoices.length > 0) {
            console.log('🇬🇧 Selected British female voice:', femaleVoices[0].name, 'Lang:', femaleVoices[0].lang);
            return femaleVoices[0];
          } else {
            console.log('🇬🇧 Selected British voice (gender unknown):', naturalBritishVoices[0].name, 'Lang:', naturalBritishVoices[0].lang);
            return naturalBritishVoices[0];
          }
        }
      }

      // Fallback to any high-quality English female voice
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));

      // Use same enhanced filtering as British voices
      const roboticKeywords = [
        'robot', 'synthetic', 'computer', 'machine', 'artificial', 'digital', 'mechanical',
        'alex', 'fred', 'tom', 'david', 'mark', 'john', 'male', 'man', 'guy', 'dude',
        'basic', 'standard', 'default', 'generic', 'simple', 'voice 1', 'voice1'
      ];

      const naturalKeywords = [
        'enhanced', 'premium', 'natural', 'neural', 'ai', 'high quality', 'hq',
        'advanced', 'pro', 'professional', 'expressive', 'lifelike', 'human'
      ];

      // Filter out robotic voices and prioritize natural ones
      const nonRoboticEnglishVoices = englishVoices.filter(voice =>
        !roboticKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
      );

      const naturalEnglishVoices = nonRoboticEnglishVoices.sort((a, b) => {
        const aIsNatural = naturalKeywords.some(keyword => a.name.toLowerCase().includes(keyword));
        const bIsNatural = naturalKeywords.some(keyword => b.name.toLowerCase().includes(keyword));

        if (aIsNatural && !bIsNatural) return -1;
        if (!aIsNatural && bIsNatural) return 1;
        return 0;
      });

      if (naturalEnglishVoices.length > 0) {
        // Prefer premium/enhanced voices (already sorted to top)
        const premiumVoice = naturalEnglishVoices.find(v =>
          naturalKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        );
        
        if (premiumVoice) {
          console.log('🎙️ Selected premium English voice:', premiumVoice.name, 'Lang:', premiumVoice.lang);
          return premiumVoice;
        }

        // Prefer female voices
        const femaleVoice = naturalEnglishVoices.find(v => 
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          ['samantha', 'karen', 'tessa', 'fiona', 'monica', 'jessica'].some(name => 
            v.name.toLowerCase().includes(name)
          )
        );

        if (femaleVoice) {
          console.log('🎙️ Selected English female voice:', femaleVoice.name, 'Lang:', femaleVoice.lang);
          return femaleVoice;
        }

        console.log('🎙️ Selected natural English voice:', naturalEnglishVoices[0].name, 'Lang:', naturalEnglishVoices[0].lang);
        return naturalEnglishVoices[0];
      }

      // If no British voice found, log all available English voices for debugging
      const allEnglishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      console.log('🔍 All available English voices:', allEnglishVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
      console.log('⚠️ No suitable British or natural voice found, using default');
      return null;

    } else {
      // Enhanced Spanish voice logic prioritizing Latin American accents
      const spanishVoicePreferences = [
        // Premium/Neural Latin American voices (highest priority)
        { name: 'Premium', partial: true, priority: 15 },
        { name: 'Enhanced', partial: true, priority: 15 },
        { name: 'Natural', partial: true, priority: 15 },
        { name: 'Neural', partial: true, priority: 15 },
        { name: 'AI', partial: true, priority: 14 },

        // Specific Latin American female names (very high priority)
        { name: 'Google español de Estados Unidos', partial: true, priority: 16 },
        { name: 'Microsoft Paloma Neural', exact: true, priority: 15 },
        { name: 'Microsoft Marta Neural', exact: true, priority: 15 },
        { name: 'Mónica', exact: true, priority: 13 },
        { name: 'Paulina', exact: true, priority: 13 },
        { name: 'Marisol', exact: true, priority: 12 },
        { name: 'Soledad', exact: true, priority: 12 },
        { name: 'Esperanza', exact: true, priority: 12 },
        { name: 'Isabela', exact: true, priority: 12 },
        { name: 'Valentina', exact: true, priority: 12 },
        { name: 'Camila', exact: true, priority: 11 },
        { name: 'Sofia', exact: true, priority: 11 },
        { name: 'Lucia', exact: true, priority: 11 },

        // Latin American country-specific voices
        { name: 'Mexico', partial: true, priority: 10 },
        { name: 'Mexican', partial: true, priority: 10 },
        { name: 'Colombia', partial: true, priority: 10 },
        { name: 'Colombian', partial: true, priority: 10 },
        { name: 'Argentina', partial: true, priority: 10 },
        { name: 'Chilean', partial: true, priority: 10 },
        { name: 'Peruvian', partial: true, priority: 10 },

        // Google/Microsoft high-quality Spanish voices
        { name: 'Google español', partial: true, priority: 9 },
        { name: 'Google Español', partial: true, priority: 9 },
        { name: 'Google Spanish', partial: true, priority: 9 },
        { name: 'Microsoft Sabina', partial: true, priority: 8 },
        { name: 'Microsoft Helena', partial: true, priority: 8 },
        { name: 'Microsoft Paloma', partial: true, priority: 8 },

        // General female indicators (lower priority)
        { name: 'female', partial: true, priority: 6 },
        { name: 'mujer', partial: true, priority: 6 },
        { name: 'femenino', partial: true, priority: 6 }
      ];

      let bestVoice = null;
      let bestPriority = 0;

      for (const voice of availableVoices) {
        if (!voice.lang.toLowerCase().startsWith('es')) continue;

        // Prioritize Latin American locales over Iberian Spanish
        const isLatinAmericanLocale = voice.lang.match(/es-(mx|co|ar|cl|pe|ve|ec|uy|py|bo|cr|gt|hn|ni|pa|sv|do|cu|pr)/i);
        const isIberianSpanish = voice.lang.match(/es-es/i);

        // Check for robotic voices first and skip them
        const roboticKeywords = ['robot', 'synthetic', 'computer', 'machine', 'artificial', 'digital', 'basic', 'standard', 'default'];
        const isRobotic = roboticKeywords.some(keyword =>
          voice.name.toLowerCase().includes(keyword)
        );

        if (isRobotic) continue; // Skip robotic voices entirely

        // Calculate priority score
        let voicePriority = 0;

        // Check name preferences
        for (const pref of spanishVoicePreferences) {
          const matchesName = pref.exact
            ? voice.name === pref.name
            : voice.name.toLowerCase().includes(pref.name.toLowerCase());

          if (matchesName) {
            voicePriority = Math.max(voicePriority, pref.priority);
          }
        }

        // Bonus points for Latin American locales
        if (isLatinAmericanLocale) {
          voicePriority += 3;
          console.log('🌎 Found Latin American Spanish voice:', voice.name, 'Locale:', voice.lang);
        }

        // Penalty for Iberian Spanish (prefer Latin American)
        if (isIberianSpanish) {
          voicePriority -= 2;
          console.log('🇪🇸 Found Iberian Spanish voice (lower priority):', voice.name, 'Locale:', voice.lang);
        }

        // Local service bonus
        if (voice.localService && voicePriority > 0) {
          voicePriority += 1;
        }

        // Update best voice if this one is better
        if (voicePriority > bestPriority) {
          bestVoice = voice;
          bestPriority = voicePriority;
        }
      }

      if (bestVoice) {
        console.log('🌎 Selected Spanish voice:', bestVoice.name, 'Priority:', bestPriority, 'Local:', bestVoice.localService, 'Locale:', bestVoice.lang);
        return bestVoice;
      }

      // If no Spanish voice found, log all available Spanish voices for debugging
      const allSpanishVoices = availableVoices.filter(v => v.lang.toLowerCase().startsWith('es'));
      console.log('🔍 All available Spanish voices:', allSpanishVoices.map(v => `${v.name} (${v.lang}) - Local: ${v.localService}`));
    }
    
    console.log('No suitable high-quality voice found for language:', language);
    return null;
  };

  return {
    voicesLoaded,
    availableVoices,
    findBestVoiceForLanguage
  };
};
