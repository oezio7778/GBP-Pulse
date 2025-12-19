
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the NodeJS namespace to ensure process.env.API_KEY is recognized by TypeScript without conflicting with global 'process' types
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
