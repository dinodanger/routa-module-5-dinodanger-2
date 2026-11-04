// Gate: every change is shown before it is applied.
// A tool in mcp/src/tools, other than apply-change.ts, that calls patchSettings
// must also call showChange.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = "mcp/src/tools";
const EXEMPT = new Set(["apply-change.ts"]);

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const calls = (src: string, fn: string) => new RegExp(`\\b${fn}\\s*\\(`).test(src);

const failures: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && !EXEMPT.has(f))) {
  const src = stripComments(readFileSync(join(dir, file), "utf8"));
  if (calls(src, "patchSettings") && !calls(src, "showChange")) failures.push(join(dir, file));
}

if (failures.length) {
  console.error("lint: these tools call patchSettings without calling showChange:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log("lint: ok");
