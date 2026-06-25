// khai-skills guard — the two-tier conformance gate, in pure Node (no Python,
// no skills-ref install, no network). It "sits on top of" the agentskills.io
// open standard:
//
//   Tier 1 — STANDARD conformance: a faithful mirror of the agentskills.io
//            SKILL.md rules (frontmatter fields + constraints, name rules,
//            reference depth, body budget). The pin (standards/agentskills.pin.json)
//            records the validator version + spec hash this mirror was written
//            against; `checkDrift` watches the real upstream so a move surfaces.
//
//   Tier 2 — khai POLICY on top: vendor-neutrality (a skill must name a role,
//            not a product, so it ports to any model) and provenance (canon
//            material embedded in a bundle must equal its khai-arch source).
//
// All exports are pure: strings in, findings out. File and network IO live in
// build.mjs and the CLI. Findings split into `errors` (block) and `warnings`
// (advisory, the standard's "recommended" rules).

import { createHash } from "node:crypto";
import * as yaml from "js-yaml";

export const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

// Frontmatter read/write on js-yaml 5.x — the merge-key quadratic-DoS in
// gray-matter's bundled js-yaml 3.x (GHSA-h67p-54hq-rp68) is closed here. Shared
// with build.mjs so the package carries one YAML surface, not two.
// parseFrontmatter throws on a malformed block (callers catch it); stringifyFrontmatter
// is deterministic (insertion order kept, no reflow) so a stamped SKILL.md hashes stably.
export function parseFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { data: {}, content: str };
  const loaded = yaml.load(m[1]);
  return {
    data: loaded && typeof loaded === "object" ? loaded : {},
    content: str.slice(m[0].length),
  };
}

export function stringifyFrontmatter(content, data = {}) {
  return `---\n${yaml.dump(data ?? {}, { lineWidth: -1 })}---\n${content}`;
}

// ---------------------------------------------------------------------------
// Tier 1 — agentskills.io standard conformance (mirror of specification.mdx)
// ---------------------------------------------------------------------------

export const STANDARD_FRONTMATTER = {
  required: ["name", "description"],
  optional: ["license", "compatibility", "metadata", "allowed-tools"],
};

// name: 1-64, lowercase alnum + hyphens, no leading/trailing/double hyphen.
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateName(name, dirName) {
  const errors = [];
  if (typeof name !== "string" || name.length === 0) return ["name: required, non-empty"];
  if (name.length > 64) errors.push("name: max 64 characters");
  if (!NAME_RE.test(name))
    errors.push(
      "name: lowercase letters, numbers and single hyphens only; no leading, trailing, or consecutive hyphens",
    );
  if (dirName != null && name !== dirName)
    errors.push(
      `name: must match the parent directory name (expected "${dirName}", got "${name}")`,
    );
  return errors;
}

export function validateDescription(description) {
  if (typeof description !== "string" || description.trim().length === 0)
    return ["description: required, non-empty"];
  if (description.length > 1024) return ["description: max 1024 characters"];
  return [];
}

export function validateFrontmatter(data, dirName) {
  const errors = [];
  errors.push(...validateName(data.name, dirName));
  errors.push(...validateDescription(data.description));

  const allowed = new Set([...STANDARD_FRONTMATTER.required, ...STANDARD_FRONTMATTER.optional]);
  for (const key of Object.keys(data))
    if (!allowed.has(key))
      errors.push(`frontmatter: unknown key "${key}" (not in the agentskills spec)`);

  if ("compatibility" in data) {
    const c = data.compatibility;
    if (typeof c !== "string" || c.length < 1 || c.length > 500)
      errors.push("compatibility: 1-500 characters if present");
  }
  if ("metadata" in data) {
    const m = data.metadata;
    const ok =
      m &&
      typeof m === "object" &&
      !Array.isArray(m) &&
      Object.values(m).every((v) => typeof v === "string");
    if (!ok) errors.push("metadata: must be a map of string keys to string values");
  }
  if ("allowed-tools" in data && typeof data["allowed-tools"] !== "string")
    errors.push("allowed-tools: must be a space-separated string");

  return errors;
}

