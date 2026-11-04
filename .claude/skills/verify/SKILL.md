---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent that did not build the server reads it against a file of criteria.

   **Input.** The criteria file. It defaults to `client/security-criteria.md`; if the user names another file, use that one. Nothing else in this check depends on the file's contents, so it can be swapped.

   **Run it** with the Agent tool, as `general-purpose`, in a new agent every time. Never continue an earlier judge with SendMessage, and never run the judge yourself. Give it only this brief, with `<criteria>` replaced by the path:

   > You are a security reviewer. You did not build this server. Read `<criteria>`, then read the server in `mcp/src` (every file, including `mcp/src/tools`) and the tests in `mcp/test`. Judge the code against each rule in the criteria. Read only: don't edit, run or fix anything, and don't open token files, `.env` files or `test-environment/.data`.
   >
   > Rate every finding with one of the severities the criteria define: low, medium, high or critical. For each finding give: the severity, the criteria rule it breaks, the file and line, the line quoted exactly, and one sentence on why it breaks the rule. A finding without a file, a line and a quote doesn't count. If a rule has no finding, say so, naming the rule. Don't report anything the criteria don't cover.

   Don't tell the judge what you built, what you expect, or what earlier checks found.

   **Check the report before using it.** For each finding, confirm that the quoted line is at the stated file and line. Send back to the judge, with SendMessage, any finding whose quote is missing or wrong, and drop it if it can't be fixed. Don't add findings of your own, and don't change a rating.

   **Pass or fail.** The check fails if any finding is high or critical. List those findings with severity, file, line and quote. Report low and medium findings as notes; they don't fail the check.
