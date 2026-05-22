import { exec, execQuiet } from "../utils";

const DOMAIN = "com.anthropic.claudefordesktop";
const KEY = "disableAutoUpdates";

export function block(): boolean {
  try {
    exec(`defaults write ${DOMAIN} ${KEY} -bool true`);
    return true;
  } catch {
    console.error("  ⚠️  Failed to write defaults preference (may need permissions)");
    return false;
  }
}

export function unblock(): boolean {
  try {
    exec(`defaults delete ${DOMAIN} ${KEY}`);
    return true;
  } catch {
    return true;
  }
}

export function isBlocked(): boolean {
  try {
    const val = execQuiet(`defaults read ${DOMAIN} ${KEY}`);
    return val === "1" || val === "true";
  } catch {
    return false;
  }
}
