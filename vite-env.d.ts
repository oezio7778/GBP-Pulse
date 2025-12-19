
/**
 * We augment the NodeJS namespace provided by @types/node.
 * This adds our specific environment variables to the existing process.env type definition.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
