import { getSettings } from "../platform.ts";
import type { Change } from "../platform.ts";
import { showChange } from "../preview.ts";
import { requireAdmin } from "../token-check.ts";

export const copyGroupAccessTool = {
  name: "copy_group_access",
  description:
    "Show what giving one group every application another group has would do, without changing anything. It only adds applications the group lacks; it never removes any. Returns an id for apply_change.",
  inputSchema: {
    type: "object",
    properties: { from: { type: "string" }, to: { type: "string" } },
    required: ["from", "to"],
  },
  async handler({ from, to }: { from: string; to: string }) {
    await requireAdmin();
    const settings = await getSettings();
    const source = settings.access.find((a) => a.group === from);
    const target = settings.access.find((a) => a.group === to);
    if (!source || !target) throw new Error(`No group called ${source ? to : from}. Check the names with get_settings.`);
    const changes: Change[] = source.apps.filter((app) => !target.apps.includes(app)).map((app) => ({ type: "access", group: to, app, allowed: true }));
    if (changes.length === 0) return `${to} already has every application ${from} has. Nothing to change.`;
    return showChange(changes, settings);
  },
};
