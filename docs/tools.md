# Windows Tools Registry Documentation (`@jarvis/tools`)

Every tool in JARVIS defines a strict schema, permission level, and validated execution handler.

## Catalog of System Tools

1. **`open_application`**:
   - **Description**: Safely opens Windows applications (Android Studio, VS Code, Chrome, PowerShell, Explorer).
   - **Level**: Level 1 (Safe Dev)
2. **`open_folder`**:
   - **Description**: Opens approved workspace folders (`C:\JARVIS`) in Windows File Explorer.
   - **Level**: Level 0 (Safe Read)
3. **`open_url`**:
   - **Description**: Opens URLs or web search queries in the default web browser.
   - **Level**: Level 0 (Safe Read)
4. **`read_file`**:
   - **Description**: Reads contents of approved project files.
   - **Level**: Level 0 (Safe Read)
5. **`write_file`**:
   - **Description**: Creates or updates files in approved workspace.
   - **Level**: Level 2 (Requires Confirmation)
6. **`list_directory`**:
   - **Description**: Lists contents of approved folders.
   - **Level**: Level 0 (Safe Read)
7. **`search_files`**:
   - **Description**: Performs text search across project code files.
   - **Level**: Level 0 (Safe Read)
8. **`run_command`**:
   - **Description**: Executes shell commands within approved workspace boundaries.
   - **Level**: Level 1 / Level 2
9. **`git_status`**:
   - **Description**: Checks Git status and branch state.
   - **Level**: Level 0 (Safe Read)
