// reviewHouse composes order 2 end to end: resolve the house's rubrics from its
// positions, run each through the robustness wrapper, and reconcile the confirmed
// findings into the ledger (the escalation to a person). The judge is injected,
// so this runs with deterministic stubs and no model.

import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { reviewHouse } from "../index.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "index.mjs");
const DORMANT = !readFileSync(SRC, "utf8").includes("reviewHouse");

const positionDoc = (title, drives) =>
  `---\nkhai: position\ntitle: "${title}"\n---\n\n# Position: ${title}\n\n## Drives\n\n${drives}\n`;

let dir;
afterEach(() => dir && rmSync(dir, { recursive: true, force: true }));

/** A temp management dir with the given positions ({file: [title, drives]}). */
function mgmt(positions = {}) {
  dir = mkdtempSync(join(tmpdir(), "khai-house-"));
  for (const [file, [title, drives]] of Object.entries(positions))
    writeFileSync(join(dir, file), positionDoc(title, drives));
  return dir;
}

const pass = { verdict: "pass" };
const passAll = async () => pass;
// Flag for one base rubric id (and optionally its skeptic), pass otherwise.
const flagFor =
  (id, alsoSkeptic = false) =>
  async ({ rubric }) =>
    rubric.id === id || (alsoSkeptic && rubric.id === `${id}:skeptic`)
      ? { verdict: "flag", suggestion: "fix", reason: "why" }
      : pass;

describe.skipIf(DORMANT)("reviewHouse", () => {
  it("runs the whole team and escalates a confirmed finding into the ledger", async () => {
    const out = await reviewHouse(
      mgmt({ "position_a.md": ["A", "drive a"], "position_b.md": ["B", "drive b"] }),
      "prose",
      flagFor("a"),
      { n: 3, k: 2, where: "doc#s" },
    );
    expect(out.rubrics).toEqual(["a", "b"]); // every position is run
    expect(out.findings.map((f) => f.id)).toEqual(["doc#s:a"]); // where tags the id
    expect(out.added).toHaveLength(1); // a new escalation
    expect(out.ledger.find((e) => e.rubric === "a").status).toBe("open");
  });

  it("escalates nothing for a clean passage", async () => {
    const out = await reviewHouse(mgmt({ "position_a.md": ["A", "drive a"] }), "prose", passAll, {
      n: 3,
      k: 2,
    });
    expect(out.findings).toEqual([]);
    expect(out.added).toEqual([]);
  });

  it("reconciles against a prior ledger: a finding that stops flagging clears", async () => {
    const first = await reviewHouse(
      mgmt({ "position_a.md": ["A", "drive a"] }),
      "prose",
      flagFor("a"),
      { n: 3, k: 2, where: "doc#s" },
    );
    expect(first.ledger.find((e) => e.rubric === "a").status).toBe("open");
    const second = await reviewHouse(
      mgmt({ "position_a.md": ["A", "drive a"] }),
      "prose",
      passAll,
      { n: 3, k: 2, where: "doc#s", prior: first.ledger },
    );
    expect(second.ledger.find((e) => e.rubric === "a").status).toBe("cleared");
    expect(second.added).toEqual([]); // nothing new to escalate
  });

  it("passes the skeptic through: a refuted finding does not escalate", async () => {
    const out = await reviewHouse(
      mgmt({ "position_a.md": ["A", "drive a"] }),
      "prose",
      flagFor("a", true), // flags the base AND refutes as skeptic
      { n: 1, k: 1, skeptic: true },
    );
    expect(out.findings).toEqual([]);
  });

  it("is graceful when the house casts no positions", async () => {
    const out = await reviewHouse(mgmt({}), "prose", flagFor("a"), { n: 3, k: 2 });
    expect(out.rubrics).toEqual([]);
    expect(out.findings).toEqual([]);
    expect(out.added).toEqual([]);
  });
});

const DORMANT_ESC = DORMANT || !readFileSync(SRC, "utf8").includes("escalatesTo");

describe.skipIf(DORMANT_ESC)("reviewHouse: escalation target", () => {
  it("tags a finding with its next rung from the escalation map", async () => {
    const out = await reviewHouse(
      mgmt({ "position_roadie.md": ["The Roadie", "drive"] }),
      "prose",
      flagFor("roadie"),
      { n: 3, k: 2, escalation: { roadie: "choregos" } },
    );
    expect(out.findings[0].escalatesTo).toBe("choregos"); // the immediate rung, not flattened to human
  });

  it("defaults an unrouted finding straight to the human", async () => {
    const out = await reviewHouse(
      mgmt({ "position_a.md": ["A", "drive"] }),
      "prose",
      flagFor("a"),
      { n: 3, k: 2 },
    );
    expect(out.findings[0].escalatesTo).toBe("human");
  });

  it("routes each rung to its own target in one pass", async () => {
    const out = await reviewHouse(
      mgmt({
        "position_roadie.md": ["The Roadie", "d"],
        "position_choregos.md": ["The Choregos", "d"],
      }),
      "prose",
      async () => ({ verdict: "flag", suggestion: "x", reason: "y" }),
      { n: 3, k: 2, escalation: { roadie: "choregos", choregos: "human" } },
    );
    const by = Object.fromEntries(out.findings.map((f) => [f.rubric, f.escalatesTo]));
    expect(by).toEqual({ roadie: "choregos", choregos: "human" });
  });

  it("carries the target onto the reconciled ledger entries", async () => {
    const out = await reviewHouse(
      mgmt({ "position_roadie.md": ["The Roadie", "d"] }),
      "prose",
      flagFor("roadie"),
      { n: 3, k: 2, where: "doc#s", escalation: { roadie: "choregos" } },
    );
    expect(out.added[0].escalatesTo).toBe("choregos");
    expect(out.ledger.find((e) => e.rubric === "roadie").escalatesTo).toBe("choregos");
  });
});
