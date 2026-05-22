import { getClaudeVersion, formatStatus, claudePath, execQuiet } from "./utils";
import { existsSync } from "fs";

interface StrategyStatus {
  name: string;
  icon: string;
  blocked: boolean;
  detail?: string;
}

function checkDefaultsBlocked(): boolean {
  try {
    const val = execQuiet(
      "defaults read com.anthropic.claudefordesktop disableAutoUpdates"
    );
    return val === "1" || val === "true";
  } catch {
    return false;
  }
}

function checkHostsBlocked(): boolean {
  try {
    const { readFileSync } = require("fs");
    const content = readFileSync("/etc/hosts", "utf8");
    return content.includes("claude.ai") && content.includes("127.0.0.1");
  } catch {
    return false;
  }
}

function checkPermissionBlocked(): boolean {
  try {
    if (!existsSync(claudePath("Contents/MacOS/Claude"))) return false;
    const info = execQuiet(
      `stat -f "%p" "${claudePath("Contents/MacOS/Claude")}"`
    );
    const perms = parseInt(info, 16);
    return (perms & 0o222) === 0;
  } catch {
    return false;
  }
}

export function printStatus(): void {
  const version = getClaudeVersion();
  const installed = existsSync(claudePath());

  console.log("\n┌─────────────────────────────────────────┐");
  console.log("│     Claude Update Block — Status        │");
  console.log("├─────────────────────────────────────────┤");
  console.log(
    `  Claude Desktop: ${installed ? `v${version || "unknown"}` : "Not installed"}`
  );
  console.log(
    `  App location:   ${installed ? claudePath() : "N/A"}`
  );
  console.log("├─────────────────────────────────────────┤");

  const strategies: StrategyStatus[] = [
    {
      name: "Strategy A (Defaults)",
      icon: "⚙️",
      blocked: checkDefaultsBlocked(),
      detail: "com.anthropic.claudefordesktop disableAutoUpdates",
    },
    {
      name: "Strategy B (Hosts)",
      icon: "🌐",
      blocked: checkHostsBlocked(),
      detail: "/etc/hosts entries",
    },
    {
      name: "Strategy C (Permissions)",
      icon: "🔒",
      blocked: checkPermissionBlocked(),
      detail: "chmod 555 /Applications/Claude.app",
    },
  ];

  for (const s of strategies) {
    console.log(formatStatus(s.icon, s.name, s.blocked, s.detail));
  }

  const activeCount = strategies.filter((s) => s.blocked).length;

  console.log("├─────────────────────────────────────────┤");
  console.log(
    `  Overall: ${
      activeCount > 0
        ? `🔒 Updates blocked (${activeCount}/${strategies.length} strategies active)`
        : "⚠️  Updates NOT blocked — run `claude-update-block block`"
    }`
  );
  console.log("└─────────────────────────────────────────┘\n");
}
