import { existsSync } from "fs";
import { claudePath, sudoExec, execQuiet } from "../utils";

const CLAUDE = claudePath();

export async function block(): Promise<boolean> {
  try {
    if (!existsSync(CLAUDE)) {
      console.error("  ❌ Claude.app not found at /Applications/Claude.app");
      return false;
    }
    await sudoExec(`chmod -R 555 "${CLAUDE}"`);
    return true;
  } catch (err: any) {
    console.error(`  ⚠️  Permission strategy failed: ${err.message}`);
    return false;
  }
}

export async function unblock(): Promise<boolean> {
  try {
    if (!existsSync(CLAUDE)) {
      return true;
    }
    await sudoExec(`chmod -R 755 "${CLAUDE}"`);
    return true;
  } catch (err: any) {
    console.error(`  ⚠️  Permission unblock failed: ${err.message}`);
    return false;
  }
}

export function isBlocked(): boolean {
  try {
    if (!existsSync(CLAUDE)) return false;
    const info = execQuiet(
      `stat -f "%p" "${claudePath("Contents/MacOS/Claude")}"`
    );
    const perms = parseInt(info, 16);
    return (perms & 0o222) === 0;
  } catch {
    return false;
  }
}
