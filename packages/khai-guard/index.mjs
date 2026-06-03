// KHAI-Guard core. Two rules, one principle: keep the judged separate
// from the judge.
//
//   1. source/test separation (classify): a change set may touch the
//      product ("source") OR its verifiers ("test"), never both in the
//      same PR. Tests stay an independent contract (written to spec,
//      landed first) instead of being retrofitted to whatever the code
//      now does.
//
//   2. branch scope (classifyBranch / checkBranchScope): every branch is
//      classified by its NAME into a lane, and may only touch that lane's
//      paths. The lanes encode a layered order
//      architecture -> governance -> solution ("rules -> the judge -> the
//      defendant") so the gate that judges a change can never be weakened
//      inside the same branch that needs it to pass.
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

// Validate the branchScope section: a list of lanes, each binding a branch-
// name pattern to the paths that lane may touch. A malformed lane is a config
// error (throw) rather than a silent hole that waves an out-of-lane change
// through. The lane order is meaningful — advise() reports a multi-lane split
// in declared order, which the config lists architecture -> governance ->
// solution -> infra -> general to mirror the layered merge order.
function assertBranchScope(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new ConfigError(`"branchScope" must be an object`);
  }
  if (!Array.isArray(value.lanes)) {
    throw new ConfigError(`"branchScope.lanes" must be an array`);
  }
  // `shared` (optional) is a glob list of safe metadata any lane may touch
  // (e.g. .changeset/**). Shared paths are unowned: laneForPath returns null
  // for them and checkBranchScope waves them through on every lane.
  if ("shared" in value) assertGlobList(value.shared, "branchScope.shared");
  value.lanes.forEach((lane, i) => {
    const at = `branchScope.lanes[${i}]`;
    if (typeof lane !== "object" || lane == null || Array.isArray(lane)) {
      throw new ConfigError(`"${at}" must be an object`);
    }
    if (typeof lane.pattern !== "string" || lane.pattern.length === 0) {
      throw new ConfigError(`"${at}.pattern" must be a non-empty string`);
    }
    if (typeof lane.layer !== "string" || lane.layer.length === 0) {
      throw new ConfigError(`"${at}.layer" must be a non-empty string`);
    }
    assertGlobList(lane.allow, `${at}.allow`);
    // `unit` (optional) is the zero-based segment index of the branch name
    // that binds {name} in the allow globs (e.g. engine/<name>/<change> has
    // unit 1). It must point at a real segment of the pattern.
    if ("unit" in lane) {
      const segments = lane.pattern.split("/");
      if (!Number.isInteger(lane.unit) || lane.unit < 0 || lane.unit >= segments.length) {
        throw new ConfigError(
          `"${at}.unit" must be an integer segment index within "${lane.pattern}"`,
        );
      }
      if (!lane.allow.some((g) => g.includes("{name}"))) {
        throw new ConfigError(`"${at}" sets a unit but no allow glob uses the {name} placeholder`);
      }
    }
  });
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
  if ("branchScope" in fileConfig) assertBranchScope(fileConfig.branchScope);
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

// --- Branch scope -----------------------------------------------------------
//
// The second rule. Where classify() judges a diff by content bucket,
// classifyBranch / checkBranchScope / advise judge it by the branch NAME's
// lane. A wrong name fails fast, before any path is even examined, which is
// the point: the lane a contributor declares is a promise about what they may
// touch, and the order of lanes (architecture -> governance -> solution) keeps
// the gate above the thing it gates.

