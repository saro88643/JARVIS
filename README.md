# JARVIS — Personal AI Voice-Controlled Windows Desktop Assistant

JARVIS is a Windows desktop application that acts as a voice-controlled personal computer assistant.

---

## 🚀 Key Features

* **Windows Desktop Shell**: Built with Electron v34, React v18, Vite v6, and TypeScript v5.
* **System Tray & Background Mode**: Operates in the Windows system tray with quick context controls (Show/Hide Studio, Toggle Voice Indicator, Suspend/Resume Agent, Exit).
* **Floating Voice Indicator Overlay**: Frameless, transparent, draggable, always-on-top pill widget with live status indicator.
* **Voice Engine (`@jarvis/voice`)**: Modular Speech-to-Text (`SpeechToTextProvider`) and Text-to-Speech (`TextToSpeechProvider` via Windows SAPI5 voices).
* **Security Sandwich Sandbox (`@jarvis/security`)**: 4-Tier security permission model (`LEVEL_0_SAFE_READ` to `LEVEL_3_BLOCKED`) guarding file system and command execution.
* **Controlled Windows Tools (`@jarvis/tools`)**: Launch applications (Android Studio, VS Code, Chrome), open approved folders (`C:\JARVIS`), open web URLs in default browser.
* **Windows Auto-Startup**: User-controlled setting to start JARVIS when Windows boots.
* **Standalone Installer Packaging**: Pre-configured `electron-builder` script for generating `JARVIS Setup.exe`.

---

## 🛠 Project Architecture

```
JARVIS Monorepo
├── apps/
│   ├── desktop         # Electron + React + Vite Desktop App
│   └── backend         # Node.js + Express Agent Server
└── packages/
    ├── shared          # Shared TypeScript DTOs & Interfaces
    ├── security        # Path & Command Security Sandbox
    ├── ai              # Gemini / OpenAI / Ollama Provider Adapters
    ├── voice           # STT & TTS Voice Engine & Manager
    ├── tools           # Controlled Windows Tools
    └── agent           # Agent State Engine & Step Planning
```

---

## 💻 Environment Requirements

* **OS**: Windows 10/11 (64-bit)
* **Node.js**: v24.21.0 or higher
* **npm**: v11.19.0 or higher
* **Python**: 3.14.x
* **Java**: 18.0.1 (For Android Studio / Android SDK compatibility)
* **Git**: Installed

---

## ⚙ Setup & Development

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Mode
```bash
npm run dev
```
Starts both the Express backend (`http://localhost:3001`) and Electron desktop app concurrently.

---

## 🧪 Testing & Verification

```bash
# Run Vitest unit tests (31 tests)
npm test

# Build all monorepo packages & apps
npm run build
```

---

## 📦 Building `JARVIS Setup.exe`

To package the standalone Windows installer:
```bash
npm run package
```
Output installer location: `apps/desktop/dist/installer/JARVIS Setup.exe`.

---

## 🛡 Security Policy
JARVIS operates under a strict 4-Tier Security Permission Matrix. Operations outside approved workspace boundaries (`C:\JARVIS`) or dangerous system operations are automatically blocked.
