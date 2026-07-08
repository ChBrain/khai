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
//   3. bump scope (parseChangeset / bumpScope): a changeset may bump patch
//      freely, but minor/major widen the published release and are the
//      maintainer's call, not the agent's. The gate can't HARD-lock that (the
//      bot runs with the maintainer's own credentials), so its teeth are
//      LOUDNESS: every non-patch bump is detected, named, and flagged, so an
//      escalation can never ship silently or by accident.
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

function assertStringList(value, key) {
  if (!Array.isArray(value) || value.some((s) => typeof s !== "string")) {
    throw new ConfigError(`"${key}" must be an array of strings`);
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
  // `riders` (optional): a third path class. A rider ATTACHES to the lane of the
  // change it accompanies — like `shared`, it is never an offender on any lane —
  // but UNLIKE shared it homes to a declared `fallback` lane when it rides
  // ALONE, so it is never stranded. A management order (management/orders/**) is
  // the motivating case: an order can drive a change in any lane, so it rides
  // that lane in one branch; committed by itself it still has a home. Each rider
  // names a `pattern` (glob) and a `fallback` (an existing lane's name).
  if ("riders" in value) {
    if (!Array.isArray(value.riders)) {
      throw new ConfigError(`"branchScope.riders" must be an array`);
    }
    const laneNames = new Set(value.lanes.map((l) => l.pattern.split("/")[0]));
    value.riders.forEach((rider, i) => {
      const at = `branchScope.riders[${i}]`;
      if (typeof rider !== "object" || rider == null || Array.isArray(rider)) {
        throw new ConfigError(`"${at}" must be an object`);
      }
      if (typeof rider.pattern !== "string" || rider.pattern.length === 0) {
        throw new ConfigError(`"${at}.pattern" must be a non-empty string`);
      }
      if (typeof rider.fallback !== "string" || rider.fallback.length === 0) {
        throw new ConfigError(`"${at}.fallback" must be a non-empty string`);
      }
      if (!laneNames.has(rider.fallback)) {
        throw new ConfigError(
          `"${at}.fallback" ("${rider.fallback}") must name a declared lane ` +
            `(one of: ${[...laneNames].join(", ")})`,
        );
      }
    });
  }
}

// The release levels a changeset may declare, in widening order. patch is the
// floor; anything past the configured freeLevel is an escalation.
const BUMP_LEVELS = ["patch", "minor", "major"];

// Validate the bumpScope section: the release-scope gate. `freeLevel` (default
// "patch") is the bump any change may take unsupervised; wider levels are the
// maintainer's call and get flagged. `labels` (optional) maps a level to the PR
// label the bot stamps, so the escalation shows in the GitHub UI, not just logs.
function assertBumpScope(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new ConfigError(`"bumpScope" must be an object`);
  }
  if ("freeLevel" in value && !BUMP_LEVELS.includes(value.freeLevel)) {
    throw new ConfigError(`"bumpScope.freeLevel" must be one of [${BUMP_LEVELS.join(", ")}]`);
  }
  if ("labels" in value) {
    if (typeof value.labels !== "object" || value.labels == null || Array.isArray(value.labels)) {
      throw new ConfigError(`"bumpScope.labels" must be an object`);
    }
  }
}

// Validate the licensePolicy section: the license-scope gate. Every khai
// package carries NonCommercial content (the architecture concepts), so its
// package.json must declare an allowed license (`packageLicenses`); skills ship
// as content, so each SKILL.md must declare a NonCommercial license
// (`skillLicenses`). `packages` and `skills` are the path globs the CLI scans.
// A malformed policy is a config error (throw) rather than a silent hole that
// would let a bare permissive license through and the concepts walk free.
function assertLicensePolicy(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new ConfigError(`"licensePolicy" must be an object`);
  }
  if ("packages" in value) assertGlobList(value.packages, "licensePolicy.packages");
  if ("skills" in value) assertGlobList(value.skills, "licensePolicy.skills");
  if ("packageLicenses" in value)
    assertStringList(value.packageLicenses, "licensePolicy.packageLicenses");
  if ("skillLicenses" in value)
    assertStringList(value.skillLicenses, "licensePolicy.skillLicenses");
}

