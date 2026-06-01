// KHAI-Guard core. One rule: a change set may touch the product
// ("source") OR its verifiers ("test"), never both in the same PR.
// Keeping the judged separate from the judge means tests stay an
// independent contract (written to spec, landed first) instead of being
// retrofitted to whatever the code now does.
//
// This module is pure and dependency-light (one matcher) so it unit-
// tests cleanly; bin/khai-guard.mjs wraps it with git + process exit.

import picomatch from "picomatch";

// Sensible defaults for a typical Astro/Node web repo. A consumer with a
// different layout (e.g. a monorepo) overrides these via a
// khai-guard.config.json; the package ships defaults so simple repos
// need zero config. Note the buckets put the verifier LAYER — tests, CI
// workflows, git hooks — on the "test" side, not just unit tests.
export const DEFAULT_CONFIG = {
  source: ["src/**", "public/**", "astro.config.*"],
  test: ["tests/**", "test/**", ".github/workflows/**", ".husky/**"],
  // Pure renames/copies change no content, so they never mix buckets.
  exemptRenames: true,
};

// Shallow per-key override: a config file replaces only the keys it sets.
export function resolveConfig(fileConfig) {
  return { ...DEFAULT_CONFIG, ...(fileConfig ?? {}) };
}

/**
 * Classify changed paths into the source / test buckets.
 * @param {string[]} changed repo-relative paths
 * @param {typeof DEFAULT_CONFIG} config
 * @returns {{source: string[], test: string[], mixed: boolean}}
 */
export function classify(changed, config = DEFAULT_CONFIG) {
  // dot:true so .github / .husky (dotfiles) match.
  const isSource = picomatch(config.source, { dot: true });
  const isTest = picomatch(config.test, { dot: true });
  const source = [];
  const test = [];
  for (const f of changed) {
    if (isSource(f)) source.push(f);
    if (isTest(f)) test.push(f);
  }
  return { source, test, mixed: source.length > 0 && test.length > 0 };
}

/**
 * Parse `git diff --name-status -M` lines into changed paths, honoring
 * the rename/copy exemption: R100/C100 are pure moves (no content
 * change) and are dropped; a rename-with-edit is judged by its
 * destination path.
 * @param {string[]} lines
 * @returns {string[]}
 */
export function parseNameStatus(lines, { exemptRenames = true } = {}) {
  const out = [];
  for (const raw of lines) {
    const line = raw.replace(/\n$/, "");
    if (!line.trim()) continue;
    const parts = line.split("\t");
    const status = parts[0];
    if (exemptRenames && (status === "R100" || status === "C100")) continue;
    // Rename/copy rows are: <status>\t<old>\t<new>; use the destination.
    if (/^[RC]/.test(status)) out.push(parts[2]);
    else out.push(parts[1]);
  }
  return out;
}
