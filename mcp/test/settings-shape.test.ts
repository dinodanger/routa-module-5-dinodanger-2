// Checks the settings the tools read have the shape they expect. Uses the fake platform, so it needs no local file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { getSettings } from "../src/platform.ts";
import { fakePlatform } from "./fake-platform.ts";

test("the settings have the shape the tools expect", async () => {
  fakePlatform();
  const settings = await getSettings();
  assert.ok(Array.isArray(settings.access));
  assert.ok(settings.access.every((a) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(settings.policies.every((p) => typeof p.id === "string"));
});