// Validate the lockfilePolicy section: the lockfile-scope gate. In an
// npm-workspaces monorepo the ROOT package-lock.json is the only authoritative
// lock; a lockfile committed inside a workspace (a leftover `npm install` in a
// package dir) desyncs Dependabot and CI — a stale nested lock is what filed a
// phantom advisory and opened a downgrade PR. `lockfiles` is the set of lock
// filenames to police (default just package-lock.json) and may not be empty —
// an empty list would leave the gate always-green while claiming to scan;
// `allowRoot` (default true) keeps the one authoritative root lock legal
// (`rootLockfile`, default package-lock.json) while flagging every nested one.
// A malformed policy is a config error rather than a silent hole.
function assertLockfilePolicy(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new ConfigError(`"lockfilePolicy" must be an object`);
  }
  if ("lockfiles" in value) {
    assertStringList(value.lockfiles, "lockfilePolicy.lockfiles");
    if (value.lockfiles.length === 0) {
      throw new ConfigError(
        `"lockfilePolicy.lockfiles" must not be empty (a no-op gate is a hole)`,
      );
    }
  }
  if ("allowRoot" in value && typeof value.allowRoot !== "boolean") {
    throw new ConfigError(`"lockfilePolicy.allowRoot" must be a boolean`);
  }
  if ("rootLockfile" in value) {
    if (typeof value.rootLockfile !== "string" || value.rootLockfile.length === 0) {
      throw new ConfigError(`"lockfilePolicy.rootLockfile" must be a non-empty string`);
    }
  }
}

