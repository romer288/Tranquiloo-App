// Safe storage wrapper for iframe/mobile environments
// Falls back to in-memory storage when localStorage is blocked

const makeSafeStorage = (): Storage => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    console.warn('localStorage blocked, using in-memory storage');
    const memoryStore = new Map<string, string>();
    
    return {
      getItem: (key: string) => memoryStore.get(key) || null,
      setItem: (key: string, value: string) => { memoryStore.set(key, String(value)); },
      removeItem: (key: string) => { memoryStore.delete(key); },
      clear: () => { memoryStore.clear(); },
      key: (index: number) => {
        const keys = Array.from(memoryStore.keys());
        return keys[index] || null;
      },
      get length() {
        return memoryStore.size;
      }
    } as Storage;
  }
};

export const safeStorage = makeSafeStorage();