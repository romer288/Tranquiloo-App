
// WASM loader utilities for TTS and lip-sync
export class WASMLoader {
  private static piperWasm: WebAssembly.Module | null = null;
  private static rhubarb: any = null;

  static async loadPiperWASM(): Promise<WebAssembly.Module> {
    if (this.piperWasm) return this.piperWasm;
    
    try {
      console.log('Loading Piper TTS WASM...');
      const wasmPath = '/wasm/piper.wasm';
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.statusText}`);
      }
      
      const wasmBytes = await response.arrayBuffer();
      this.piperWasm = await WebAssembly.compile(wasmBytes);
      console.log('Piper TTS WASM loaded successfully');
      return this.piperWasm;
    } catch (error) {
      console.warn('Failed to load Piper WASM, using fallback:', error);
      // Return a mock module for fallback
      return {} as WebAssembly.Module;
    }
  }

  static async loadRhubarbLipSync(): Promise<any> {
    if (this.rhubarb) return this.rhubarb;
    
    try {
      console.log('Loading Rhubarb Lip-Sync WASM...');
      const wasmPath = '/wasm/rhubarb.wasm';
      const response = await fetch(wasmPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load WASM: ${response.statusText}`);
      }
      
      const wasmBytes = await response.arrayBuffer();
      const wasmModule = await WebAssembly.compile(wasmBytes);
      this.rhubarb = wasmModule;
      console.log('Rhubarb Lip-Sync WASM loaded successfully');
      return this.rhubarb;
    } catch (error) {
      console.warn('Failed to load Rhubarb WASM, using fallback:', error);
      // Return a mock module for fallback
      return {
        processAudio: (audioData: ArrayBuffer) => Promise.resolve([])
      };
    }
  }
}
