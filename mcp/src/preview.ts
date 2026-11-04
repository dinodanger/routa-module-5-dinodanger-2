// Shows a change in plain words and keeps it under an id, so what is applied is what was shown.
import { randomUUID } from "node:crypto";
import type { Change, Settings } from "./platform.ts";

const shown = new Map<string, Change[]>();

function inWords(change: Change, settings: Settings): string {
  if (change.type === "access") return `${change.group} ${change.allowed ? "gains" : "loses"} ${change.app}`;
  const policy = settings.policies.find((p) => p.id === change.id);
  return `${change.id} goes from ${JSON.stringify(policy?.value)} to ${JSON.stringify(change.value)}`;
}

const FORMS = 'Each change is {"type":"access","group","app","allowed"} or {"type":"policy","id","value"}.';

// Rebuilds a change from known fields only, so what is stored is exactly what is described.
function clean(raw: unknown, n: number): Change {
  const c = raw as Record<string, unknown> | null;
  const bad = (why: string) => new Error(`Change ${n + 1} ${why}. ${FORMS} Nothing was previewed.`);
  if (!c || typeof c !== "object" || Array.isArray(c)) throw bad("is not an object");
  const keys = Object.keys(c).sort().join(",");
  if (c.type === "access") {
    if (keys !== "allowed,app,group,type") throw bad("has the wrong fields for an access change");
    if (typeof c.group !== "string" || typeof c.app !== "string") throw bad("needs group and app as text");
    if (typeof c.allowed !== "boolean") throw bad("needs allowed to be true or false");
    return { type: "access", group: c.group, app: c.app, allowed: c.allowed };
  }
  if (c.type === "policy") {
    if (keys !== "id,type,value") throw bad("has the wrong fields for a policy change");
    if (typeof c.id !== "string") throw bad("needs id as text");
    if (!["boolean", "number", "string"].includes(typeof c.value)) throw bad("needs value to be true or false, a number or text");
    return { type: "policy", id: c.id, value: c.value as boolean | number | string };
  }
  throw bad('has a type that is neither "access" nor "policy"');
}

export function showChange(requested: Change[], settings: Settings): string {
  if (!Array.isArray(requested) || requested.length === 0) throw new Error(`There are no changes to show. ${FORMS}`);
  const changes = requested.map(clean);
  const id = randomUUID();
  shown.set(id, changes);
  return [`Change ${id} would do this:`, ...changes.map((c) => `- ${inWords(c, settings)}`), "Nothing has changed yet. Apply it with apply_change and this id."].join("\n");
}

export function takeChange(id: string): Change[] {
  const changes = shown.get(id);
  if (!changes) throw new Error(`No change has been shown with id ${id}. Preview it first.`);
  shown.delete(id);
  return changes;
}