// Match a branch name against a lane pattern. Each non-trailing `*` in the
// pattern matches exactly one branch segment; the TRAILING `*` matches one or
// more remaining segments so the free `<change>` topic may itself contain
// slashes. Returns the matched segments (in pattern order) or null on no match.
function matchLanePattern(pattern, branchName) {
  const pSegs = pattern.split("/");
  const bSegs = branchName.split("/");
  // Literal (non-wildcard) prefix segments must match one-for-one, so the
  // branch must have at least as many segments as the pattern.
  if (bSegs.length < pSegs.length) return null;
  const captured = [];
  for (let i = 0; i < pSegs.length; i++) {
    const p = pSegs[i];
    const isLast = i === pSegs.length - 1;
    if (p === "*") {
      if (isLast) {
        // Trailing wildcard swallows every remaining segment as one topic.
        const rest = bSegs.slice(i).join("/");
        if (rest.length === 0) return null;
        captured.push(rest);
      } else {
        if (bSegs[i].length === 0) return null;
        captured.push(bSegs[i]);
      }
    } else {
      // A literal segment must match exactly, and (if last) consume the rest.
      if (isLast) {
        if (bSegs.slice(i).join("/") !== p) return null;
      } else if (bSegs[i] !== p) {
        return null;
      }
      captured.push(p);
    }
  }
  return captured;
}

/**
 * Classify a branch NAME into its lane.
 * @param {string} branchName e.g. "engine/gender/add-axis"
 * @param {typeof DEFAULT_CONFIG} config resolved config with a branchScope
 * @returns {{lane: string, layer: string, unit: string|null} | null}
 *
 * `lane` is the pattern's prefix (the first segment: "arch", "governance",
 * "engine", ...). `layer` is the declared order layer ("architecture",
 * "governance", "solution", "infra", "general"). `unit` is the bound name for
 * a fan-out lane (engine/<name>/... -> "gender"), else null. Returns null for
 * an unrecognized name so the CLI can reject it rather than guess a lane.
 */
export function classifyBranch(branchName, config = DEFAULT_CONFIG) {
  const lanes = config.branchScope?.lanes;
  if (!Array.isArray(lanes) || typeof branchName !== "string" || branchName.length === 0) {
    return null;
  }
  for (const lane of lanes) {
    const captured = matchLanePattern(lane.pattern, branchName);
    if (!captured) continue;
    const unit = "unit" in lane ? (captured[lane.unit] ?? null) : null;
    return { lane: lane.pattern.split("/")[0], layer: lane.layer, unit };
  }
  return null;
}

// Resolve a lane's allow globs, substituting {name} with the bound unit. A
// lane with no {name} (every lane but engine) returns its globs unchanged.
function resolveAllow(lane, unit) {
  return lane.allow.map((g) => (unit == null ? g : g.replaceAll("{name}", unit)));
}

// Find the lane object whose pattern the branch matches (the same first-match
// walk classifyBranch uses), returning { lane, captured, unit } or null.
function findLane(branchName, config) {
  const lanes = config.branchScope?.lanes;
  if (!Array.isArray(lanes)) return null;
  for (const lane of lanes) {
    const captured = matchLanePattern(lane.pattern, branchName);
    if (captured) {
      const unit = "unit" in lane ? (captured[lane.unit] ?? null) : null;
      return { lane, captured, unit };
    }
  }
  return null;
}

