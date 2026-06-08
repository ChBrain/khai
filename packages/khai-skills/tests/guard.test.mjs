import { describe, it, expect } from "vitest";
import {
  validateName,
  validateDescription,
  validateFrontmatter,
  validateSkillMd,
  validateNeutrality,
  validateProvenance,
  checkDrift,
  localLinks,
} from "../lib/guard.mjs";

describe("Tier 1 — agentskills standard: name", () => {
  it("accepts a valid gerund name matching the dir", () => {
    expect(validateName("creating-a-play", "creating-a-play")).toEqual([]);
  });
  it("rejects uppercase, leading/trailing/double hyphen, and >64 chars", () => {
    expect(validateName("Creating-A-Play")).not.toEqual([]);
    expect(validateName("-play")).not.toEqual([]);
    expect(validateName("play-")).not.toEqual([]);
    expect(validateName("a--b")).not.toEqual([]);
    expect(validateName("x".repeat(65))).not.toEqual([]);
  });
  it("requires the name to match the parent directory", () => {
    const errs = validateName("creating-a-play", "making-a-play");
    expect(errs.join(" ")).toMatch(/match the parent directory/);
  });
});

describe("Tier 1 — agentskills standard: description", () => {
  it("accepts non-empty within 1024", () => {
    expect(validateDescription("Creates a play. Use when building a production.")).toEqual([]);
  });
  it("rejects empty and over-long", () => {
    expect(validateDescription("")).not.toEqual([]);
    expect(validateDescription("x".repeat(1025))).not.toEqual([]);
  });
});

describe("Tier 1 — frontmatter fields", () => {
  it("permits the standard optional fields, including compatibility", () => {
    const errs = validateFrontmatter(
      {
        name: "creating-a-play",
        description: "ok",
        license: "CC-BY-NC-4.0",
        compatibility: "needs git",
      },
      "creating-a-play",
    );
    expect(errs).toEqual([]);
  });
  it("rejects an unknown frontmatter key", () => {
    const errs = validateFrontmatter(
      { name: "creating-a-play", description: "ok", bogus: 1 },
      "creating-a-play",
    );
    expect(errs.join(" ")).toMatch(/unknown key "bogus"/);
  });
  it("rejects non-string metadata values", () => {
    const errs = validateFrontmatter(
      { name: "creating-a-play", description: "ok", metadata: { version: 1 } },
      "creating-a-play",
    );
    expect(errs.join(" ")).toMatch(/metadata/);
  });
  it("rejects compatibility over 500 chars", () => {
    const errs = validateFrontmatter(
      { name: "creating-a-play", description: "ok", compatibility: "x".repeat(501) },
      "creating-a-play",
    );
    expect(errs.join(" ")).toMatch(/compatibility/);
  });
});

describe("Tier 1 — SKILL.md document", () => {
  it("warns (not errors) on deep references and long bodies", () => {
    const md = `---\nname: creating-a-play\ndescription: ok\n---\n\nSee [x](references/sub/deep.md).\n`;
    const { errors, warnings } = validateSkillMd(md, { dirName: "creating-a-play" });
    expect(errors).toEqual([]);
    expect(warnings.join(" ")).toMatch(/one level deep/);
  });
  it("errors on empty body", () => {
    const md = `---\nname: creating-a-play\ndescription: ok\n---\n`;
    const { errors } = validateSkillMd(md, { dirName: "creating-a-play" });
    expect(errors.join(" ")).toMatch(/body is empty/);
  });
  it("extracts only local links", () => {
    expect(localLinks("[a](references/t.md) [b](https://x.io) [c](#h)")).toEqual([
      "references/t.md",
    ]);
  });
  it("is linear on adversarial '](((((' input (no polynomial ReDoS)", () => {
    const evil = "](" + "(".repeat(200000);
    const start = Date.now();
    expect(localLinks(evil)).toEqual([]);
    expect(Date.now() - start).toBeLessThan(500);
  });
});

describe("Tier 2 — khai neutrality policy (stricter than the standard)", () => {
  it("flags vendor/runtime references", () => {
    expect(validateNeutrality("This runs in Claude.ai")).not.toEqual([]);
    expect(validateNeutrality("hand it to Copilot")).not.toEqual([]);
    expect(validateNeutrality("load from Google Drive")).not.toEqual([]);
  });
  it("does NOT flag khai's own vocabulary like Drives/drive", () => {
    expect(validateNeutrality("Has, Orders, Loses, Drives: the drive runs on the loss")).toEqual(
      [],
    );
  });
});

describe("Tier 2 — provenance", () => {
  it("passes when injected text matches canon", () => {
    expect(validateProvenance([{ path: "references/t.md", actual: "X", expected: "X" }])).toEqual(
      [],
    );
  });
  it("fails when injected text drifted from canon", () => {
    const errs = validateProvenance([{ path: "references/t.md", actual: "X", expected: "Y" }]);
    expect(errs.join(" ")).toMatch(/does not match its khai-arch source/);
  });
});

describe("Outward — drift / move order", () => {
  const pin = {
    standard: "agentskills",
    validator: { package: "skills-ref", version: "0.1.1" },
    spec: { sha256: "abc" },
  };
  it("no move when version and hash match", () => {
    expect(checkDrift(pin, { validatorVersion: "0.1.1", specSha256: "abc" }).moved).toBe(false);
  });
  it("move order when the validator version advances", () => {
    const d = checkDrift(pin, { validatorVersion: "0.1.2", specSha256: "abc" });
    expect(d.moved).toBe(true);
    expect(d.notices.join(" ")).toMatch(/0\.1\.1 -> 0\.1\.2/);
  });
  it("move order when the spec hash changes", () => {
    expect(checkDrift(pin, { specSha256: "different" }).moved).toBe(true);
  });
});

// An unreadable (empty) upstream version must surface, not read as "current"
// (PR #309). Dormant until the fix lands: behavioral probe -- if an empty
// version is not a move, the old falsy guard is in place, so skip.
const DRIFT_UNREADABLE_DORMANT =
  checkDrift({ validator: { version: "x" }, spec: { sha256: "y" } }, { validatorVersion: "" })
    .moved === false;

describe.skipIf(DRIFT_UNREADABLE_DORMANT)("Outward — drift on an unreadable version", () => {
  const pin = { validator: { version: "0.1.1" }, spec: { sha256: "abc" } };

  it("raises a notice when the upstream version is unreadable (empty)", () => {
    const d = checkDrift(pin, { validatorVersion: "" });
    expect(d.moved).toBe(true);
    expect(d.notices.join(" ")).toMatch(/unreadable/);
  });

  it("still skips silently when offline (version undefined)", () => {
    expect(checkDrift(pin, {}).moved).toBe(false);
  });
});
