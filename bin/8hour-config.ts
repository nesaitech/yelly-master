import { getConfigValue, setConfigValue } from "../lib/config.js";
import { join } from "path";
import { homedir } from "os";

const CONFIG_PATH = join(homedir(), ".8hour-master", "config.yaml");

const args = process.argv.slice(2);
const command = args[0];

function usage(): void {
  console.log(`Usage:
  8hour-config get <key>          Read a config value (dot path)
  8hour-config set <key> <value>  Write a config value
  8hour-config path               Show config file path

Examples:
  8hour-config get test.framework
  8hour-config set test.tdd true
  8hour-config set deploy.platform vercel`);
}

function parseValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== "") return num;
  return raw;
}

switch (command) {
  case "get": {
    const key = args[1];
    if (!key) { usage(); process.exit(1); }
    const value = getConfigValue(CONFIG_PATH, key);
    if (value === undefined) {
      process.exit(1);
    } else {
      console.log(typeof value === "object" ? JSON.stringify(value) : String(value));
    }
    break;
  }
  case "set": {
    const key = args[1];
    const rawValue = args[2];
    if (!key || rawValue === undefined) { usage(); process.exit(1); }
    setConfigValue(CONFIG_PATH, key, parseValue(rawValue));
    console.log(`Set ${key} = ${rawValue}`);
    break;
  }
  case "path": {
    console.log(CONFIG_PATH);
    break;
  }
  default:
    usage();
    process.exit(command ? 1 : 0);
}
