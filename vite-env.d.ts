
/**
 * Fix: Removed the triple-slash reference to 'vite/client' which was causing a "Cannot find type definition file" error.
 * Added local definitions for ImportMeta and ImportMetaEnv to provide necessary Vite environment typing when the external reference is unavailable.
 */
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Fix: Augmented the NodeJS namespace to include API_KEY in ProcessEnv.
 * Removed the conflicting 'declare var process' statement which caused "Subsequent variable declarations must have the same type" 
 * and "Cannot redeclare block-scoped variable" errors by clashing with existing global definitions of 'process'.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