// Validate the changesetPolicy section: the changeset-presence gate. A khai
// plays house versions by play count, so a PR that ADDS a new play needs no
// changeset (the build moves the minor); every other shipped change needs one
// or it merges and publishes nothing. `countDrivenAdd` (optional) is the glob
// list whose ADDITION marks a PR as count-driven (e.g. plays/*/play_*.md); with
// none configured, every PR requires a changeset (the monorepo rule). A
// malformed policy is a config error rather than a silent hole.
function assertChangesetPolicy(value) {
  if (typeof value !== "object" || value == null || Array.isArray(value)) {
    throw new ConfigError(`"changesetPolicy" must be an object`);
  }
  if ("countDrivenAdd" in value)
    assertGlobList(value.countDrivenAdd, "changesetPolicy.countDrivenAdd");
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
  if ("bumpScope" in fileConfig) assertBumpScope(fileConfig.bumpScope);
  if ("licensePolicy" in fileConfig) assertLicensePolicy(fileConfig.licensePolicy);
  if ("lockfilePolicy" in fileConfig) assertLockfilePolicy(fileConfig.lockfilePolicy);
  if ("changesetPolicy" in fileConfig) assertChangesetPolicy(fileConfig.changesetPolicy);
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
 * Parse `git diff --name-status` output into changed paths, honoring the
 * rename/copy exemption: R100/C100 are pure moves (no content change) and are
 * dropped; a rename-with-edit is judged by its destination path.
 *
 * Accepts either a raw NUL-delimited string from `git diff --name-status -z`
 * (the production path: `-z` emits every path verbatim, so a path containing a
 * tab, a quote, or a non-ASCII byte is never C-quoted or split apart the way
 * the default tab/newline format would mangle it — a mangled path matches no
 * lane or bucket and would silently pass a gate it should fail), or an array
 * of legacy tab-delimited "<status>\t<path>[\t<dst>]" lines. Both normalize to
 * one flat <status>, <path>, … token stream.
 * @param {string|string[]} input
 * @returns {string[]}
 */
export function parseNameStatus(input, { exemptRenames = true } = {}) {
  // `-z` records are NUL-separated (status\0path\0, or status\0src\0dst\0 for a
  // rename); the legacy line form is tab-separated within each line. Either way
  // we want a single flat token stream of [status, path, status, path, …].
  const tokens = Array.isArray(input)
    ? input.flatMap((line) => line.replace(/\r?\n$/, "").split("\t"))
    : String(input).split("\0");

  const out = [];
  for (let i = 0; i < tokens.length;) {
    const status = tokens[i++];
    if (!status || !status.trim()) continue; // blank line / trailing terminator
    if (/^[RC]/.test(status)) {
      // Rename/copy: <status> <src> <dst>; judge by the destination.
      i++; // skip <src>
      const dst = tokens[i++];
      if (exemptRenames && (status === "R100" || status === "C100")) continue;
      if (dst) out.push(dst);
    } else {
      // M, A, D, T, … : <status> <path>.
      const path = tokens[i++];
      if (path) out.push(path);
    }
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
  for (const candidate of branchNameCandidates(branchName)) {
    for (const lane of lanes) {
      const captured = matchLanePattern(lane.pattern, candidate);
      if (!captured) continue;
      const unit = "unit" in lane ? (captured[lane.unit] ?? null) : null;
      return { lane: lane.pattern.split("/")[0], layer: lane.layer, unit };
    }
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
  for (const candidate of branchNameCandidates(branchName)) {
    for (const lane of lanes) {
      const captured = matchLanePattern(lane.pattern, candidate);
      if (captured) {
        const unit = "unit" in lane ? (captured[lane.unit] ?? null) : null;
        return { lane, captured, unit };
      }
    }
  }
  return null;
}

/**
 * Produce branch-name candidates for lane matching.
 * For Copilot branches we also try the name with `copilot/` removed so
 * `copilot/<lane>/...` is treated as `<lane>/...`.
 */
function branchNameCandidates(branchName) {
  if (typeof branchName !== "string" || branchName.length === 0) return [];
  return branchName.startsWith("copilot/")
    ? [branchName, branchName.slice("copilot/".length)]
    : [branchName];
}

// Synthetic topic suffix used only to shape an owner lane string into a
// branch-pattern candidate when inferring compact legacy Copilot names.
const COMPACT_BRANCH_SYNTHETIC_TOPIC = "legacy";

/**
 * Infer lane for compact Copilot branches like `copilot/<text-without-slash>`
 * (e.g. `copilot/add-feature`) by attributing changed paths.
 * Full prefixed-lane names like `copilot/governance/fix-x` are not compact.
 * Returns null unless exactly one owner lane claims the change.
 */
function inferCompactCopilotLane(branchName, changedPaths, config) {
  if (typeof branchName !== "string" || !branchName.startsWith("copilot/")) return null;
  const stripped = branchName.slice("copilot/".length);
  if (stripped.includes("/")) return null;
  const owners = new Set();
  for (const p of changedPaths) {
    const owner = laneForPath(p, config);
    if (owner) owners.add(owner);
  }
  if (owners.size !== 1) return null;
  const owner = owners.values().next().value;
  const segs = owner.split("/");
  if (segs.length === 0) return null;
  const synthetic =
    segs.length > 1
      ? `${segs[0]}/${segs[1]}/${COMPACT_BRANCH_SYNTHETIC_TOPIC}`
      : `${segs[0]}/${COMPACT_BRANCH_SYNTHETIC_TOPIC}`;
  return findLane(synthetic, config);
}

// Recover the {name} a fan-out lane binds for a path. A lane may list several
// {name} globs (one per page group, say); each is compiled to an anchored regex
// with {name} as a single-segment capture and tried against the path. Correct
// regardless of what precedes {name} -- a literal prefix, a `**`, or a distinct
// group prefix -- which the old literal-prefix slice was not. Returns the bound
// name (the first glob that shapes this path) or null. Use literal prefixes
// before {name} to keep the segment unambiguous; a `**` before {name} captures
// greedily and is discouraged (see docs/BRANCHING.md).
function bindName(allow, path) {
  for (const glob of allow) {
    if (!glob.includes("{name}")) continue;
    let src = "^";
    for (let i = 0; i < glob.length;) {
      if (glob.startsWith("{name}", i)) {
        src += "([^/]+)";
        i += "{name}".length;
      } else if (glob.startsWith("**", i)) {
        src += ".*";
        i += 2;
      } else if (glob[i] === "*") {
        src += "[^/]*";
        i += 1;
      } else {
        src += glob[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        i += 1;
      }
    }
    const m = path.match(new RegExp(src + "$"));
    if (m) return m[1];
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
      // Derive the would-be name from the path. A {name} glob (e.g.
      // packages/engines/{name}/** or src/pages/main/{name}/**) binds {name} to
      // one path segment; recover it by MATCHING the glob, not by slicing a
      // literal prefix. The slice broke whenever anything globby preceded
      // {name} (a `**`, or a different prefix per page group) -- it sliced at
      // the prefix's character length and landed on the wrong segment, so the
      // path came back unowned. bindName compiles each {name} glob to a regex
      // with {name} as a single-segment capture, so extraction is correct after
      // a literal prefix, a `**`, or across several group-specific globs.
      unit = bindName(lane.allow, path);
    }
    const globs = resolveAllow(lane, unit);
    if (picomatch(globs, { dot: true })(path)) {
      const laneName = lane.pattern.split("/")[0];
      return unit == null ? laneName : `${laneName}/${unit}`;
    }
  }
  return null;
}

// Compile branchScope.riders into a matcher: `isRider(path)` tells whether a
// path is a rider (rides any lane), and `fallbackFor(path)` returns the lane it
// homes to when it rides alone. A rider takes precedence over ownership for the
// paths it covers, so an order under a governance-owned tree still rides the
// lane of the change it accompanies rather than being locked to governance.
function riderMatcher(config) {
  const riders = config.branchScope?.riders ?? [];
  if (riders.length === 0) return { isRider: () => false, fallbackFor: () => null };
  // One matcher over all rider patterns (the same idiom as `shared`/`allow`), so
  // the hot path is a single compiled glob; `fallbackFor` walks the riders to
  // recover which one a path belongs to, matching each glob inline exactly as
  // laneForPath does. The globs come from config, never from the path under test.
  const isRider = picomatch(
    riders.map((r) => r.pattern),
    { dot: true },
  );
  return {
    isRider,
    fallbackFor: (p) =>
      riders.find((r) => picomatch(r.pattern, { dot: true })(p))?.fallback ?? null,
  };
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
 * protected lane such as arch/ may touch nothing but what it owns). Exception:
 * a lane may also touch paths that match its own explicit `allow` list, even if
 * those paths are owned by another protected lane — this is a targeted cross-lane
 * pass used by automation lanes (e.g. dependabot/*) whose scope is defined by
 * file shape (manifests, workflows), not by ownership. Out-of-lane paths produce
 * a prescriptive message; when offenders are owned by more than one distinct lane
 * the report ends with SPLIT REQUIRED, since a multi-lane change must be split
 * into per-lane branches that merge in layer order.
 */
export function checkBranchScope(branchName, changedPaths, config = DEFAULT_CONFIG) {
  const matched =
    findLane(branchName, config) ?? inferCompactCopilotLane(branchName, changedPaths, config);
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

  // Riders (e.g. management/orders/**) ride the lane of the change they
  // accompany, so like shared metadata they are never an offender on any lane.
  // Their home-when-alone is advise()'s concern; the checker only needs to wave
  // them through here.
  const { isRider } = riderMatcher(config);

  // A lane's own explicit allow list grants a cross-lane pass: if a path
  // matches the current lane's allow globs it is permitted regardless of which
  // protected lane owns it. This lets automation lanes (e.g. dependabot/*)
  // define their scope by file shape rather than by ownership hierarchy.
  const myGlobs = resolveAllow(lane, unit);
  const isAllowedByLane = myGlobs.length > 0 ? picomatch(myGlobs, { dot: true }) : () => false;

  const wanted = new Set();
  const violations = [];
  for (const p of changedPaths) {
    if (isShared(p)) continue;
    if (isRider(p)) continue; // riders ride any lane (home only when alone — advise's job)
    if (isAllowedByLane(p)) continue; // cross-lane pass: lane's own allow overrides ownership
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
  // Shared metadata (e.g. .changeset/**) belongs on any lane by design, so the
  // enforcer (checkBranchScope) waves it through. advise must do the same: it is
  // not "unowned" and must not be reported as needing a branchScope extension.
  const sharedGlobs = config.branchScope?.shared ?? [];
  const isShared = sharedGlobs.length > 0 ? picomatch(sharedGlobs, { dot: true }) : () => false;
  const { isRider, fallbackFor } = riderMatcher(config);
  const byKey = new Map();
  const unowned = [];
  const riderFiles = []; // { path, fallback } — held aside; attached below

  for (const path of files) {
    if (isShared(path)) continue;
    if (isRider(path)) {
      riderFiles.push({ path, fallback: fallbackFor(path) });
      continue;
    }
    const owner = laneForPath(path, config);
    if (owner == null) {
      unowned.push(path);
      continue;
    }
    if (!byKey.has(owner)) byKey.set(owner, []);
    byKey.get(owner).push(path);
  }

  // A rider rides the lane of the change it accompanies; alone, it homes to its
  // fallback. So when NOTHING is owned, fold each rider into its fallback lane —
  // that becomes the advised home, no split. When an owned lane exists, riders
  // are attached to it below (after sorting) and never form a lane of their own.
  const ownedExisted = byKey.size > 0;
  if (!ownedExisted) {
    for (const { path, fallback } of riderFiles) {
      if (!byKey.has(fallback)) byKey.set(fallback, []);
      byKey.get(fallback).push(path);
    }
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

  // Owned lanes present: each rider rides along on the lane it accompanies —
  // its fallback lane if that lane is in play, else the first (highest) lane.
  // It is listed on that branch but never forms a lane of its own, so a rider
  // can never turn a single-lane change into a split.
  if (ownedExisted && riderFiles.length > 0) {
    for (const { path, fallback } of riderFiles) {
      const target = lanes.find((l) => l.lane === fallback) ?? lanes[0];
      target.files.push(path);
    }
  }

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

// --- bump scope: flag a non-patch release loudly --------------------------
// Changesets declare a release level per package in their frontmatter:
//
//   ---
//   "@scope/pkg": minor
//   ---
//
// patch is the free, default level: any change may take it. minor and major
// widen the published contract (new API, a break) and are the maintainer's
// call. We can't HARD-lock that from here (the bot runs with the maintainer's
// own credentials), so the teeth are LOUDNESS: every non-patch bump is
// detected, named, and flagged, so escalation can never ship silently.

// Parse a changeset's frontmatter into [{ package, level }]. The leading ---
// block lists `"name": level` lines; the body after the closing --- is the
// human summary and is ignored.
export function parseChangeset(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return [];
  const out = [];
  for (const line of m[1].split(/\r?\n/)) {
    const lm = /^\s*["']?(@?[\w./-]+)["']?\s*:\s*([A-Za-z]+)\s*$/.exec(line);
    if (lm) out.push({ package: lm[1], level: lm[2].toLowerCase() });
  }
  return out;
}

// Given parsed changesets [{ file, entries }], return the bumps that exceed the
// free level and the highest level present (major > minor > null). `ok` is true
// when nothing exceeds the free level.
export function bumpScope(changesets, config = DEFAULT_CONFIG) {
  const free = config.bumpScope?.freeLevel ?? "patch";
  const freeRank = BUMP_LEVELS.indexOf(free);
  const escalations = [];
  let highestRank = -1;
  for (const { file, entries } of changesets) {
    for (const { package: pkg, level } of entries) {
      const rank = BUMP_LEVELS.indexOf(level);
      if (rank > freeRank) {
        escalations.push({ file, package: pkg, level });
        if (rank > highestRank) highestRank = rank;
      }
    }
  }
  return {
    ok: escalations.length === 0,
    escalations,
    highest: highestRank >= 0 ? BUMP_LEVELS[highestRank] : null,
  };
}

/**
 * Parse `git diff --name-status` output into {status, path} records, keeping the
 * status letter parseNameStatus drops. A rename/copy is judged by its
 * destination and reported as the destination's effective status (the dst is
 * "added" relative to the lane it lands in). Mirrors parseNameStatus's tolerance
 * of both the `-z` NUL stream and the legacy tab-delimited line form.
 * @param {string|string[]} input
 * @returns {{status: string, path: string}[]}
 */
export function parseChanges(input) {
  const tokens = Array.isArray(input)
    ? input.flatMap((line) => line.replace(/\r?\n$/, "").split("\t"))
    : String(input).split("\0");
  const out = [];
  for (let i = 0; i < tokens.length;) {
    const status = tokens[i++];
    if (!status || !status.trim()) continue;
    if (/^[RC]/.test(status)) {
      i++; // skip <src>
      const dst = tokens[i++];
      // A rename into a path is, for ownership, an addition of that path.
      if (dst) out.push({ status: "A", path: dst });
    } else {
      const path = tokens[i++];
      if (path) out.push({ status: status[0], path });
    }
  }
  return out;
}

/**
 * The changeset-presence gate. A khai plays house versions by play count, and
 * every deploy is steered through the changesets "Version Packages" PR — so a
 * PR that ADDS a new play must carry a `minor` changeset. The count moves the
 * minor and the version reconcile (`registry build`, run in the Version PR)
 * resets the patch to 0; because a `minor` bump lands off the count, the
 * reconcile clamps it back to `0.<count>.0`. A `patch` (or empty) changeset on
 * a content add would instead survive the reconcile (count === minor after the
 * count build bakes it) and drift the version to `0.<count>.1` — so it is
 * rejected here. Every OTHER shipped change (a content edit, a governance or
 * tooling change) needs a changeset, real or empty, or it merges green and
 * publishes nothing. Pure: it takes the parsed diff records
 * [{status, path}] and the parsed changesets [{file, entries}], and returns
 * findings; the git/file IO lives in the CLI.
 *
 * With no `changesetPolicy.countDrivenAdd` configured, nothing is count-driven
 * and every PR requires a changeset (the monorepo's "every PR needs a
 * changeset" rule). `ok` is true when there are no violations.
 *
 * `shipped` is the package's published path set (its `files`, normalized) — when
 * given, a releasing changeset on a PR that changes nothing shipped is flagged:
 * that release republishes identical content and drifts the version (the
 * spurious `0.<count>.1` patch). Empty/omitted -> the rule is off (shipped set
 * unknown). The git/file IO that reads `files` lives in the CLI.
 * @param {{changed?: {status:string,path:string}[], changesets?: {file:string,entries:unknown[]}[], shipped?: string[], config?: typeof DEFAULT_CONFIG}} args
 */
export function changesetCheck({
  changed = [],
  changesets = [],
  shipped = [],
  config = DEFAULT_CONFIG,
} = {}) {
  const globs = config.changesetPolicy?.countDrivenAdd ?? [];
  const isCountDrivenAdd = globs.length > 0 ? picomatch(globs, { dot: true }) : () => false;
  const countDrivenAdds = changed
    .filter((c) => c.status === "A" && isCountDrivenAdd(c.path))
    .map((c) => c.path);
  const addsCountDriven = countDrivenAdds.length > 0;
  const hasChangeset = changesets.length > 0;
  const levels = changesets.flatMap((c) =>
    (Array.isArray(c.entries) ? c.entries : []).map((e) => e.level),
  );

  const violations = [];
  if (addsCountDriven) {
    // A content add moves the count. The Version PR is the deploy gate, so the
    // add must carry a `minor` changeset: `changeset version` bumps the minor,
    // and the reconcile clamps it back to `0.<count>.0` (patch reset). A `patch`
    // or empty changeset survives the reconcile (count === minor after the count
    // build) and drifts to `0.<count>.1` — the accidental double-count. Require
    // minor; a stray patch alongside it is harmless (changesets takes the max).
    if (levels.includes("major")) {
      violations.push(
        `this PR adds new content (${countDrivenAdds.join(", ")}) but carries a \`major\` changeset. ` +
          `A house stays 0.x (the numbering guard rejects a non-zero major); use \`minor\`.`,
      );
    } else if (!levels.includes("minor")) {
      violations.push(
        `this PR adds new content (${countDrivenAdds.join(", ")}) but carries ` +
          `${levels.length ? `only a \`${levels.join("`, `")}\` changeset` : "no changeset"}. ` +
          `A content add must carry a \`minor\` changeset: the count moves the minor and the version ` +
          `reconcile resets the patch to 0. A \`patch\` here drifts to \`0.<count>.1\`. ` +
          `Run \`npx changeset add\` and choose minor.`,
      );
    }
  } else if (!hasChangeset) {
    violations.push(
      `no changeset found, and this PR adds no new content. A change that is not a content add must ship a ` +
        `changeset, or it merges and publishes nothing. Run \`npx changeset add\` (or ` +
        `\`npx changeset add --empty\` for tooling/docs that ship no package content).`,
    );
  }
  // A releasing changeset (one that declares a bump) republishes the package. If
  // the PR changes nothing under the package `files`, that release ships content
  // identical to the last and drifts the version — the spurious `0.<count>.1`
  // patch a REFERENCES/docs/tooling PR cuts when it carries a `patch` changeset
  // instead of an `--empty` one. Only checked when the shipped set is known.
  const releasing = changesets.some((c) => Array.isArray(c.entries) && c.entries.length > 0);
  if (shipped.length > 0 && releasing) {
    const isShipped = picomatch(shipped, { dot: true });
    if (!changed.some((c) => isShipped(c.path))) {
      violations.push(
        `this PR changes no shipped package content (nothing under the package \`files\`) but ` +
          `carries a releasing changeset; that release would republish identical content and drift ` +
          `the version. Use an empty changeset instead: \`npx changeset add --empty\`.`,
      );
    }
  }
  return { ok: violations.length === 0, violations, addsCountDriven, hasChangeset };
}

// The license-scope gate. khai's concepts are NonCommercial: every package
// carries that content, so its declared license must be in `packageLicenses`
// (the dual-license string — content under LICENSE = CC-BY-NC-SA, code under
// LICENSE-CODE = MIT — not a bare permissive license that would let someone
// resell the concepts). A skill ships as content, so its SKILL.md license must
// be a NonCommercial variant in `skillLicenses`. Pure: it takes the gathered
// declarations [{ path, license }] and returns findings; the file IO that reads
// package.json + SKILL.md frontmatter lives in the CLI. `ok` is true when every
// declaration is allowed; with no licensePolicy configured there is nothing to
// check and `ok` is true.
export function checkLicenses({ packages = [], skills = [] } = {}, config = DEFAULT_CONFIG) {
  const policy = config.licensePolicy;
  const errors = [];
  if (!policy) return { ok: true, errors };
  const pkgAllow = policy.packageLicenses ?? [];
  const skillAllow = policy.skillLicenses ?? [];
  for (const { path, license } of packages) {
    if (!pkgAllow.includes(license))
      errors.push(
        `${path}: license ${license == null ? "(missing)" : `"${license}"`} is not allowed — ` +
          `declare one of [${pkgAllow.join(", ")}] so the package's khai content stays NonCommercial`,
      );
  }
  for (const { path, license } of skills) {
    if (!skillAllow.includes(license))
      errors.push(
        `${path}: skill license ${license == null ? "(missing)" : `"${license}"`} must be ` +
          `NonCommercial — use one of [${skillAllow.join(", ")}]`,
      );
  }
  return { ok: errors.length === 0, errors };
}

// checkLockfiles: the lockfile-scope gate. This is an npm-workspaces monorepo,
// so the ROOT package-lock.json is the single authoritative lock; a lockfile
// committed inside a package is a fossil that desyncs Dependabot and CI (a stale
// nested lock pinned an old dependency, producing a phantom advisory and a
// downgrade PR). Pure: it takes the tracked paths and returns every lockfile
// that is not the authoritative root lock; the git IO that lists the tree lives
// in the CLI. A path is "at root" when it has no directory prefix, and allowRoot
// exempts only `rootLockfile` (default package-lock.json) there — a root
// npm-shrinkwrap.json would shadow the root lock (npm prefers it), so any other
// policed name is an offender even at root. With no lockfilePolicy configured
// there is nothing to police and `ok` is true.
export function checkLockfiles(paths = [], config = DEFAULT_CONFIG) {
  const policy = config.lockfilePolicy;
  if (!policy) return { ok: true, offenders: [] };
  const names = policy.lockfiles ?? ["package-lock.json"];
  const allowRoot = policy.allowRoot !== false;
  const rootLockfile = policy.rootLockfile ?? "package-lock.json";
  const offenders = [];
  for (const p of paths) {
    // Normalize a leading "./" so "./package-lock.json" reads as root, not a
    // one-segment "." prefix.
    const norm = String(p).replace(/^\.?\/+/, "");
    const segments = norm.split("/");
    const base = segments[segments.length - 1];
    if (!names.includes(base)) continue;
    const atRoot = segments.length === 1;
    if (atRoot && allowRoot && base === rootLockfile) continue;
    offenders.push(norm);
  }
  return { ok: offenders.length === 0, offenders };
}
