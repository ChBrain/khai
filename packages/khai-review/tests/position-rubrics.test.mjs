// Rubrics resolved from a house's management positions: each position is an
// accountability (its Drives), voiced by the persona(s) that hold it, in tension
// when more than one does. The number is the house's, not the harness's. Each
// rubric is a rung in the escalation: it defers to the deterministic gates and
// escalates to a person, never gates.

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { resolvePositionRubrics, buildPositionInstruction } from "../index.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("resolvePositionRubrics");

describe.skipIf(DORMANT)("buildPositionInstruction", () => {
  it("carries the accountability", () => {
    const s = buildPositionInstruction({
      title: "The Roadie",
      accountability: "the chain stays current",
    });
    expect(s).toContain("The Roadie");
    expect(s).toContain("the chain stays current");
  });

  it("names one voice, or several held in tension", () => {
    const one = buildPositionInstruction({ title: "X", accountability: "a", voices: ["measured"] });
    expect(one).toContain("this voice");
    expect(one).not.toContain("held in tension");
    const two = buildPositionInstruction({
      title: "X",
      accountability: "a",
      voices: ["measured", "decisive"],
    });
    expect(two).toContain("held in tension");
    expect(two).toContain("measured");
    expect(two).toContain("decisive");
  });

  it("frames the rubric as an escalation rung (defer down, escalate up, never gate)", () => {
    const s = buildPositionInstruction({ title: "X", accountability: "a" });
    expect(s).toMatch(/escalat/i);
    expect(s).toMatch(/deterministic gates/i);
    expect(s).toMatch(/never gate/i);
  });

  it("includes the shadow to distrust when present, omits the clause when absent", () => {
    const withShadow = buildPositionInstruction({
      title: "X",
      accountability: "a",
      shadows: ["cannot tell caution from wisdom"],
    });
    expect(withShadow).toContain("cannot tell caution from wisdom");
    const without = buildPositionInstruction({ title: "X", accountability: "a" });
    expect(without).not.toMatch(/shadow/i);
  });
});

const positionDoc = (title, drives) =>
  `---\nkhai: position\ntitle: "${title}"\n---\n\n# Position: ${title}\n\n## Drives\n\n${drives}\n`;

const personaDoc = (title, positionFile, voice, shadow) =>
  `---\nkhai: persona\ntitle: "${title}"\nvoice: "${voice}"\n---\n\n# Persona: ${title}\n\n## Taxonomy\n\n[${title}](${positionFile}).\n\n## Shadow\n\n${shadow}\n`;

let dir;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

/** A temp management dir: `positions` is {file: [title, drives]}, `personas` is
 * {file: [title, positionFile, voice, shadow]}. */
function mgmt(positions = {}, personas = {}) {
  dir = mkdtempSync(join(tmpdir(), "khai-positions-"));
  for (const [file, [title, drives]] of Object.entries(positions))
    writeFileSync(join(dir, file), positionDoc(title, drives));
  for (const [file, [title, pos, voice, shadow]] of Object.entries(personas))
    writeFileSync(join(dir, file), personaDoc(title, pos, voice, shadow));
  return dir;
}

describe.skipIf(DORMANT)("resolvePositionRubrics", () => {
  it("resolves one rubric per position, the count the house's own", () => {
    const two = resolvePositionRubrics(
      mgmt({
        "position_a.md": ["A", "drive a"],
        "position_b.md": ["B", "drive b"],
      }),
    );
    expect(two).toHaveLength(2);

    const five = resolvePositionRubrics(
      mgmt(
        Object.fromEntries(
          ["a", "b", "c", "d", "e"].map((x) => [
            `position_${x}.md`,
            [x.toUpperCase(), `drive ${x}`],
          ]),
        ),
      ),
    );
    expect(five).toHaveLength(5); // some have 3, others 10: the number is not fixed
  });

  it("derives the id from the position filename and carries its accountability", () => {
    const [r] = resolvePositionRubrics(
      mgmt({ "position_roadie.md": ["The Roadie", "the chain stays current"] }),
    );
    expect(r.id).toBe("roadie");
    expect(r.instruction).toContain("the chain stays current");
  });

  it("folds a holding persona's voice and shadow into its position's rubric", () => {
    const [r] = resolvePositionRubrics(
      mgmt(
        { "position_choregos.md": ["The Choregos", "the whole runs"] },
        {
          "persona_nicias.md": [
            "Nicias",
            "position_choregos.md",
            "measured, weighted",
            "cannot tell caution from wisdom",
          ],
        },
      ),
    );
    expect(r.instruction).toContain("measured, weighted");
    expect(r.instruction).toContain("cannot tell caution from wisdom");
  });

  it("holds two personas of one position in tension", () => {
    const [r] = resolvePositionRubrics(
      mgmt(
        { "position_choregos.md": ["The Choregos", "the whole runs"] },
        {
          "persona_nicias.md": ["Nicias", "position_choregos.md", "measured", "the long pause"],
          "persona_pericles.md": ["Pericles", "position_choregos.md", "decisive", "the overreach"],
        },
      ),
    );
    expect(r.instruction).toContain("held in tension");
    expect(r.instruction).toContain("measured");
    expect(r.instruction).toContain("decisive");
  });

  it("skips a position that declares no accountability (no Drives)", () => {
    dir = mkdtempSync(join(tmpdir(), "khai-positions-"));
    writeFileSync(
      join(dir, "position_empty.md"),
      `---\nkhai: position\ntitle: "Empty"\n---\n\n# Position: Empty\n\n## Owner\n\n- Project: x\n`,
    );
    expect(resolvePositionRubrics(dir)).toEqual([]);
  });

  it("returns rubrics ordered by filename, stably", () => {
    const rs = resolvePositionRubrics(
      mgmt({
        "position_charlie.md": ["Charlie", "d"],
        "position_alpha.md": ["Alpha", "d"],
        "position_bravo.md": ["Bravo", "d"],
      }),
    );
    expect(rs.map((r) => r.id)).toEqual(["alpha", "bravo", "charlie"]);
  });

  it("returns nothing for a directory that does not exist", () => {
    expect(resolvePositionRubrics(join(tmpdir(), "khai-no-such-dir-xyz"))).toEqual([]);
  });
});
