// Migration: 0.1.0 → 0.2.0
//
// 0.2.0 introduces the /8hour-lead mega-skill, the 8HOUR.md context file, and
// the docs/8hour/ artifacts directory. None of these require modifying existing
// 0.1.0 install state — running `./setup` again picks up the new skill, modules,
// CLI tools, and config defaults automatically.
//
// This migration is intentionally a no-op. It exists so future migrations can
// follow a consistent runner pattern: read VERSION, apply each migration whose
// target is greater than the installed version, write the new VERSION.

export const FROM_VERSION = "0.1.0";
export const TO_VERSION = "0.2.0";

export interface MigrationContext {
  projectRoot: string;
  installedVersion: string;
}

export interface MigrationResult {
  applied: boolean;
  notes: string[];
}

export function run(_ctx: MigrationContext): MigrationResult {
  return {
    applied: true,
    notes: [
      "0.2.0 adds /8hour-lead mega-skill, 8HOUR.md context file, docs/8hour/ artifacts.",
      "No in-place changes needed for 0.1.0 installs — re-run ./setup to pick up the new skill.",
      "If you want to bootstrap an existing project's 8HOUR.md, invoke /8hour-lead from your AI agent.",
    ],
  };
}
