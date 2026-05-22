import { execSync, execFileSync } from "child_process";
import sudo from "sudo-prompt";

const CLAUDE_APP = "/Applications/Claude.app";

export function claudePath(subpath = ""): string {
  return subpath ? `${CLAUDE_APP}/${subpath}` : CLAUDE_APP;
}

export function exec(cmd: string): string {
  return execSync(cmd, { encoding: "utf8", timeout: 15000 }).trim();
}

export function execQuiet(cmd: string): string {
  return execSync(cmd, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 15000,
  }).trim();
}

export function getClaudeVersion(): string | null {
  try {
    const plist = execQuiet(
      `plutil -p "${claudePath("Contents/Info.plist")}"`
    );
    const match = plist.match(/"CFBundleShortVersionString"\s*=>\s*"([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    try {
      const mdls = execQuiet(`mdls -name kMDItemVersion -raw "${CLAUDE_APP}"`);
      return mdls || null;
    } catch {
      return null;
    }
  }
}

export function sudoExec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    sudo.exec(cmd, { name: "claude-update-block" }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr?.toString() || err.message));
      } else {
        resolve(stdout?.toString().trim() || "");
      }
    });
  });
}

export function formatStatus(icon: string, label: string, active: boolean, detail?: string): string {
  const mark = active ? "✅" : "❌";
  const suffix = detail ? ` (${detail})` : "";
  return `  ${mark} ${label}: ${active ? "blocked" : "not blocked"}${suffix}`;
}
