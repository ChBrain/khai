import { describe, it, expect, afterEach } from "vitest";
import { buildAll, composeSkill, PIN } from "../lib/build.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import arch from "@chbrain/khai-arch";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("compose: khai-playwright", () => {
  const r = composeSkill(join(pkgRoot, "src", "khai-playwright"));

  it("composes with no guard errors", () => {
    expect(r.errors).toEqual([]);
  });

  it("injects the play template from canon, not a hand copy", () => {
    const tpl = r.files.find((f) => f.name === "references/template_play.md");
    expect(tpl).toBeTruthy();
    expect(tpl.data.toString("utf8")).toBe(arch.templates.play.text);
  });

  it("injects the full play+plot+element template set from canon (Mode B)", () => {
    const types = ["play", "plot", "process", "position", "piece", "place", "persona", "plan"];
    for (const t of types) {
      const tpl = r.files.find((f) => f.name === `references/template_${t}.md`);
      expect(tpl, `template_${t}.md should be injected`).toBeTruthy();
      expect(tpl.data.toString("utf8")).toBe(arch.templates[t].text);
    }
  });

  it("stamps standard + canon provenance into SKILL.md metadata", () => {
    const skill = r.files.find((f) => f.name === "SKILL.md").data.toString("utf8");
    expect(skill).toMatch(/standard: agentskills@/);
    expect(skill).toMatch(/validator: skills-ref@/);
    expect(skill).toMatch(/canon: '?@chbrain\/khai-arch@/);
  });

  it("self-contains: SKILL.md references the bundled template one level deep", () => {
    const skill = r.files.find((f) => f.name === "SKILL.md").data.toString("utf8");
    expect(skill).toMatch(/references\/template_play\.md/);
  });
});

describe("compose: khai-playwright ships the canon's check", () => {
  const r = composeSkill(join(pkgRoot, "src", "khai-playwright"));
  const archDir = dirname(fileURLToPath(import.meta.resolve("@chbrain/khai-arch/package.json")));

  it("injects scripts/check_play.mjs verbatim from the canon's checks/", () => {
    const script = r.files.find((f) => f.name === "scripts/check_play.mjs");
    expect(script).toBeTruthy();
    expect(script.data.toString("utf8")).toBe(
      readFileSync(join(archDir, "checks", "check_play.mjs"), "utf8"),
    );
    expect(r.injected.some((i) => i.path === "scripts/check_play.mjs")).toBe(true);
  });

  it("packs references/ and scripts/ side by side, and the manifest lists both", () => {
    const out = buildAll({ write: false });
    const entry = out.manifest.skills.find((s) => s.name === "khai-playwright");
    const dirs = new Set(entry.files.filter((f) => f.includes("/")).map((f) => f.split("/")[0]));
    expect([...dirs].sort()).toEqual(["references", "scripts"]);
    expect(out.ok).toBe(true);
  });

  it("the shipped script runs on node alone: the bundled template passes, a broken play fails", () => {
    const dir = mkdtempSync(join(tmpdir(), "khai-skill-script-"));
    try {
      for (const f of r.files) {
        const dest = join(dir, ...f.name.split("/"));
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, f.data);
      }
      const script = join(dir, "scripts", "check_play.mjs");
      const template = join(dir, "references", "template_play.md");
      const ok = spawnSync(process.execPath, [script, template], { encoding: "utf8" });
      expect(ok.status, ok.stderr).toBe(0);
      const broken = join(dir, "play_broken.md");
      writeFileSync(broken, readFileSync(template, "utf8").replace("## Stakes", "## Stake"));
      const red = spawnSync(process.execPath, [script, broken], { encoding: "utf8" });
      expect(red.status).toBe(1);
      expect(red.stderr).toMatch(/ENACTS/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("SKILL.md says to run the script before delivering", () => {
    const skill = r.files.find((f) => f.name === "SKILL.md").data.toString("utf8");
    expect(skill).toMatch(/node scripts\/check_play\.mjs/);
  });
});

describe("buildAll", () => {
  it("reports all skills conformant (no write)", () => {
    const out = buildAll({ write: false });
    expect(out.ok).toBe(true);
    expect(out.results.length).toBeGreaterThanOrEqual(1);
  });

  it("produces a deterministic zip (stable sha across runs)", () => {
    const a = buildAll({ write: false }).manifest.skills.find((s) => s.name === "khai-playwright");
    const b = buildAll({ write: false }).manifest.skills.find((s) => s.name === "khai-playwright");
    expect(a.zipSha256).toBe(b.zipSha256);
  });

  it("MANIFEST zipSha256 equals the written zip file's sha256", () => {
    buildAll({ write: true });
    const man = JSON.parse(readFileSync(join(pkgRoot, "dist", "MANIFEST.json"), "utf8"));
    const entry = man.skills.find((s) => s.name === "khai-playwright");
    const fileSha = createHash("sha256")
      .update(readFileSync(join(pkgRoot, "dist", entry.zip)))
      .digest("hex");
    expect(entry.zipSha256).toBe(fileSha);
  });
});

describe("pin", () => {
  it("anchors the official PyPI validator, not the npm impostor", () => {
    expect(PIN.validator.registry).toBe("pypi");
    expect(PIN.validator.package).toBe("skills-ref");
  });
});

// A reference nested deeper than one level must be a blocking error (PR #318).
// Dormant until the fix lands -- probe build.mjs for the new check.
const DEEP_DORMANT = !readFileSync(join(pkgRoot, "lib", "build.mjs"), "utf8").includes(
  "cultures layout supports SKILL.md plus",
);

describe.skipIf(DEEP_DORMANT)("compose: a deeply-nested reference is blocked", () => {
  let dir;
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("errors on a bundle file more than one level deep", () => {
    dir = mkdtempSync(join(tmpdir(), "khai-skill-deep-"));
    const name = dir.split(/[\\/]/).pop();
    mkdirSync(join(dir, "references", "sub"), { recursive: true });
    writeFileSync(
      join(dir, "SKILL.md"),
      `---\nname: ${name}\ndescription: A deep-reference test skill, used by the suite.\n---\n\nBody with enough words to be non-empty.\n`,
    );
    writeFileSync(join(dir, "references", "ok.md"), "one level, fine\n");
    writeFileSync(join(dir, "references", "sub", "deep.md"), "two levels, not representable\n");

    const r = composeSkill(dir);
    expect(r.errors.some((e) => /more than one level deep/.test(e))).toBe(true);
  });
});
