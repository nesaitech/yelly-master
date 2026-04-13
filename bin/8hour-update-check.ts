import { checkForUpdate } from "../lib/updater.js";
import { join } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");
const CACHE_DIR = join(homedir(), ".8hour-master", "cache");

const { updateAvailable, local, remote } = checkForUpdate(PROJECT_ROOT, CACHE_DIR);

if (updateAvailable && remote) {
  console.log(`UPDATE_AVAILABLE=${remote}`);
  console.log(`8hour-master ${local} → ${remote} available. Run: cd ${PROJECT_ROOT} && git pull && ./setup`);
} else {
  console.log(`CURRENT=${local}`);
}
