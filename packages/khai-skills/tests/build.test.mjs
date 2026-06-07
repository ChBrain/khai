import { describe, it, expect } from "vitest";
import { buildAll, composeSkill, PIN } from "../lib/build.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
