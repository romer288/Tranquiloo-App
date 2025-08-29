
// Phoneme to viseme conversion using fallback implementation
let rhubarbWasm: any = null;

const VISEME_MAP: Record<string, string> = {
  'A': 'AA', 'E': 'E', 'I': 'I', 'O': 'O', 'U': 'U',
  'MBP': 'MBP', 'FV': 'FV', 'L': 'L'
};

async function initializeRhubarb() {
  if (rhubarbWasm) return rhubarbWasm;
  
  try {
    // Try to load Rhubarb WASM (fallback implementation)
    console.log('Attempting to load Rhubarb WASM...');
    rhubarbWasm = { ready: true };
    console.log('Using fallback lip-sync processing');
    return rhubarbWasm;
  } catch (error) {
    console.warn('Failed to load Rhubarb WASM, using fallback:', error);
    return { ready: true };
  }
}

export async function toVisemes(phonemeJson: any[]) {
  try {
    const wasmModule = await initializeRhubarb();
    if (!wasmModule) {
      throw new Error('Rhubarb WASM not available');
    }
    
    // Process with fallback implementation
    const mouthCues = await processWithRhubarb(phonemeJson);
    
    return mouthCues.map((cue: any) => ({
      time: cue.start,
      viseme: VISEME_MAP[cue.mouth] ?? 'rest'
    }));
  } catch (error) {
    console.warn('Rhubarb processing failed, using fallback:', error);
    
    // Fallback: direct phoneme to viseme mapping
    return phonemeJson.map((phoneme: any) => ({
      time: phoneme.start,
      viseme: VISEME_MAP[phoneme.phoneme] || 'AA'
    }));
  }
}

async function processWithRhubarb(phonemes: any[]) {
  // Fallback implementation
  return phonemes.map(p => ({
    start: p.start,
    mouth: p.phoneme
  }));
}

export interface VisemeFrame {
  time: number;
  viseme: string;
}

export interface VisemeTimeline {
  frames: VisemeFrame[];
  duration: number;
}

// Add the missing exports for compatibility
export const visemeProcessor = {
  initialize: async () => {
    await initializeRhubarb();
  },
  processPhonemes: async (phonemes: any[]): Promise<VisemeTimeline> => {
    const frames = await toVisemes(phonemes);
    const duration = frames.length > 0 ? Math.max(...frames.map(f => f.time)) : 0;
    return { frames, duration };
  }
};
