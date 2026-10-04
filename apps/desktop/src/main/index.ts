import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, session } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let floatingWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isAgentRunning = true;
let isQuitting = false;

function loadRenderer(window: BrowserWindow, queryParams: string = '') {
  const indexPath = path.join(__dirname, '../renderer/index.html');
  const hasBuild = fs.existsSync(indexPath);
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  const searchStr = queryParams ? queryParams.replace(/^\?/, '') : undefined;

  if (devUrl) {
    window.loadURL(`${devUrl}${queryParams}`).catch((err) => {
      console.warn('Dev server URL failed to load, attempting build fallback:', err);
      if (hasBuild) {
        window.loadFile(indexPath, searchStr ? { search: searchStr } : undefined);
      }
    });
  } else if (hasBuild && process.env.NODE_ENV !== 'development') {
    window.loadFile(indexPath, searchStr ? { search: searchStr } : undefined);
  } else {
    const devServerUrl = `http://localhost:5173${queryParams}`;
    window.loadURL(devServerUrl).catch(() => {
      if (hasBuild) {
        window.loadFile(indexPath, searchStr ? { search: searchStr } : undefined);
      } else {
        console.error('Neither dev server nor dist/renderer/index.html could be loaded.');
      }
    });
  }
}

function createTrayIcon(): ReturnType<typeof nativeImage.createFromDataURL> {
  // 16x16 PNG icon cyan orb base64 data URI
  const base64Icon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZSURBVDhPY3w54wUDFmBCMGoAQv0wMAAAM2kDNf32H5EAAAAASUVORK5CYII=';
  return nativeImage.createFromDataURL(base64Icon);
}

function notifyAgentStatusChange() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('agent-status-changed', isAgentRunning);
  }
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.webContents.send('agent-status-changed', isAgentRunning);
  }
}

function updateTrayContextMenu() {
  if (!tray) return;

  const isMainVisible = mainWindow !== null && mainWindow.isVisible();
  const isFloatingVisible = floatingWindow !== null && floatingWindow.isVisible();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'JARVIS Personal AI Desktop',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: isMainVisible ? 'Hide Studio Window' : 'Show Studio Window',
      click: () => {
        toggleMainWindow();
      },
    },
    {
      label: isFloatingVisible ? 'Hide Voice Indicator' : 'Show Voice Indicator',
      click: () => {
        toggleFloatingWindow();
      },
    },
    { type: 'separator' },
    {
      label: `Agent Status: ${isAgentRunning ? 'Running' : 'Suspended'}`,
      click: () => {
        toggleAgentStatus();
      },
    },
    { type: 'separator' },
    {
      label: 'Exit JARVIS',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function setupTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip('JARVIS - Personal AI Desktop Assistant');

  tray.on('click', () => {
    toggleMainWindow();
  });

  updateTrayContextMenu();
}

function toggleMainWindow(): boolean {
  if (!mainWindow) {
    createWindow();
    return true;
  }
  if (mainWindow.isVisible()) {
    mainWindow.hide();
    updateTrayContextMenu();
    return false;
  } else {
    mainWindow.show();
    mainWindow.focus();
    updateTrayContextMenu();
    return true;
  }
}

function toggleFloatingWindow(): boolean {
  if (!floatingWindow) {
    createFloatingWindow();
    return true;
  }
  if (floatingWindow.isVisible()) {
    floatingWindow.hide();
    updateTrayContextMenu();
    return false;
  } else {
    floatingWindow.show();
    updateTrayContextMenu();
    return true;
  }
}

function toggleAgentStatus(): boolean {
  isAgentRunning = !isAgentRunning;
  notifyAgentStatusChange();
  updateTrayContextMenu();
  return isAgentRunning;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'JARVIS - Personal AI Computer Agent',
    frame: true,
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  loadRenderer(mainWindow);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      updateTrayContextMenu();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    updateTrayContextMenu();
  });
}

function createFloatingWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: workWidth, height: workHeight } = primaryDisplay.workAreaSize;

  floatingWindow = new BrowserWindow({
    width: 260,
    height: 70,
    x: workWidth - 280,
    y: workHeight - 90,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  loadRenderer(floatingWindow, '?mode=floating');

  floatingWindow.on('closed', () => {
    floatingWindow = null;
    updateTrayContextMenu();
  });
}

app.whenReady().then(() => {
  if (session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(true);
    });
  }

  setupTray();
  createWindow();
  createFloatingWindow();

  app.on('activate', () => {
    if (!mainWindow) createWindow();
    else mainWindow.show();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});

// IPC Handler Registrations
ipcMain.handle('get-system-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
  };
});

ipcMain.handle('toggle-main-window', async () => {
  return toggleMainWindow();
});

ipcMain.handle('toggle-floating-window', async () => {
  return toggleFloatingWindow();
});

ipcMain.handle('get-agent-status', async () => {
  return isAgentRunning;
});

ipcMain.handle('toggle-agent-status', async () => {
  return toggleAgentStatus();
});

ipcMain.handle('quit-app', async () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle('get-auto-start', async () => {
  try {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  } catch {
    return false;
  }
});

ipcMain.handle('toggle-auto-start', async (_event, enable?: boolean) => {
  try {
    const current = app.getLoginItemSettings().openAtLogin;
    const target = typeof enable === 'boolean' ? enable : !current;
    app.setLoginItemSettings({
      openAtLogin: target,
      openAsHidden: true,
    });
    return target;
  } catch {
    return false;
  }
});