// Which PROTECTED lane OWNS a given path? Ownership is deny-by-default: only
// architecture / governance / solution lanes own paths, and a path owned by a
// protected lane may be touched by that lane alone. Walks the lanes and returns
// the first protected lane whose allow globs match, binding {name} from the
// path itself for fan-out lanes so an engine file reports its real owner
// (engine/<name>). Returns null for an UNOWNED path: one matched by
// branchScope.shared (safe metadata), or one no protected lane claims. General
// and infra lanes (repo/chore/fix/docs) never own a path — they may only touch
// what is unowned + shared — so they are skipped from attribution entirely.
function laneForPath(path, config) {
  // Shared metadata (e.g. .changeset/**) belongs to no lane: any branch may
  // touch it, so it must not be attributed to an owner.
  const shared = config.branchScope?.shared ?? [];
  if (shared.length > 0 && picomatch(shared, { dot: true })(path)) return null;
  const lanes = config.branchScope?.lanes ?? [];
  for (const lane of lanes) {
    // Only protected layers own paths. General/infra lanes are allowlisted to
    // touch unowned + shared paths by the checker, but they never "own" a path:
    // letting them own would re-open the catch-all hole this rule closes.
    if (lane.layer === "general" || lane.layer === "infra") continue;
    let unit = null;
    if ("unit" in lane) {
      // Derive the would-be name from the path: a {name} glob like
      // packages/engines/{name}/** binds {name} to the path's matching
      // segment. Recover it by matching the literal prefix.
      const probe = lane.allow.find((g) => g.includes("{name}"));
      const prefix = probe.slice(0, probe.indexOf("{name}"));
      if (path.startsWith(prefix)) {
        unit = path.slice(prefix.length).split("/")[0];
      }
    }
    const globs = resolveAllow(lane, unit);
    if (picomatch(globs, { dot: true })(path)) {
      const laneName = lane.pattern.split("/")[0];
      return unit == null ? laneName : `${laneName}/${unit}`;
    }
  }
  return null;
}

/**
 * Check that every changed path is allowed by the branch's lane.
 * @param {string} branchName the current branch
 * @param {string[]} changedPaths repo-relative paths the branch changed
 * @param {typeof DEFAULT_CONFIG} config resolved config with a branchScope
 * @returns {{ok: boolean, violations: string[]}}
 *
 * An unrecognized branch name is itself the violation (no lane = no promise).
 * Otherwise ownership decides, deny-by-default: a path owned by a protected
 * lane may be touched ONLY by that lane; a shared path (branchScope.shared) is
 * fine on any lane; an unowned path is fine ONLY on a general/infra lane (a
 * protected lane such as arch/ may touch nothing but what it owns). Out-of-lane
 * paths produce a prescriptive message; when offenders are owned by more than
 * one distinct lane the report ends with SPLIT REQUIRED, since a multi-lane
 * change must be split into per-lane branches that merge in layer order.
 */
export function checkBranchScope(branchName, changedPaths, config = DEFAULT_CONFIG) {
  const matched = findLane(branchName, config);
  if (!matched) {
    return {
      ok: false,
      violations: [
        `branch "${branchName}" matches no lane. Rename it to one of: ` +
          `${(config.branchScope?.lanes ?? []).map((l) => l.pattern).join(", ")}. ` +
          `Run \`khai-guard advise --files <paths>\` for the correct branch(es).`,
      ],
    };
  }
  const { lane, unit } = matched;
  const laneName = lane.pattern.split("/")[0];
  const here = unit == null ? laneName : `${laneName}/${unit}`;
  const isGeneral = lane.layer === "general" || lane.layer === "infra";

  // Shared metadata (e.g. .changeset/**) ships with every change and is
  // unowned: any lane may touch it, so it is never an offender.
  const shared = config.branchScope?.shared ?? [];
  const isShared = shared.length > 0 ? picomatch(shared, { dot: true }) : () => false;

  const wanted = new Set();
  const violations = [];
  for (const p of changedPaths) {
    if (isShared(p)) continue;
    const owner = laneForPath(p, config); // a protected owner, or null (unowned)
    if (owner != null) {
      // A path owned by a protected lane is locked to that lane.
      if (owner === here) continue;
      wanted.add(owner);
      violations.push(`"${p}" is owned by lane "${owner}"; a "${here}" branch may not touch it.`);
    } else {
      // Unowned: only the general/infra lanes (repo/chore/fix/docs) may carry
      // it. A protected lane straying onto an unowned path is a violation.
      if (isGeneral) continue;
      violations.push(`"${p}" is unowned; put it on a repo/ or chore/ branch.`);
    }
  }

  if (violations.length === 0) return { ok: true, violations: [] };

  // More than one distinct owning lane in the set => the change is genuinely
  // multi-lane and cannot live on one branch. Spell out the required split.
  if (wanted.size > 1) {
    violations.push(
      `SPLIT REQUIRED: this change spans ${wanted.size} lanes (${[...wanted].join(", ")}). ` +
        `Split into per-lane branches and merge them in order ` +
        `architecture -> governance -> solution. Run ` +
        `\`khai-guard advise --files <paths>\` for the exact branches.`,
    );
  }

  return { ok: false, violations };
}

