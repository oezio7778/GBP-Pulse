
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * We augment the NodeJS namespace to provide specific typing for the environment
 * variables used in this project. The 'process' variable itself is provided 
 * by @types/node, which is explicitly referenced in the service files.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
