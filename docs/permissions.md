# Permission Matrix Documentation

JARVIS categorizes all system tools and operations into a 4-Tier Permission Matrix.

| Tier | Level Name | Examples | User Confirmation Required? |
| :--- | :--- | :--- | :--- |
| **Level 0** | Safe Read | `read_file`, `list_directory`, `search_files`, `git_status`, `open_folder`, `open_url` | **No** (Automatic) |
| **Level 1** | Safe Development | `npm test`, `npm run build`, `open_application` | **No** (Automatic) |
| **Level 2** | User Confirmation | `write_file`, `delete_file`, `git commit`, `git push`, arbitrary shell scripts | **YES** (Interactive Modal Required) |
| **Level 3** | Blocked | Access `C:\Windows`, format drive, extract passwords/cookies | **BLOCKED** (Forbidden) |

## User Confirmation Modal

When a Level 2 tool is requested by the AI Agent, execution pauses and presents a `PermissionModal` with three choices:
- `ALLOW_ONCE`: Approves single execution.
- `ALLOW_FOR_PROJECT`: Approves tool execution for the active project session.
- `DENY`: Rejects the operation and safely halts the agent task.
