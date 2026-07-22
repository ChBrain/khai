#!/usr/bin/env node
// khai-methods CLI.
//
//   khai-methods build     render docs/METHODS.md from the method frontmatter
//   khai-methods verify     drift-check the committed index; exit 1 on drift
//
// build is the sole writer of the index; verify is the drift gate's command form
// (the vitest drift test is the gate CI runs). Both read the method registry, so
// the index and the methods cannot drift.

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMethodsIndex,
  verifyMethodsIndex,
  METHODS_INDEX_PATH,
} from "../lib/methods-index.mjs";

// bin/ -> khai-methods -> packages -> repo root.
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const cmd = process.argv[2] ?? "verify";

if (cmd === "build") {
  buildMethodsIndex(root);
  console.log(`khai-methods build: wrote ${METHODS_INDEX_PATH}.`);
  process.exit(0);
} else if (cmd === "verify") {
  const errors = verifyMethodsIndex(root);
  if (errors.length) {
    for (const e of errors) console.error(`✖ ${e}`);
    process.exit(1);
  }
  console.log(`khai-methods verify: ${METHODS_INDEX_PATH} conforms.`);
  process.exit(0);
} else {
  console.error(`khai-methods: unknown command "${cmd}" (build | verify)`);
  process.exit(2);
}
