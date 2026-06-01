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

// Raised by resolveConfig when a consumer's khai-guard.config.json is
// malformed. The CLI catches it and exits 2 (config error) rather than
// letting a bad bucket silently match nothing.
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

function assertGlobList(value, key) {
  if (!Array.isArray(value) || value.some((g) => typeof g !== "string")) {
    throw new ConfigError(`"${key}" must be an array of glob strings`);
  }
}

// Shallow per-key override: a config file replaces only the keys it sets.
// Validates the shape so a typo (e.g. source as a bare string) fails loud
// instead of matching nothing and waving every PR through.
export function resolveConfig(fileConfig) {
  if (fileConfig == null) return DEFAULT_CONFIG;
  if (typeof fileConfig !== "object" || Array.isArray(fileConfig)) {
    throw new ConfigError("config must be a JSON object");
  }
  if ("source" in fileConfig) assertGlobList(fileConfig.source, "source");
  if ("test" in fileConfig) assertGlobList(fileConfig.test, "test");
  if ("exemptRenames" in fileConfig && typeof fileConfig.exemptRenames !== "boolean") {
    throw new ConfigError(`"exemptRenames" must be a boolean`);
  }
  if ("defaultRef" in fileConfig && typeof fileConfig.defaultRef !== "string") {
    throw new ConfigError(`"defaultRef" must be a string`);
  }
  return { ...DEFAULT_CONFIG, ...fileConfig };
}

/**
 * Classify changed paths into the source / test buckets.
 * @param {string[]} changed repo-relative paths
 * @param {typeof DEFAULT_CONFIG} config
 * @returns {{source: string[], test: string[], both: string[], mixed: boolean}}
 *
 * `both` holds any path that matches BOTH buckets — that means the
 * config's globs overlap and the verdict is ambiguous, which the CLI
 * surfaces as a config error rather than a phantom "mixed".
 */
export function classify(changed, config = DEFAULT_CONFIG) {
  // dot:true so .github / .husky (dotfiles) match.
  const isSource = picomatch(config.source, { dot: true });
  const isTest = picomatch(config.test, { dot: true });
  const source = [];
  const test = [];
  const both = [];
  for (const f of changed) {
    const s = isSource(f);
    const t = isTest(f);
    if (s) source.push(f);
    if (t) test.push(f);
    if (s && t) both.push(f);
  }
  return { source, test, both, mixed: source.length > 0 && test.length > 0 };
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
    // All other statuses (M, A, D, T, …) are: <status>\t<path>.
    if (/^[RC]/.test(status)) out.push(parts[2]);
    else out.push(parts[1]);
  }
  return out;
}