/** Relative, in-bundle link targets from markdown (skips http(s), anchors, mailto). */
export function localLinks(md) {
  const out = [];
  // [^()]+ (not [^)]+) so a run of "(" fails fast instead of backtracking
  // O(n) per "](" start — kills the polynomial-ReDoS (js/polynomial-redos).
  // Link targets carry no parens, so matches are unchanged.
  const re = /\]\(([^()]+)\)/g;
  let m;
  while ((m = re.exec(md))) {
    const target = m[1].trim().split(/\s+/)[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue;
    out.push(target.replace(/^\.\//, ""));
  }
  return out;
}

/**
 * Validate one SKILL.md's text against the standard.
 * @returns {{ errors: string[], warnings: string[], data: object }}
 */
export function validateSkillMd(text, { dirName } = {}) {
  let parsed;
  try {
    parsed = parseFrontmatter(text);
  } catch (e) {
    return {
      errors: [`SKILL.md: cannot parse YAML frontmatter (${e.message})`],
      warnings: [],
      data: {},
    };
  }
  const errors = validateFrontmatter(parsed.data, dirName);
  const warnings = [];

  if (!parsed.content || parsed.content.trim().length === 0) errors.push("SKILL.md: body is empty");

  const lines = text.split("\n").length;
  if (lines > 500) warnings.push(`SKILL.md: ${lines} lines (standard recommends under 500)`);

  for (const target of localLinks(parsed.content))
    if (target.split("/").length > 2)
      warnings.push(
        `reference "${target}" is more than one level deep (keep references one level from SKILL.md)`,
      );

  return { errors, warnings, data: parsed.data };
}

// ---------------------------------------------------------------------------
// Tier 2 — khai policy: vendor neutrality (stricter than the standard, on purpose)
// ---------------------------------------------------------------------------
//
// The agentskills standard PERMITS naming a product (e.g. in `compatibility`).
// khai forbids it in its own skills: a neutral skill ports to any model, which
// is the whole reason these skills exist (offload to a cheap, non-code-aware
// model). Name a role ("the author", "the executor"), never a runtime.

export const VENDOR_DENYLIST = [
  /claude\.ai/i,
  /\bclaude code\b/i,
  /\bcopilot\b/i,
  /\bchatgpt\b/i,
  /\bopenai\b/i,
  /\bgemini\b/i,
  /\bperplexity\b/i,
  /google drive/i,
];

// House writing rule: em-dashes and en-dashes are banned repo-wide. Consumer
// surfaces render skill prose verbatim, so a dash that slips past here becomes
// a brand violation wherever the skill is surfaced.
export const STYLE_DENYLIST = [
  { re: /—/, label: "em-dash (—)" },
  { re: /–/, label: "en-dash (–)" },
];

export function validateNeutrality(text, { label = "content" } = {}) {
  const errors = [];
  for (const re of VENDOR_DENYLIST) {
    const hit = text.match(re);
    if (hit)
      errors.push(
        `${label}: vendor/runtime reference "${hit[0]}" — khai skills must be LLM-agnostic; name a role, not a product`,
      );
  }
  for (const { re, label: charLabel } of STYLE_DENYLIST) {
    if (re.test(text))
      errors.push(`${label}: ${charLabel} is banned; use parentheses, a colon, or a plain hyphen`);
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Tier 2 — khai policy: provenance (no drift from canon)
// ---------------------------------------------------------------------------

/**
 * Each injected file's text must equal the khai-arch source it was built from.
 * @param {{ path: string, actual: string, expected: string }[]} injected
 */
export function validateProvenance(injected) {
  const errors = [];
  for (const f of injected)
    if (sha256(f.actual) !== sha256(f.expected))
      errors.push(
        `provenance: ${f.path} does not match its khai-arch source (drifted or hand-edited; rebuild from canon)`,
      );
  return errors;
}

// ---------------------------------------------------------------------------
// Outward — the move order: is the pin still current with the real source?
// ---------------------------------------------------------------------------

/**
 * Compare the pin to what was fetched from upstream. Pure: the fetch happens in
 * the CLI. Either signal differing raises an advisory move order (never blocks).
 * @param {object} pin     parsed agentskills.pin.json
 * @param {{ validatorVersion?: string, specSha256?: string }} fetched
 */
export function checkDrift(pin, fetched) {
  const notices = [];
  // undefined = not fetched (offline), skip. "" = fetched but unreadable, which
  // must surface rather than read as "still current". A non-empty differing
  // version is a real move.
  if (fetched.validatorVersion !== undefined) {
    if (!fetched.validatorVersion)
      notices.push(
        "validator version unreadable from PyPI (info.version missing); cannot confirm pin",
      );
    else if (fetched.validatorVersion !== pin.validator.version)
      notices.push(
        `validator skills-ref moved ${pin.validator.version} -> ${fetched.validatorVersion}`,
      );
  }
  if (fetched.specSha256 && fetched.specSha256 !== pin.spec.sha256)
    notices.push("spec specification.mdx changed (content hash differs from pin)");
  return { moved: notices.length > 0, notices };
}
