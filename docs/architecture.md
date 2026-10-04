# JARVIS Architecture Documentation

```
                                JARVIS
                                   |
                         Electron Desktop Shell
                                   |
            +----------------------+----------------------+
            |                                             |
         Renderer                                    Main Process
      React UI (Vite)                                Node.js ESM
            |                                             |
        Preload API                               IPC Handler Bridge
            |                                             |
            +----------------------+----------------------+
                                   |
                        Local Express Agent Backend
                               (Port 3001)
                                   |
                        Security Sandwich Sandbox
                           (@jarvis/security)
                                   |
             +---------------------+---------------------+
             |                     |                     |
        Tools Router          Agent Engine          Voice Engine
      (@jarvis/tools)       (@jarvis/agent)       (@jarvis/voice)
```

### Components
1. **Desktop Shell (`apps/desktop`)**: Manages main window, floating voice indicator overlay window, system tray menu, and Windows startup settings.
2. **Local Express Agent Server (`apps/backend`)**: Runs on `http://localhost:3001` handling health checks, AI completions, task steps, and activity logging.
3. **Security Sandwich (`packages/security`)**: Validates path traversal, workspace boundaries (`C:\JARVIS`), and command safety.
4. **Voice Engine (`packages/voice`)**: Provides `SpeechToTextProvider` and `TextToSpeechProvider` abstractions for Windows SAPI5 voice interaction.
5. **Tool System (`packages/tools`)**: Registered tool handlers (`open_application`, `open_folder`, `open_url`, `read_file`, `write_file`, `list_directory`, `search_files`, `run_command`, `git_status`).
