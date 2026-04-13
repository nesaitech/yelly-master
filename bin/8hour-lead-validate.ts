import { validateProjectDir } from "../lib/8hour-lead/validate.js";

const projectDir = process.argv[2] ?? process.cwd();

const result = validateProjectDir(projectDir);

if (result.errors.length > 0) {
  console.error("ERRORS:");
  for (const e of result.errors) console.error(`  - ${e}`);
}
if (result.warnings.length > 0) {
  console.warn("WARNINGS:");
  for (const w of result.warnings) console.warn(`  - ${w}`);
}
if (result.ok && result.warnings.length === 0) {
  console.log("✅ 8HOUR.md and artifacts are valid.");
}

process.exit(result.ok ? 0 : 1);
