import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('jarvisApi', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
});
