#!/usr/bin/env node
// khai-skills CLI.
//
//   khai-skills build     compose src/ -> dist/<skill>/ + dist/<skill>.zip + MANIFEST
//   khai-skills check     compose + validate in memory (no write); exit 1 on errors
//   khai-skills drift     compare the pin to the real upstream; advisory, always exit 0
//
// build/check enforce the two-tier guard (agentskills standard + khai neutrality
// + provenance). drift is the "on next touch" notification: it never blocks.

import { buildAll, PIN } from "../lib/build.mjs";
import { checkDrift, sha256 } from "../lib/guard.mjs";

function report({ results }) {
  let failed = false;
  for (const r of results) {
    for (const e of r.errors) {
      failed = true;
      console.error(`✖ ${r.name}: ${e}`);
    }
    for (const w of r.warnings) console.error(`⚠ ${r.name}: ${w}`);
  }
  return failed;
}

async function fetchText(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "khai-skills" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function runDrift() {
  let fetched = {};
  try {
    const pypi = JSON.parse(await fetchText(`https://pypi.org/pypi/${PIN.validator.package}/json`));
    fetched.validatorVersion = pypi?.info?.version;
  } catch {
    /* network-tolerant: a missing signal is simply not checked */
  }
  try {
    fetched.specSha256 = sha256(await fetchText(PIN.spec.url));
  } catch {
    /* idem */
  }

  if (fetched.validatorVersion === undefined && fetched.specSha256 === undefined) {
    console.log("khai-skills drift: upstream unreachable; skipped (offline).");
    return 0;
  }

  const { moved, notices } = checkDrift(PIN, fetched);
  if (!moved) {
    console.log(
      `khai-skills drift: pinned to ${PIN.standard} validator ${PIN.validator.package}@${PIN.validator.version}; still current.`,
    );
    return 0;
  }
  console.warn("");
  console.warn(`⚠ agentskills standard moved since pin (${PIN.pinned}):`);
  for (const n of notices) console.warn(`    ${n}`);
  console.warn(
    "  Review docs/specification.mdx + skills-ref, reconcile lib/guard.mjs, then re-pin",
  );
  console.warn("  standards/agentskills.pin.json. Advisory only; not blocking.");
  return 0; // advisory: never block
}

const cmd = process.argv[2] ?? "check";

if (cmd === "build") {
  const out = buildAll({ write: true });
  const failed = report(out);
  if (failed) {
    console.error("\nkhai-skills build: conformance failed; dist written but NOT shippable.");
    process.exit(1);
  }
  console.log(`khai-skills build: ${out.results.length} skill(s) built to dist/, all conformant.`);
  process.exit(0);
} else if (cmd === "check") {
  const out = buildAll({ write: false });
  const failed = report(out);
  if (failed) {
    console.error("\nkhai-skills check: conformance failed.");
    process.exit(1);
  }
  console.log(
    `khai-skills check: ${out.results.length} skill(s) conform (standard + neutrality + provenance).`,
  );
  process.exit(0);
} else if (cmd === "drift") {
  process.exit(await runDrift());
} else {
  console.error(`khai-skills: unknown command "${cmd}" (build | check | drift)`);
  process.exit(2);
}
