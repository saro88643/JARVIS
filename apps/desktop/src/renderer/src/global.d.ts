export {};

declare global {
  interface Window {
    jarvisApi?: {
      getSystemInfo: () => Promise<{
        platform: string;
        arch: string;
        electronVersion: string;
        nodeVersion: string;
      }>;
      toggleMainWindow: () => Promise<boolean>;
      toggleFloatingWindow: () => Promise<boolean>;
      getAgentStatus: () => Promise<boolean>;
      toggleAgentStatus: () => Promise<boolean>;
      quitApp: () => Promise<void>;
      onAgentStatusChange: (callback: (status: boolean) => void) => () => void;
    };
  }
}
