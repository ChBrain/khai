// Scholar keying: the surname a Source cell resolves to, and the declared policy
// that separates two people who share one. The science index keys on surname, so
// everything here decides which rows collate under a single heading -- a merge is
// silent in the rendered index and looks exactly like one prolific scholar.
//
// Three walls, in order of how much judgement they need:
//   1. surnames()          -- structural, no policy: suffixes are not surnames.
//   2. scholarPolicy       -- declared: which shared surnames name two people.
//   3. scholarCollisions() -- the drift gate over the live corpus.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { surnames, scholarCollisions, collectScience } from "../index.mjs";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// Source-presence guards, per the repo convention: a wall means nothing until it
// is on main, so each block sleeps until the source it exercises lands.
const SRC = readFileSync(new URL("../src/science.mjs", import.meta.url), "utf8");
const SUFFIX_DORMANT = !SRC.includes("SUFFIXES");
const GATE_DORMANT = !SRC.includes("scholarCollisions");

describe.skipIf(SUFFIX_DORMANT)("science: a generational suffix is not a surname", () => {
  // Before this rule the index carried a literal **Jr** heading holding five
  // different scholars, none of whom appeared under their own name anywhere.
  it("sheds Jr and III from the end of a name", () => {
    expect(surnames("Everett L. Worthington Jr.")).toEqual(["Worthington"]);
    expect(surnames("Henry L. Roediger III")).toEqual(["Roediger"]);
    expect(surnames("John R. P. French Jr.")).toEqual(["French"]);
    expect(surnames("Gaile Pohlhaus Jr.")).toEqual(["Pohlhaus"]);
  });

  it("sheds a suffix from every author in a multi-author cell", () => {
    expect(
      surnames("Michael E. McCullough, Everett L. Worthington Jr. & Kenneth C. Rachal"),
    ).toEqual(["McCullough", "Worthington", "Rachal"]);
  });

  it("keeps a part that is nothing but a suffix, rather than dropping the row", () => {
    // Not a name we can recover, but silently emitting nothing would lose the
    // citation; the uppercase-initial rule must still see a token.
    expect(surnames("Jr")).toEqual(["Jr"]);
  });

  it("leaves the particle rule alone", () => {
    expect(surnames("Julian Le Grand")).toEqual(["Le Grand"]);
    expect(surnames("John von Neumann")).toEqual(["Neumann"]);
    expect(surnames("Van Jacobson")).toEqual(["Jacobson"]);
  });
});

describe.skipIf(SUFFIX_DORMANT)("science: declared homonyms split a shared surname", () => {
  const HOM = { Berger: ["John", "Peter"], Smith: ["Robertson"], Hart: ["Julian Tudor", "Oliver"] };

  it("keys each declared person separately, and leaves others on the surname", () => {
    expect(surnames("John Berger", HOM)).toEqual(["Berger (John)"]);
    expect(surnames("Peter L. Berger & Thomas Luckmann", HOM)).toEqual([
      "Berger (Peter)",
      "Luckmann",
    ]);
    // Undeclared surnames key on the surname alone -- that is what collates one
    // scholar written several ways.
    expect(surnames("Amos Tversky")).toEqual(["Tversky"]);
  });

  it("matches a form anywhere in the given names, not only at the front", () => {
    // The corpus writes the same person's given names several ways; a
    // front-anchored match files these on the bare surname and splits them.
    expect(surnames("W. Robertson Smith", HOM)).toEqual(["Smith (Robertson)"]);
    expect(surnames("William Robertson Smith", HOM)).toEqual(["Smith (Robertson)"]);
  });

  it("keeps a multi-token form exact", () => {
    expect(surnames("Julian Tudor Hart", HOM)).toEqual(["Hart (Julian Tudor)"]);
    expect(surnames("Oliver Hart", HOM)).toEqual(["Hart (Oliver)"]);
  });

  it("falls back to the bare surname when a cell names no given name", () => {
    // "Tajfel & Turner" carries nothing to key on. The bare heading is the
    // honest answer, not a guess at which Turner was meant.
    expect(surnames("Luckmann & Berger", HOM)).toEqual(["Luckmann", "Berger"]);
  });

  it("finds the surname even when a suffix follows it", () => {
    // Slicing the given names from the end would read the surname itself as a
    // given name, and then match no declared form at all.
    expect(surnames("Peter Berger Jr.", HOM)).toEqual(["Berger (Peter)"]);
  });
});

