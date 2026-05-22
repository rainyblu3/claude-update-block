#!/usr/bin/env node

import { run } from "./cli";

const args = process.argv.slice(2);

run(args).catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
