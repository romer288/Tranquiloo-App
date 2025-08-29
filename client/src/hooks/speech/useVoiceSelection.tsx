
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
      // First, try to find specific British female voices by name
      const specificBritishVoices = [
        'Google UK English Female',
        'Microsoft Hazel Desktop',
        'Microsoft Susan',
        'Kate',
        'Serena',
        'Daniel (Enhanced)', // Sometimes this is actually female
        'Fiona',
        'Moira',
        'Tessa'
      ];

      for (const voiceName of specificBritishVoices) {
        const voice = availableVoices.find(v => 
          v.name === voiceName && 
          (v.lang.includes('GB') || v.lang.includes('UK') || v.lang.startsWith('en'))
        );
        if (voice) {
          console.log('🇬🇧 Found specific British voice:', voice.name, 'Lang:', voice.lang);
          return voice;
        }
      }

      // Then try to find any voice with British locale
      const britishLocaleVoices = availableVoices.filter(v => 
        v.lang === 'en-GB' || v.lang === 'en-UK'
      );

      if (britishLocaleVoices.length > 0) {
        // Prefer non-robotic sounding names
        const roboticKeywords = ['robot', 'synthetic', 'computer', 'machine', 'alex', 'fred', 'tom', 'david', 'mark', 'male', 'man'];
        const naturalBritishVoices = britishLocaleVoices.filter(voice => 
          !roboticKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
        );

        if (naturalBritishVoices.length > 0) {
          // Prefer female-sounding names or those with 'female' in the name
          const femaleVoices = naturalBritishVoices.filter(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            ['kate', 'serena', 'fiona', 'moira', 'tessa', 'susan', 'hazel'].some(name => 
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
      const roboticKeywords = ['robot', 'synthetic', 'computer', 'machine', 'alex', 'fred', 'tom', 'david', 'mark'];
      const naturalEnglishVoices = englishVoices.filter(voice => 
        !roboticKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
      );

      if (naturalEnglishVoices.length > 0) {
        // Prefer premium/enhanced voices
        const premiumVoice = naturalEnglishVoices.find(v => 
          v.name.toLowerCase().includes('premium') ||
          v.name.toLowerCase().includes('enhanced') ||
          v.name.toLowerCase().includes('natural')
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

      console.log('⚠️ No suitable British or natural voice found, using default');
      return null;

    } else {
      // Spanish voice logic (unchanged)
      const spanishVoicePreferences = [
        { name: 'Premium', partial: true, priority: 10 },
        { name: 'Enhanced', partial: true, priority: 10 },
        { name: 'Natural', partial: true, priority: 10 },
        { name: 'Mónica', exact: true, priority: 9 },
        { name: 'Paulina', exact: true, priority: 9 },
        { name: 'Marisol', exact: true, priority: 8 },
        { name: 'Soledad', exact: true, priority: 8 },
        { name: 'Google español', partial: true, priority: 8 },
        { name: 'Google Español', partial: true, priority: 8 },
        { name: 'Microsoft Sabina', partial: true, priority: 7 },
        { name: 'Microsoft Helena', partial: true, priority: 6 },
        { name: 'female', partial: true, priority: 5 },
        { name: 'mujer', partial: true, priority: 5 }
      ];

      let bestVoice = null;
      let bestPriority = 0;

      for (const voice of availableVoices) {
        if (!voice.lang.toLowerCase().startsWith('es')) continue;

        for (const pref of spanishVoicePreferences) {
          const matchesName = pref.exact 
            ? voice.name === pref.name
            : voice.name.toLowerCase().includes(pref.name.toLowerCase());

          if (matchesName && pref.priority > bestPriority) {
            bestVoice = voice;
            bestPriority = pref.priority;
          }
        }

        if (voice.localService && bestPriority < 6) {
          bestVoice = voice;
          bestPriority = 6;
        }

        const roboticKeywords = ['robot', 'synthetic', 'computer', 'machine'];
        const isRobotic = roboticKeywords.some(keyword => 
          voice.name.toLowerCase().includes(keyword)
        );
        
        if (isRobotic && bestVoice === voice) {
          bestVoice = null;
          bestPriority = 0;
        }
      }

      if (bestVoice) {
        console.log('Selected Spanish voice:', bestVoice.name, 'Priority:', bestPriority, 'Local:', bestVoice.localService);
        return bestVoice;
      }
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
