import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { sudoExec } from "../utils";

const HOSTS_FILE = "/etc/hosts";
const BACKUP_DIR = join(homedir(), ".claude-update-block");
const BACKUP_FILE = join(BACKUP_DIR, "hosts.backup");
const MARKER = "# --- claude-update-block managed ---";

const BLOCK_DOMAINS = [
  "updates.claude.ai",
  "download.claude.ai",
  "desktop.claude.ai",
];

export function getBlockDomains(): string[] {
  return [...BLOCK_DOMAINS];
}

async function readHosts(): Promise<string> {
  const { execSync } = await import("child_process");
  try {
    return execSync(`cat "${HOSTS_FILE}"`, { encoding: "utf8" });
  } catch {
    throw new Error("Cannot read /etc/hosts");
  }
}

async function writeHosts(content: string): Promise<void> {
  const { mkdirSync } = await import("fs");
  mkdirSync(BACKUP_DIR, { recursive: true });
  const tmpFile = join(BACKUP_DIR, "hosts.tmp");
  writeFileSync(tmpFile, content, "utf8");
  await sudoExec(`cp "${tmpFile}" "${HOSTS_FILE}"`);
}

export async function block(): Promise<boolean> {
  try {
    const { mkdirSync } = await import("fs");
    mkdirSync(BACKUP_DIR, { recursive: true });

    const hostsContent = await readHosts();

    if (!hostsContent.includes(MARKER)) {
      copyFileSync(HOSTS_FILE, BACKUP_FILE);
    }

    const lines = hostsContent.split("\n");
    const existingDomains = new Set(
      lines
        .filter((l) => l.includes("127.0.0.1") && l.includes("#"))
        .map((l) => l.split(/\s+/).pop()?.trim())
        .filter(Boolean)
    );

    const domainsToAdd = BLOCK_DOMAINS.filter(
      (d) => !existingDomains.has(d)
    );

    if (domainsToAdd.length === 0) {
      return true;
    }

    let newContent = hostsContent.trimEnd();
    if (!newContent.includes(MARKER)) {
      newContent += `\n\n${MARKER}`;
    }
    for (const domain of domainsToAdd) {
      newContent += `\n127.0.0.1 ${domain}`;
    }
    newContent += "\n";

    await writeHosts(newContent);
    return true;
  } catch (err: any) {
    console.error(`  ⚠️  Hosts strategy failed: ${err.message}`);
    return false;
  }
}

export async function unblock(): Promise<boolean> {
  try {
    const hostsContent = await readHosts();

    if (!hostsContent.includes(MARKER)) {
      return true;
    }

    const lines = hostsContent.split("\n");
    const filtered = lines.filter((line) => {
      const trimmed = line.trim();
      if (trimmed === MARKER) return false;
      for (const domain of BLOCK_DOMAINS) {
        if (trimmed.startsWith("127.0.0.1") && trimmed.endsWith(domain)) {
          return false;
        }
      }
      return true;
    });

    await writeHosts(filtered.join("\n").replace(/\n{3,}/g, "\n\n"));
    return true;
  } catch (err: any) {
    console.error(`  ⚠️  Hosts unblock failed: ${err.message}`);
    return false;
  }
}

export function isBlocked(): boolean {
  try {
    const content = readFileSync(HOSTS_FILE, "utf8");
    for (const domain of BLOCK_DOMAINS) {
      if (
        content.includes(`127.0.0.1 ${domain}`) ||
        content.includes(`127.0.0.1\t${domain}`)
      ) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
