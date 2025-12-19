
/**
 * Global Type Declarations for GBP Pulse
 */

declare global {
  // Use interfaces to allow merging and avoid "Subsequent variable declarations must have the same type" error
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }

  interface Process {
    env: ProcessEnv;
  }

  // Declaring process with the merged Process type to match existing global declarations
  // This resolves the error where 'process' must be of type 'Process'
  var process: Process;

  // Define the interface for AI Studio tools
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  // Extend the Window interface correctly
  interface Window {
    aistudio?: AIStudio;
  }
}

// Ensure this file is treated as a module
export {};
