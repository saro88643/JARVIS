import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('jarvisApi', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  toggleMainWindow: () => ipcRenderer.invoke('toggle-main-window'),
  toggleFloatingWindow: () => ipcRenderer.invoke('toggle-floating-window'),
  getAgentStatus: () => ipcRenderer.invoke('get-agent-status'),
  toggleAgentStatus: () => ipcRenderer.invoke('toggle-agent-status'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onAgentStatusChange: (callback: (status: boolean) => void) => {
    const listener = (_event: any, status: boolean) => callback(status);
    ipcRenderer.on('agent-status-changed', listener);
    return () => ipcRenderer.removeListener('agent-status-changed', listener);
  },
});

