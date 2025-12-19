
/**
 * Explicitly declare the global 'process' variable to satisfy TypeScript during the build process,
 * as 'process' is not natively available in browser environments but is required for API key access.
 */
declare global {
  // Augment the global ProcessEnv interface to include the required API_KEY
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }

  // Augment the global Process interface to use our augmented ProcessEnv
  interface Process {
    env: ProcessEnv;
  }

  // Redeclare the global 'process' variable using the 'Process' type to match existing declarations (e.g. from @types/node)
  var process: Process;
}

/**
 * Interface for Vite's import.meta.env
 */
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
