
// Fix: Removed failing reference to vite/client as it is not found in the current environment
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Fix: Removed the 'declare var process' line to resolve the redeclaration error.
 * We continue to extend the NodeJS namespace to provide type definitions for 
 * process.env.API_KEY, ensuring compatibility with Gemini API guidelines.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
