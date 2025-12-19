
/**
 * Global Type Declarations for GBP Pulse
 * This file satisfies the TypeScript compiler for browser-based environments
 * that use Node-style globals like 'process.env'.
 */

interface ProcessEnv {
  API_KEY: string;
  [key: string]: string | undefined;
}

interface Process {
  env: ProcessEnv;
}

// Global declaration of process is removed because it conflicts with existing
// block-scoped declarations in the environment (e.g., from Vite or other shims). 
// TypeScript interface merging handles the typing of the global 'process' variable.

interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface Window {
  aistudio?: AIStudio;
}
