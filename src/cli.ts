import { getClaudeVersion } from "./utils";

const VERSION = "1.0.0";

export async function run(args: string[]): Promise<void> {
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    showHelp();
    return;
  }

  if (cmd === "version" || cmd === "--version" || cmd === "-v") {
    showVersion();
    return;
  }

  if (cmd === "status") {
    const { printStatus } = await import("./status");
    printStatus();
    return;
  }

  if (cmd === "block") {
    await doBlock();
    return;
  }

  if (cmd === "unblock") {
    await doUnblock();
    return;
  }

  console.error(`Unknown command: ${cmd}`);
  console.error("Run `claude-update-block help` for usage.");
  process.exit(1);
}

async function doBlock(): Promise<void> {
  console.log("\n🔒 Blocking Claude Desktop auto-updates...\n");

  console.log("Strategy A: Writing macOS defaults preference...");
  const { block: blockDefaults } = await import("./strategies/defaults");
  const aOk = blockDefaults();

  console.log("\nStrategy B: Adding /etc/hosts entries...");
  const { block: blockHosts } = await import("./strategies/hosts");
  const bOk = await blockHosts();

  console.log("\nStrategy C: Locking file permissions (requires sudo)...");
  const { block: blockPerm } = await import("./strategies/permission");
  const cOk = await blockPerm();

  console.log("\n─────────────────────────────────────────");
  const results = [aOk, bOk, cOk];
  const successCount = results.filter(Boolean).length;
  console.log(
    `Block complete: ${successCount}/${results.length} strategies applied.`
  );

  if (cOk) {
    console.log(
      "Note: chmod 555 was applied. Run `claude-update-block unblock` to restore."
    );
  }
  console.log("");
}

async function doUnblock(): Promise<void> {
  console.log("\n🔓 Unblocking Claude Desktop auto-updates...\n");

  console.log("Strategy A: Removing macOS defaults preference...");
  const { unblock: unblockDefaults } = await import("./strategies/defaults");
  unblockDefaults();

  console.log("\nStrategy B: Removing /etc/hosts entries...");
  const { unblock: unblockHosts } = await import("./strategies/hosts");
  await unblockHosts();

  console.log("\nStrategy C: Restoring file permissions (requires sudo)...");
  const { unblock: unblockPerm } = await import("./strategies/permission");
  await unblockPerm();

  console.log("\n─────────────────────────────────────────");
  console.log("Unblock complete. Updates should now work normally.\n");
}

function showHelp(): void {
  console.log(`
Claude Update Block v${VERSION}
─────────────────────────────────────────────
Block Claude Desktop auto-updates on macOS.

Usage:
  claude-update-block block     Lock current version, block updates
  claude-update-block unblock   Restore auto-update capability
  claude-update-block status    Show blocked status & Claude version
  claude-update-block version   Show tool version
  claude-update-block help      Show this help

Strategies:
  A — macOS defaults preference (disableAutoUpdates)
  B — /etc/hosts domain blocking
  C — File permission lock (chmod 555)

Quick start:
  npx claude-update-block block
`);
}

function showVersion(): void {
  console.log(`claude-update-block v${VERSION}`);
  const cv = getClaudeVersion();
  if (cv) console.log(`Claude Desktop: v${cv}`);
}