// Declared layer order for sorting a split: lower index merges first. Anything
// unlisted (a custom layer) sorts last but keeps a stable relative order.
const LAYER_ORDER = ["architecture", "governance", "solution", "infra", "general"];

/**
 * Advise on the correct branch(es) for a set of changed paths.
 * @param {{files: string[]}} args the changed repo-relative paths
 * @param {typeof DEFAULT_CONFIG} config resolved config with a branchScope
 * @returns {{lanes: Array<{lane: string, layer: string, unit: string|null,
 *   files: string[], checkout: string}>, split: boolean, unowned: string[],
 *   lines: string[]}}
 *
 * Groups the files by the lane that owns each, emits a `git checkout -b` per
 * lane, and — when the set spans more than one lane — flags split:true and
 * orders the lanes architecture -> governance -> solution so the caller lands
 * them in the layered merge order. `lines` is the ready-to-print rendering the
 * CLI emits; `unowned` lists paths no lane claims (a config gap to fix).
 */
export function advise({ files = [] }, config = DEFAULT_CONFIG) {
  const lanesCfg = config.branchScope?.lanes ?? [];
  const byKey = new Map();
  const unowned = [];

  for (const path of files) {
    const owner = laneForPath(path, config);
    if (owner == null) {
      unowned.push(path);
      continue;
    }
    if (!byKey.has(owner)) byKey.set(owner, []);
    byKey.get(owner).push(path);
  }

  const lanes = [...byKey.entries()].map(([owner, laneFiles]) => {
    // owner is either "<lane>" or "<lane>/<unit>" (fan-out). Recover the lane
    // config + layer + a suggested checkout command.
    const laneName = owner.split("/")[0];
    const unit = owner.includes("/") ? owner.slice(owner.indexOf("/") + 1) : null;
    const laneCfg = lanesCfg.find((l) => l.pattern.split("/")[0] === laneName);
    const layer = laneCfg?.layer ?? "general";
    const checkout =
      unit == null
        ? `git checkout -b ${laneName}/<change> origin/main`
        : `git checkout -b ${laneName}/${unit}/<change> origin/main`;
    return { lane: laneName, layer, unit, files: laneFiles, checkout };
  });

  lanes.sort((a, b) => {
    const ai = LAYER_ORDER.indexOf(a.layer);
    const bi = LAYER_ORDER.indexOf(b.layer);
    return (ai < 0 ? LAYER_ORDER.length : ai) - (bi < 0 ? LAYER_ORDER.length : bi);
  });

  const split = lanes.length > 1;
  const lines = [];
  if (lanes.length === 0) {
    lines.push("KHAI-Guard advise: no lane owns any of these paths.");
  } else if (split) {
    lines.push(
      `KHAI-Guard advise: this set spans ${lanes.length} lanes — SPLIT REQUIRED.`,
      "Create one branch per lane and merge them in this order:",
    );
    lanes.forEach((l, i) => {
      lines.push(`  ${i + 1}. [${l.layer}] ${l.checkout}`);
      for (const f of l.files) lines.push(`       ${f}`);
    });
  } else {
    const l = lanes[0];
    lines.push(`KHAI-Guard advise: one lane (${l.layer}). Use:`, `  ${l.checkout}`);
    for (const f of l.files) lines.push(`     ${f}`);
  }
  if (unowned.length > 0) {
    lines.push("", "No lane owns these paths (extend branchScope in khai-guard.config.json):");
    for (const f of unowned) lines.push(`  ${f}`);
  }

  return { lanes, split, unowned, lines };
}
