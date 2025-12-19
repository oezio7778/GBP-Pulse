
/**
 * Global Type Declarations
 * This file ensures that 'process.env.API_KEY' is recognized by the TypeScript compiler.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Fixed: Changed index signature to match the expected { [key: string]: string; } 
      // by using 'string' instead of 'string | undefined'.
      [key: string]: string;
      API_KEY: string;
      NODE_ENV: string;
    }
  }

  // Fixed: Removed the redundant 'interface Process' and 'var process' declarations.
  // These were causing 'Subsequent property declarations' and 'Subsequent variable declarations' 
  // errors because they conflicted with existing global definitions in the environment.
}

export {};
