# Packaging & Deployment Documentation

JARVIS uses `electron-builder` to package the full desktop application into an installable Windows NSIS `.exe` setup file.

## Packaging Process

To generate `JARVIS Setup.exe`:

```bash
npm run package
```

### Output Location
- Output Directory: `apps/desktop/dist/installer/`
- Generated File: `JARVIS Setup.exe`

## Installer Features
- **NSIS Installer**: Supports custom installation directory selection.
- **Shortcuts**: Automatically creates Desktop and Start Menu shortcuts.
- **Standalone Runtime**: Once installed, JARVIS runs independently without needing Node.js, npm, VS Code, or Antigravity installed on the target machine.
