# Security Sandbox Documentation

JARVIS enforces a strict multi-layer **Security Sandwich** model to ensure that AI agent actions can never compromise the Windows host environment.

## Security Principles

1. **Context Isolation**: Electron renderer runs with `contextIsolation: true` and `nodeIntegration: false`.
2. **Preload API Restriction**: No direct `require`, `fs`, `child_process`, or `shell` access is exposed to React.
3. **Workspace Boundary**: Default file access is restricted strictly to approved directories (`C:\JARVIS`).
4. **Path Traversal Defense**: All file paths are evaluated via `path.resolve` and checked for `..` escapes.
5. **Prompt Injection Defense**: File contents, web pages, and command output are treated strictly as unprivileged data strings.

## Restricted Path Policies

The following paths are strictly blocked from unauthorized reading or writing:
- `C:\Windows` and `System32`
- `C:\Program Files`
- Browser profile directories (cookies, passwords, tokens)
- System credentials & registry files
