// PreToolUse gate: refuse any change to mcp/src/token-check.ts.
// Covers file-editing tools and shell commands that could write to it.
import path from "node:path";
import fs from "node:fs";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = "token-check";

const deny = (reason) => {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `${reason} mcp/src/token-check.ts is protected; ask the user to change it themselves.`,
    },
  }));
  process.exit(0);
};

const isProtectedPath = (p, cwd) => {
  if (typeof p !== "string" || !p) return false;
  const abs = path.resolve(cwd, p);
  let real = abs;
  try { real = fs.realpathSync(abs); } catch {}
  return [abs, real].some((x) => x.split(path.sep).join("/").endsWith("/" + PROTECTED));
};

// Commands that only read. A command segment that mentions the protected
// file is allowed only if it starts with one of these.
const READ_ONLY = new Set([
  "cat", "head", "tail", "less", "more", "wc", "ls", "stat", "file", "grep", "egrep",
  "fgrep", "rg", "diff", "cmp", "nl", "bat", "shasum", "md5", "md5sum", "realpath",
]);
const READ_ONLY_GIT = new Set(["diff", "log", "show", "blame", "status", "grep", "ls-files"]);

const segmentIsSafe = (seg) => {
  if (/[>]/.test(seg)) return false; // any redirection
  if (/\$\(|`/.test(seg)) return false; // substitution can hide a write
  const words = seg.trim().split(/\s+/);
  let i = 0;
  while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) i++; // env prefixes
  const cmd = path.basename(words[i] ?? "");
  if (cmd === "git") return READ_ONLY_GIT.has(words[i + 1]);
  return READ_ONLY.has(cmd);
};

let input = "";
for await (const chunk of process.stdin) input += chunk;
const event = JSON.parse(input || "{}");
const { tool_name: tool, tool_input: args = {} } = event;
const cwd = event.cwd ?? process.cwd();

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  if (isProtectedPath(args.file_path ?? args.notebook_path, cwd)) deny(`${tool} refused.`);
}

if (tool === "Bash") {
  const cmd = String(args.command ?? "");
  if (cmd.includes(NAME)) {
    const segments = cmd.split(/&&|\|\||[;|\n]/);
    for (const seg of segments) {
      if (seg.includes(NAME) && !segmentIsSafe(seg)) {
        deny("Shell command refused: it mentions the file and is not a plain read.");
      }
    }
  }
}
process.exit(0);
