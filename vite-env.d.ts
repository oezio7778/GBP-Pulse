
/**
 * Global Type Declarations
 * This file ensures that 'process.env.API_KEY' is recognized by the TypeScript compiler.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }

  // Define the Process interface to resolve type mismatch errors where 'process' is expected to be of type 'Process'
  interface Process {
    env: NodeJS.ProcessEnv;
  }

  // Declare the global 'process' variable using the matching 'Process' type
  var process: Process;
}

// Ensure this file is treated as a module
export {};
