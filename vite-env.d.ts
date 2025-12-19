
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Global declaration of process for environments where it's injected (like Vercel/Vite).
 * We use interface augmentation of 'Process' and 'ProcessEnv' to match existing 
 * global types and avoid redeclaration errors.
 */
interface ProcessEnv {
  API_KEY: string;
  [key: string]: string | undefined;
}

interface Process {
  env: ProcessEnv;
}

declare var process: Process;
