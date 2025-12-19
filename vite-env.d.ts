
/**
 * Global Type Declarations
 * This file ensures that 'process.env.API_KEY' is recognized by the TypeScript compiler.
 */

// Augment the ProcessEnv interface to include the API_KEY requirement.
interface ProcessEnv {
  API_KEY: string;
  [key: string]: string | undefined;
}

// Augment the existing global Process interface to ensure process.env is correctly typed.
// This avoids redeclaring the 'process' variable, which can cause block-scoped conflicts
// or "must be of type Process" errors if a global Process type is already defined.
interface Process {
  env: ProcessEnv;
}

interface Window {
  /**
   * Use the optional modifier to match standard environment declarations for global window properties
   * and resolve "All declarations of 'aistudio' must have identical modifiers" errors.
   */
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
