# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change; apply_change applies it (lint found it applying directly)
- [x] copy_group_access checks for an admin token and only shows the change; apply_change applies it (verify's security judge: two high findings)
- [x] showChange accepts only well-formed changes and stores exactly what it shows (verify's security judge: high finding)
- [x] settings-shape test uses the fake platform, not a gitignored local file (CI failed on PR #1 with ENOENT)
