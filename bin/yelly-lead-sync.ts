import { syncYellyMd } from "../lib/yelly-lead/sync.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const projectDir = process.argv[2] ?? process.cwd();

let version = "0.0.0";
const versionPath = join(PROJECT_ROOT, "VERSION");
if (existsSync(versionPath)) {
  version = readFileSync(versionPath, "utf-8").trim();
}

const result = syncYellyMd(projectDir, version);

if (!result.yellyMdRewritten) {
  console.error("YELLY.md not found at", projectDir);
  process.exit(1);
}

console.log(
  `✅ YELLY.md synced (${result.sectionsTouched.length} section(s) touched)`,
);
for (const s of result.sectionsTouched) {
  console.log(`  - ${s}`);
}
