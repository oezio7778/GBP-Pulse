// vite-env.d.ts

// This declaration is critical for fixing TS2591 ("Cannot find name 'process'") during Vercel builds.
declare const process: any;

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
