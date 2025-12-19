
/// <reference types="vite/client" />
/**
 * Fix: If the environment cannot find 'vite/client' (Error on line 2), ensure 'vite' is 
 * installed or remove the reference above.
 */

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Fix: Removed the manual 'declare global' for 'process' (Error on line 18). 
 * Redefining 'process' when it is already provided by existing type definitions 
 * (like @types/node) causes a "Subsequent variable declarations must have the same type" error.
 */

export {};