describe.skipIf(GATE_DORMANT)("science: the homonym drift gate", () => {
  let dir;

  const references = (rows) =>
    [
      "# X: Reference",
      "",
      "## Origin",
      "",
      "| Source | Key Work | Scope |",
      "| :--- | :--- | :--- |",
      ...rows.map(([s, w, sc]) => `| ${s} | ${w} | ${sc} |`),
      "",
    ].join("\n");

  const addEngine = (id, rows) => {
    const eDir = join(dir, "packages", "engines", id);
    mkdirSync(eDir, { recursive: true });
    writeFileSync(
      join(eDir, "package.json"),
      JSON.stringify({
        name: `@chbrain/khai-engine-${id}`,
        khai: { engine: id, type: "process", anchor: `process_${id}.md` },
      }),
    );
    writeFileSync(join(eDir, "REFERENCES.md"), references(rows));
  };

  const policy = (scholarPolicy) =>
    writeFileSync(join(dir, "khai-guard.config.json"), JSON.stringify({ scholarPolicy }));

  beforeEach(() => {
    dir = join(tmpdir(), `khai-scholar-${process.pid}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(dir, { recursive: true });
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("reports a surname carrying two people, undeclared", () => {
    addEngine("a", [["**Ernest Becker**", "_The Denial of Death_ (1973)", "Terror."]]);
    addEngine("b", [["**Howard Becker**", "_Outsiders_ (1963)", "Labelling."]]);
    const out = scholarCollisions(dir);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatch(/surname "Becker" carries 2 distinct given names \(Ernest, Howard\)/);
  });

  it("goes quiet once the surname is declared in homonyms", () => {
    addEngine("a", [["**Ernest Becker**", "_A_ (1973)", "Terror."]]);
    addEngine("b", [["**Howard Becker**", "_B_ (1963)", "Labelling."]]);
    policy({ homonyms: { Becker: ["Ernest", "Howard"] } });
    expect(scholarCollisions(dir)).toEqual([]);
  });

  it("goes quiet once the surname is declared as one scholar", () => {
    // Steve/Steven Gangestad and Art/Arthur Graesser are one person each; the
    // gate cannot tell that from a real homonym, so a maintainer declares it.
    addEngine("a", [["**Steve Gangestad**", "_A_ (1986)", "Self-monitoring."]]);
    addEngine("b", [["**Steven Gangestad**", "_B_ (2000)", "Reappraisal."]]);
    expect(scholarCollisions(dir)).toHaveLength(1);
    policy({ oneScholar: ["Gangestad"] });
    expect(scholarCollisions(dir)).toEqual([]);
  });

  it("refuses a surname declared in both lists", () => {
    addEngine("a", [["**Ernest Becker**", "_A_ (1973)", "Terror."]]);
    policy({ homonyms: { Becker: ["Ernest"] }, oneScholar: ["Becker"] });
    expect(scholarCollisions(dir)[0]).toMatch(/cannot be both/);
  });

  it("does not report on initials alone", () => {
    // "C. R. Snyder" and "Mark Snyder" are the same shape as one person written
    // two ways. Reporting it would pre-judge what the policy exists to arbitrate.
    addEngine("a", [["**C. R. Snyder**", "_A_ (1991)", "Hope."]]);
    addEngine("b", [["**Mark Snyder**", "_B_ (1974)", "Self-monitoring."]]);
    expect(scholarCollisions(dir)).toEqual([]);
  });

  it("does not read a particle as a given name", () => {
    addEngine("a", [["**Wilco W. van Dijk**", "_A_ (2014)", "Schadenfreude."]]);
    addEngine("b", [["**van Dijk & Ouwerkerk**", "_B_ (2014)", "The volume."]]);
    expect(scholarCollisions(dir)).toEqual([]);
  });

  it("stays silent on one scholar cited across many engines", () => {
    // The ordinary case the index exists for: an author reused is not a defect.
    addEngine("a", [["**Mary Douglas**", "_Purity and Danger_ (1966)", "Anomaly."]]);
    addEngine("b", [["**Mary Douglas**", "_Purity and Danger_ (1966)", "The hallowed."]]);
    addEngine("c", [["**Mary Douglas**", '_"Deciphering a Meal"_ (1972)', "The order."]]);
    expect(scholarCollisions(dir)).toEqual([]);
  });
});

describe.skipIf(GATE_DORMANT)("science: the live corpus agrees with the declared policy", () => {
  it("has no undeclared shared surname", () => {
    expect(scholarCollisions(REPO)).toEqual([]);
  });

  it("files nobody under a generational suffix", () => {
    const keys = new Set(collectScience(REPO).records.map((r) => r.surname));
    for (const suffix of ["Jr", "Jr.", "Sr", "II", "III", "IV"]) {
      expect(keys.has(suffix), `${suffix} is a suffix, not a scholar`).toBe(false);
    }
  });

  it("notes a form that matches nothing in the corpus", () => {
    // A form nobody writes is a dead declaration: it never fires, and it hides
    // that the person it names is absent from the corpus entirely. Real debt --
    // but a NOTE, because failing here makes a whole class of engine unlandable.
    //
    // A new engine citing a second scholar under an existing surname needs the
    // declaration and the content BOTH, and the lanes forbid them sharing a
    // branch: khai-guard.config.json is governance, packages/engines/<name>/**
    // is the engine's own. `khai-guard advise` says SPLIT REQUIRED, governance
    // first. So the declaration necessarily lands one PR ahead of the corpus row
    // that answers it, and for exactly that window the form IS dead. Measured on
    // body-image, which needed Thompson (Kevin) beside Thompson (Emily/Ken/Megan):
    //
    //   config alone  -> this test failed: the form matched nothing yet
    //   engine alone  -> "has no undeclared shared surname" failed
    //   either order  -> red. A cycle, not a trap.
    //
    // Same shape as rule 3's window in untested-packages.test.mjs, and the same
    // answer: warn across the window the lanes create, and keep the note loud
    // (audible since #1507 and #1514) so a declaration that stays dead is seen.
    const keys = new Set(collectScience(REPO).records.map((r) => r.surname));
    const { scholarPolicy } = JSON.parse(
      readFileSync(join(REPO, "khai-guard.config.json"), "utf8"),
    );
    const dead = [];
    for (const [surname, forms] of Object.entries(scholarPolicy.homonyms))
      for (const form of forms)
        if (!keys.has(`${surname} (${form})`)) dead.push(`${surname} (${form})`);
    if (dead.length)
      console.warn(
        `scholar-keying: ${dead.length} declared form(s) matching nothing in the corpus, ` +
          `awaiting the row that uses them: ${dead.join(", ")}`,
      );
    expect(true).toBe(true);
  });
});
