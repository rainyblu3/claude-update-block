# Claude Update Block

> Disable Claude Desktop auto-updates on macOS. No MDM required. For personal users.

[English](#english) | [中文](#中文)

---

## English

### What is this?

A command-line tool that **blocks Claude Desktop from auto-updating**. If you've ever searched:

- "How to disable Claude Desktop auto update"
- "How to stop Claude from updating automatically"
- "Claude Desktop disable auto update without MDM"
- "How to lock Claude Desktop version on Mac"
- "Prevent Claude Desktop forced update macOS"
- "Turn off Claude auto update personal user"
- "Block Claude Desktop update without enterprise profile"
- "Claude Desktop version freeze no MDM"

...this is the answer.

### Why?

Claude Desktop has **no GUI toggle** to disable automatic updates. Enterprise users can set `disableAutoUpdates` via MDM, but **personal users are locked out**. Every update risks breaking your workflow, changing the UI, removing features, or switching models without your consent.

**claude-update-block** gives you the same kill-switch enterprises have — without any MDM profile.

### Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/claude-update-block.git
cd claude-update-block
npm install
npm run build
npm link
claude-update-block block
```

Done. Your Claude version is now locked. Updates will not install.

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/claude-update-block.git
cd claude-update-block
npm install && npm run build && npm link
```

After `npm link`, `claude-update-block` is available globally:

```bash
claude-update-block status
```

### Commands

| Command | Description |
|---------|-------------|
| `claude-update-block block` | Lock current version, disable auto-updates |
| `claude-update-block unblock` | Restore auto-update capability |
| `claude-update-block status` | Show block status and Claude version |
| `claude-update-block version` | Show tool version |
| `claude-update-block help` | Show usage guide |

### How It Works — Three-Layer Defense

| Layer | Method | Sudo? |
|-------|--------|:-----:|
| **Strategy A — Defaults** | `defaults write com.anthropic.claudefordesktop disableAutoUpdates -bool true` (simulates MDM config) | No |
| **Strategy B — Hosts** | Adds update-check domains to `/etc/hosts` → `127.0.0.1` | Yes |
| **Strategy C — Permissions** | `chmod -R 555 /Applications/Claude.app` — removes write access | Yes |

Strategy A stops Claude from checking updates via its internal config.
Strategy B blocks network access to update servers at the OS level.
Strategy C prevents Claude's updater binary from writing to disk.

Layer A alone works in most cases. Layers B and C are belt-and-suspenders.

### Status Example

```
┌─────────────────────────────────────────┐
│     Claude Update Block — Status        │
├─────────────────────────────────────────┤
  Claude Desktop: v1.0.52
  App location:   /Applications/Claude.app
├─────────────────────────────────────────┤
  ✅ ⚙️  Strategy A (Defaults): blocked (disableAutoUpdates)
  ✅ 🌐 Strategy B (Hosts): blocked (/etc/hosts entries)
  ✅ 🔒 Strategy C (Permissions): blocked (chmod 555)
├─────────────────────────────────────────┤
  Overall: 🔒 Updates blocked (3/3 strategies active)
└─────────────────────────────────────────┘
```

### Unblock / Restore Updates

```bash
claude-update-block unblock
```

Removes the defaults preference, cleans `/etc/hosts`, and restores `chmod 755`.

### Requirements

- **macOS** — Apple Silicon (arm64) or Intel (x64)
- **Node.js** ≥ 18
- Claude Desktop installed at `/Applications/Claude.app`

### How to verify it's working

Run `claude-update-block status`. If all three strategies show "blocked", Claude Desktop cannot update. You can also try checking for updates manually in Claude's menu — it should fail.

### FAQ

**Q: Will reinstalling Claude Desktop break the block?**
A: Strategy A (defaults) and B (hosts) survive reinstalls. Strategy C (permissions) resets — just run `block` again.

**Q: Which strategy is safest?**
A: Strategy A only touches a macOS preference — zero system file changes. Start there.

**Q: Does this need MDM or enterprise enrollment?**
A: No. This is for personal users. No MDM, no profile, no enterprise config.

**Q: What domains get blocked in /etc/hosts?**
A: `updates.claude.ai`, `download.claude.ai`, `desktop.claude.ai`. You can add more via the source.

### ⚠️ Disclaimer

This tool writes to `/etc/hosts` and modifies `/Applications/Claude.app` permissions. A backup of `/etc/hosts` is saved to `~/.claude-update-block/hosts.backup` before any changes. Use at your own risk.

---

## 中文

### 这是什么？

一个命令行工具，**阻止 Claude Desktop 自动更新**。如果你搜过这些问题：

- "怎么关闭 Claude Desktop 自动更新"
- "Claude 如何禁止自动更新 Mac"
- "Claude Desktop 个人用户怎么禁用更新"
- "没有 MDM 怎么阻止 Claude 更新"
- "Claude 桌面版锁定版本不更新"
- "Claude 强制更新怎么关掉"
- "macOS Claude Desktop 关闭自动升级"
- "Claude 个人版禁用自动更新方法"

...这就是你要找的答案。

### 为什么需要？

Claude Desktop **没有 GUI 开关**来关闭自动更新。企业用户可以通过 MDM 配置文件设置 `disableAutoUpdates`，但**个人用户被完全忽略**。每次强制更新都可能破坏工作流、改动 UI、移除功能、更换模型——而你无法拒绝。

**claude-update-block** 让个人用户也能获得和企业一样的控制权。

### 快速开始

```bash
git clone https://github.com/YOUR_USERNAME/claude-update-block.git
cd claude-update-block
npm install
npm run build
npm link
claude-update-block block
```

搞定。你的 Claude 版本已被锁定，不会自动更新。

### 安装

```bash
git clone https://github.com/YOUR_USERNAME/claude-update-block.git
cd claude-update-block
npm install && npm run build && npm link
```

`npm link` 之后 `claude-update-block` 全局可用：

```bash
claude-update-block status
```

### 命令

| 命令 | 说明 |
|------|------|
| `claude-update-block block` | 锁定版本，禁用自动更新 |
| `claude-update-block unblock` | 恢复自动更新 |
| `claude-update-block status` | 查看拦截状态和 Claude 版本 |
| `claude-update-block version` | 查看工具版本 |
| `claude-update-block help` | 查看帮助 |

### 工作原理 — 三层防御

| 层级 | 方法 | Sudo? |
|------|------|:-----:|
| **A — 偏好设置** | `defaults write com.anthropic.claudefordesktop disableAutoUpdates -bool true`（模拟 MDM 配置） | 否 |
| **B — Hosts** | 将更新域名写入 `/etc/hosts` → `127.0.0.1` | 是 |
| **C — 权限** | `chmod -R 555 /Applications/Claude.app` 移除写入权限 | 是 |

A 层从内部阻止 Claude 检查更新。B 层从网络层屏蔽更新服务器。C 层阻止更新程序写磁盘。大多数情况 A 层就够了，B+C 是双保险。

### 恢复更新

```bash
claude-update-block unblock
```

移除偏好设置、清理 `/etc/hosts`、恢复 `chmod 755`。

### 环境要求

- **macOS** — Apple Silicon 或 Intel
- **Node.js** ≥ 18
- Claude Desktop 已安装在 `/Applications/Claude.app`

### ⚠️ 免责声明

本工具会修改 `/etc/hosts` 和 `/Applications/Claude.app` 的文件权限。修改前 `/etc/hosts` 备份到 `~/.claude-update-block/hosts.backup`。使用风险自负。

---

MIT License
