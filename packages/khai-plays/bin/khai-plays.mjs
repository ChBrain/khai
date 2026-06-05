#!/usr/bin/env node
// khai-plays CLI: keep the bill and its README in lockstep.
//
//   khai-plays register <source> --blurb "..." [--title T] [--package P] [--repo URL]
//   khai-plays render
//
// `register` writes registry/<slug>.json (the card) and rewrites README.md from
// the whole registry. `render` only rewrites README.md, so a hand-added card or a
// drift check can refresh the human view without touching the data. The card is
// the source of truth; README.md is computed from it, never hand-edited.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slug, validateEntry, loadRegistry, renderReadme } from "../index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const REGISTRY = join(ROOT, "registry");
const README = join(ROOT, "README.md");

const fail = (msg) => {
  console.error(`khai-plays: ${msg}`);
  process.exit(1);
};

/** Parse `--flag value` pairs after the positional args. Unknown flags fail. */
function parseFlags(args, allowed) {
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (!a.startsWith("--")) fail(`unexpected argument "${a}"`);
    const key = a.slice(2);
    if (!allowed.includes(key)) fail(`unknown flag "--${key}"`);
    const value = args[(i += 1)];
    if (value === undefined) fail(`--${key} needs a value`);
    out[key] = value;
  }
  return out;
}

function writeReadme() {
  const md = renderReadme(loadRegistry());
  writeFileSync(README, md.endsWith("\n") ? md : `${md}\n`);
}

function register(args) {
  const source = args[0];
  if (!source || source.startsWith("--")) fail("register needs a <source>");
  const flags = parseFlags(args.slice(1), ["blurb", "title", "package", "repo"]);

  const id = slug(source);
  if (!id) fail(`"${source}" has no slug`);
  const entry = {
    id,
    title: flags.title ?? source,
    package: flags.package ?? `@chbrain/khai-plays-${id}`,
    blurb: flags.blurb ?? "",
  };
  if (flags.repo !== undefined) entry.repo = flags.repo;

  const errors = validateEntry(entry, { id });
  if (errors.length) fail(`card for "${id}": ${errors.join("; ")}`);

  mkdirSync(REGISTRY, { recursive: true });
  writeFileSync(join(REGISTRY, `${id}.json`), `${JSON.stringify(entry, null, 2)}\n`);
  writeReadme();
  console.log(`khai-plays: registered ${id} (${entry.package}); README rewritten.`);
}

function render() {
  writeReadme();
  console.log("khai-plays: README rewritten from the registry.");
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === "register") register(rest);
else if (cmd === "render") render();
else {
  console.error(
    'khai-plays: usage: register <source> --blurb "..." [--title --package --repo] | render',
  );
  process.exit(cmd === undefined || cmd === "--help" || cmd === "-h" ? 0 : 1);
}
