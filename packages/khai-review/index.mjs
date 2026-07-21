// The NLP-review lane: the judged, advisory counterpart to the deterministic
// conformance kit (@chbrain/khai-tests). Where a rule can decide it, the kit
// gates it; where only meaning can decide it, this lane reviews it -- and only
// ever advises, never gates. A judgment is not a build break, and is not
// perfectly reproducible, so a finding here is a suggestion, never a red X.
//
// The harness is model-free and pure: it takes prose, a rubric (the criterion),
// and a `judge` (a function that reads prose against a rubric and returns a
// verdict). The judge is injected -- a deterministic mock in tests, a model in
// production -- so this package carries zero model dependencies and the harness
// stays reproducibly testable. Adding a check is adding a rubric, not plumbing.
//
// The ladder, and it goes both ways. Read UP, code -> ai -> human is
// ESCALATION, per case, at runtime: a case the deterministic gates cannot
// settle is judged here, and a finding this lane cannot settle escalates to a
// person (the collect/reconcile treatment is that top rung). Read DOWN,
// human -> ai -> code is CONSOLIDATION, over time: a judgement a person keeps
// making, once it crisps up, becomes a rubric here; once it is crisp enough to
// be mechanical, a wall in the kit. Same rungs, opposite directions and
// timescales -- escalation handles what is not yet settled low, consolidation
// moves the frontier down so less needs escalating next time. This lane is the
// middle rung, and the frontier is meant to move, so nothing here is fixed: a
// rubric is a check on its way down, not a permanent home. (The tiers spell the
// house, read as initials: Computed, AI, Instructed is CAI; Human, AI, Computed,
// Knowledge is HACK. KAI HACKS AI.)

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";

/**
 * @typedef {{ id: string, instruction: string }} Rubric
 * @typedef {(input: { prose: string, rubric: Rubric }) => Promise<{ verdict: "pass" | "flag", suggestion?: string, reason?: string }>} Judge
 * @typedef {{ rubric: string, verdict: "pass" | "flag", suggestion: string | null, reason: string | null }} Finding
 */

/**
 * The rubrics: each a named criterion the judge applies. Data, not code.
 * @type {Record<string, Rubric>}
 */
export const rubrics = {
  // "Less is more": challenge whether the same meaning fits in fewer words.
  // The deterministic proxy (a word count) cannot tell a tight long passage
  // from a padded short one; only a reader can, so it lives in this lane.
  conciseness: {
    id: "conciseness",
    instruction:
      "You are a careful editor with a HIGH BAR for raising a flag. FLAG a passage only if it is clearly padded: at least a quarter of it could go with no loss of meaning, no lost specific term, and no shift in voice. Reply PASS when the passage is already lean, when the only available cuts are marginal, when a cut would drop a load-bearing word, or when the change is a lateral reword rather than a real reduction. A tie goes to PASS. When you do FLAG, give a tighter rewrite that keeps the meaning, the specific terms, and the house voice ( , ; : () , never a dash), and never invents or drops content.",
  },
  "khai-type": {
    id: "khai-type",
    instruction:
      "You are a careful editor with a HIGH BAR for raising a flag. Verify if the prose actually does the job its section type demands. Reply PASS if the prose successfully fulfills its purpose. FLAG the passage only if it clearly fails its purpose (for example, if a Shadow section merely restates or repeats the Projection rather than contradicting or revealing a hidden tension behind it, or if a section is completely off-topic). A tie goes to PASS. When you do FLAG, give a rewrite that accomplishes the section's job (e.g., a Shadow that genuinely complicates or contradicts the persona's Projection) and keeps the house voice ( , ; : () , never a dash).",
  },
  "voice-conformance": {
    id: "voice-conformance",
    instruction: "Conform to the resolved voice brief.",
  },
};

/**
 * Review one passage against one rubric, via the injected judge. Advisory: the
 * returned finding is a suggestion, never a gate.
 * @param {string} prose
 * @param {Rubric} rubric
 * @param {Judge} judge
 * @returns {Promise<Finding>}
 */
export async function review(prose, rubric, judge) {
  if (typeof prose !== "string") throw new Error("review: prose must be a string");
  if (!rubric || typeof rubric.instruction !== "string")
    throw new Error("review: a rubric with an instruction is required");
  if (typeof judge !== "function") throw new Error("review: a judge function is required");

  const out = (await judge({ prose, rubric })) ?? {};
  const verdict = out.verdict === "flag" ? "flag" : "pass";
  return {
    rubric: rubric.id,
    verdict,
    suggestion: verdict === "flag" ? (out.suggestion ?? null) : null,
    reason: verdict === "flag" ? (out.reason ?? null) : null,
  };
}

/**
 * The skeptic rubric derived from a base rubric: the same criterion, the burden
 * inverted onto the finding. It is told to REFUTE a prior flag by default, so it
 * replies "flag" (meaning: the finding is refuted) unless the passage clearly
 * meets the criterion on its own terms, in which case it replies "pass" (the
 * finding holds, it could not be refuted). A separate rubric so the base rubric
 * stays a pure criterion.
 * @param {Rubric} rubric
 * @returns {Rubric}
 */
export function skepticRubric(rubric) {
  return {
    id: `${rubric.id}:skeptic`,
    anchored: rubric.anchored,
    instruction:
      `You are a SKEPTIC, and the burden is on the finding, not the passage. A prior reviewer ` +
      `flagged this passage against the criterion: "${rubric.instruction}" ` +
      `Default to REFUTING that flag. Reply "flag" to mean THE FINDING IS REFUTED, unless the ` +
      `passage clearly and independently meets the criterion for a finding; only then reply ` +
      `"pass", meaning the finding holds and you could not refute it.`,
  };
}

/**
 * @typedef {Finding & { confirmed: boolean, votes: number, n: number }} RobustFinding
 */

/**
 * The robustness wrapper (order 2): a single sample of one model is not a
 * finding. The rubric is run as N independent judgements and confirmed only on a
 * declared consensus (K of N flags), so a lone flaky flag does not survive. An
 * optional skeptic pass, told to refute by default, can then VETO a confirmed
 * finding: it stands only if the skeptic fails to refute it. And a rubric that
 * ASSERTS A FACT (`rubric.anchored`) must be handed a retrieved source and may
 * not self-certify from the model's memory, so without a source it cannot
 * confirm. The thresholds (n, k), the skeptic, and the anchoring live here in the
 * harness, not in the model, which is what holds when the model in the slot is
 * changed. Still advisory: the result is a suggestion, never a gate.
 *
 * The two confirmation routes the order names are both expressible: consensus
 * alone (`skeptic: false`, the default), or a skeptic decision (`n: 1, k: 1,
 * skeptic: true`, one proposer the skeptic then disposes).
 *
 * @param {string} prose
 * @param {Rubric} rubric
 * @param {Judge} judge
 * @param {{ n?: number, k?: number, skeptic?: boolean, source?: string | null }} [opts]
 * @returns {Promise<RobustFinding>}
 */
export async function reviewRobust(prose, rubric, judge, opts = {}) {
  const { n = 3, k = 2, skeptic = false, source = null } = opts;
  if (typeof prose !== "string") throw new Error("reviewRobust: prose must be a string");
  if (!rubric || typeof rubric.instruction !== "string")
    throw new Error("reviewRobust: a rubric with an instruction is required");
  if (typeof judge !== "function") throw new Error("reviewRobust: a judge function is required");
  if (!Number.isInteger(n) || n < 1) throw new Error("reviewRobust: n must be a positive integer");
  if (!Number.isInteger(k) || k < 1 || k > n)
    throw new Error("reviewRobust: k must be an integer in 1..n");

  // Source anchoring: a factual rubric may not self-certify from the model's
  // memory. Without a retrieved source it cannot confirm; the caller supplies one.
  if (rubric.anchored && (typeof source !== "string" || source.trim() === "")) {
    return {
      rubric: rubric.id,
      verdict: "pass",
      confirmed: false,
      votes: 0,
      n,
      suggestion: null,
      reason: "unanchored: a factual rubric needs a retrieved source, not the model's memory",
    };
  }

  // A factual rubric judges the passage AGAINST the retrieved source, so the
  // source rides in front of the passage; a non-factual rubric ignores it.
  const subject = rubric.anchored ? `RETRIEVED SOURCE:\n${source}\n\nPASSAGE:\n${prose}` : prose;

  // N independent judgements; the flags carry the suggestion and reason.
  const findings = [];
  for (let i = 0; i < n; i++) findings.push(await review(subject, rubric, judge));
  const flags = findings.filter((f) => f.verdict === "flag");
  const votes = flags.length;
  let confirmed = votes >= k;

  // Skeptic veto: the finding stands only if the skeptic fails to refute it (a
  // "pass" from the skeptic). A skeptic "flag" means refuted, and drops it.
  if (confirmed && skeptic) {
    const refutation = await review(subject, skepticRubric(rubric), judge);
    if (refutation.verdict === "flag") confirmed = false;
  }

  const winner = flags[0] ?? null;
  return {
    rubric: rubric.id,
    verdict: confirmed ? "flag" : "pass",
    confirmed,
    votes,
    n,
    suggestion: confirmed && winner ? winner.suggestion : null,
    reason: confirmed && winner ? winner.reason : null,
  };
}

/**
 * Review every chapter of an engine's WIRES card against the given rubrics
 * (conciseness by default). Returns only the flags, each tagged with its
 * location, for an advisory PR comment. Pure JSON walk plus the judge.
 * @param {{ card?: Record<string, string> }} manifest  the package.json `khai` block
 * @param {Judge} judge
 * @param {Rubric[]} [checks]
 * @returns {Promise<(Finding & { where: string })[]>}
 */
/**
 * Parse simple frontmatter key-value pairs.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[k] = v;
  }
  return data;
}

/**
 * Resolve effective voice by walking up the override chain.
 * @param {string|null} filePath relative file path from repoRoot (or null for card)
 * @param {string} repoRoot
 * @returns {string|null}
 */
export function resolveVoice(filePath, repoRoot = process.cwd()) {
  const absRoot = resolve(repoRoot);

  // 1. Element file voice
  if (filePath) {
    const absPath = resolve(repoRoot, filePath);
    if (existsSync(absPath)) {
      try {
        const fm = parseFrontmatter(readFileSync(absPath, "utf8"));
        if (fm.voice) return fm.voice;
      } catch {
        // ignore
      }
    }

    // 2. Play file voice (starts with play_*.md, walking up from dirname(file) to repoRoot)
    let dir = dirname(absPath);
    while (true) {
      try {
        const files = readdirSync(dir);
        const playFile = files.find((f) => f.startsWith("play_") && f.endsWith(".md"));
        if (playFile) {
          const fm = parseFrontmatter(readFileSync(join(dir, playFile), "utf8"));
          if (fm.voice) return fm.voice;
        }
      } catch {
        // ignore
      }
      if (dir === absRoot) break;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  // 3. House voice (README.md at repoRoot)
  const readmePath = join(absRoot, "README.md");
  if (existsSync(readmePath)) {
    try {
      const fm = parseFrontmatter(readFileSync(readmePath, "utf8"));
      if (fm.voice) return fm.voice;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Build a parameterized voice-conformance rubric.
 * @param {string} voice
 * @returns {Rubric}
 */
export function buildVoiceRubric(voice) {
  return {
    id: "voice-conformance",
    instruction:
      'You are a careful editor with a HIGH BAR for raising a flag. Verify if the prose conforms to the declared voice: "' +
      voice +
      '". Reply PASS if the prose successfully conforms to the voice brief, or if the voice brief is too general or vague to check. FLAG the passage only if it clearly violates the voice brief. A tie goes to PASS. When you do FLAG, give a rewrite that conforms to the voice brief and keeps the meaning, specific terms, and the house voice ( , ; : () , never a dash).',
  };
}

/**
 * Review every chapter of an engine's WIRES card against the given rubrics
 * (conciseness by default). Returns only the flags, each tagged with its
 * location, for an advisory PR comment. Pure JSON walk plus the judge.
 * @param {{ card?: Record<string, string>, voice?: string }} manifest  the package.json `khai` block
 * @param {Judge} judge
 * @param {Rubric[]} [checks]
 * @param {string} [repoRoot]
 * @param {string|null} [pkgDir]
 * @returns {Promise<(Finding & { where: string })[]>}
 */
export async function reviewCard(
  manifest,
  judge,
  checks = [rubrics.conciseness],
  repoRoot = process.cwd(),
  pkgDir = null,
) {
  const card = (manifest && manifest.card) || {};
  const flags = [];
  for (const [chapter, prose] of Object.entries(card)) {
    if (typeof prose !== "string" || !prose.trim()) continue;
    for (const rubric of checks) {
      let activeRubric = rubric;
      if (rubric.id === "voice-conformance") {
        let voice = manifest && manifest.voice;
        if (!voice) {
          const dummyPath = pkgDir ? join(pkgDir, "dummy.md") : null;
          const relativeDummy = dummyPath ? relative(repoRoot, dummyPath) : null;
          voice = resolveVoice(relativeDummy, repoRoot);
        }
        if (!voice) {
          console.warn(
            `khai-review: skipped voice-conformance for card.${chapter}, no voice brief found.`,
          );
          continue;
        }
        activeRubric = buildVoiceRubric(voice);
      }
      const f = await review(prose, activeRubric, judge);
      if (f.verdict === "flag") flags.push({ where: `card.${chapter}`, current: prose, ...f });
    }
  }
  return flags;
}

/**
 * Extract H2 section bodies from markdown.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseH2Sections(text) {
  if (typeof text !== "string") return {};
  const sections = {};
  const parts = text.split(/^##\s+/m);
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const firstNewLine = part.indexOf("\n");
    if (firstNewLine === -1) continue;
    const title = part.slice(0, firstNewLine).trim();
    let body = part.slice(firstNewLine).trim();
    const h1Index = body.search(/^#\s+/m);
    if (h1Index !== -1) {
      body = body.slice(0, h1Index).trim();
    }
    if (title && body) {
      sections[title] = body;
    }
  }
  return sections;
}

/**
 * Collapse a chapter body to a single line: strip list markers and blank lines,
 * join with a space. The Drives/Shadow chapters are prose the model reads as one
 * criterion, not as markdown to render.
 * @param {string} body
 * @returns {string}
 */
function flattenChapter(body) {
  return String(body ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-*+]\s+/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build one review rubric from a position and the persona(s) that hold it. The
 * position's accountability (its Drives, the standing plan it presses toward) is
 * what it checks; the persona voices are how it reads, held in tension when more
 * than one holds the seat; the persona shadows are the biases it must distrust in
 * itself while judging. Kept pure so it tests without the filesystem.
 * @param {{ title: string, accountability: string, voices: string[], shadows: string[] }} p
 * @returns {string}
 */
export function buildPositionInstruction({ title, accountability, voices = [], shadows = [] }) {
  const parts = [
    `You review as ${title}, accountable for this and this alone: ${accountability}`,
    voices.length
      ? `Read in ${voices.length > 1 ? "these voices, held in tension" : "this voice"}: ${voices.join(" / ")}.`
      : "",
    // Escalation is the basic concept, and it is the same for every position: the
    // deterministic gates already settle what is coded and unambiguous, so you do
    // NOT re-judge that; you judge only the ambiguity they cannot reach, and a
    // finding you raise ESCALATES to a person. You are one rung, never the final
    // word: a FLAG is a suggestion escalated to the human, it does not gate.
    "You are one rung in an escalation. The deterministic gates have already settled everything coded and unambiguous; do not re-judge that. Judge only the genuine ambiguity they cannot reach, and with a HIGH BAR: FLAG a passage only when it clearly fails the accountability above in a way no deterministic check catches; a tie goes to PASS. A FLAG ESCALATES the passage to a person as a suggestion, it never gates. When you FLAG, give a rewrite that meets the accountability and keeps the house voice ( , ; : () , never a dash), inventing nothing.",
    shadows.length ? `Distrust your own shadow while you judge: ${shadows.join(" / ")}` : "",
  ];
  return parts.filter(Boolean).join(" ");
}

/**
 * Resolve a house's review rubrics from its management positions. What a house
 * checks for is its own, declared in the team it casts: each position is an
 * accountability, voiced by the persona(s) that hold it, in tension when more
 * than one does. This reads that team and turns each position into a rubric the
 * harness runs. The NUMBER is the house's, never the harness's: a house may cast
 * three positions or ten, and a different house rightfully chases different
 * criteria. No universal set, no fixed count, nothing imposed. The mechanism is
 * global; the team, and so what it checks, is local, exactly as voice is.
 *
 * Every position is kept, not tiered: the basic concept is escalation, the same
 * for all of them. A position is not "a wall" or "a judge"; each spans coded
 * (what the deterministic gates settle) and judged (the ambiguity only meaning
 * can decide), and each escalates what it cannot settle. The rubric is that
 * judged rung, framed to defer to the gates below it and to escalate, never gate,
 * above it.
 *
 * @param {string} managementDir  a house's management/ directory
 * @returns {Rubric[]}  one rubric per position with a declared accountability,
 *                      ordered by filename (stable)
 */
export function resolvePositionRubrics(managementDir) {
  let entries;
  try {
    entries = readdirSync(managementDir);
  } catch {
    return [];
  }
  const positionFiles = entries.filter((f) => /^position_.+\.md$/.test(f)).sort();
  const personaFiles = entries.filter((f) => /^persona_.+\.md$/.test(f));

  // Which personas hold each position: a persona's Taxonomy links its position.
  const personasByPosition = new Map();
  for (const pf of personaFiles) {
    let text;
    try {
      text = readFileSync(join(managementDir, pf), "utf8");
    } catch {
      continue;
    }
    const fm = parseFrontmatter(text);
    const sections = parseH2Sections(text);
    const link = (sections["Taxonomy"] ?? "").match(/position_[a-z0-9_]+\.md/);
    if (!link) continue;
    if (!personasByPosition.has(link[0])) personasByPosition.set(link[0], []);
    personasByPosition.get(link[0]).push({
      voice: fm.voice || null,
      shadow: flattenChapter(sections["Shadow"]),
    });
  }

  const out = [];
  for (const pf of positionFiles) {
    let text;
    try {
      text = readFileSync(join(managementDir, pf), "utf8");
    } catch {
      continue;
    }
    const fm = parseFrontmatter(text);
    const sections = parseH2Sections(text);
    // The accountability is the position's Drives (its standing plan); a position
    // that declares none is not a review criterion and is skipped.
    const accountability = flattenChapter(sections["Drives"]);
    if (!accountability) continue;
    const held = personasByPosition.get(pf) ?? [];
    out.push({
      id: pf.replace(/^position_/, "").replace(/\.md$/, ""),
      instruction: buildPositionInstruction({
        title: fm.title || pf,
        accountability,
        voices: held.map((p) => p.voice).filter(Boolean),
        shadows: held.map((p) => p.shadow).filter(Boolean),
      }),
    });
  }
  return out;
}

/**
 * Review H2 section bodies in a markdown file.
 * @param {string} filename relative filename (e.g., position_female.md)
 * @param {string} text content of the markdown file
 * @param {Judge} judge
 * @param {Rubric[]} [checks]
 * @param {string} [repoRoot]
 * @param {string} [filePath]
 * @returns {Promise<(Finding & { where: string })[]>}
 */
export async function reviewMarkdown(
  filename,
  text,
  judge,
  checks = [rubrics.conciseness],
  repoRoot = process.cwd(),
  filePath = filename,
) {
  const sections = parseH2Sections(text);
  const flags = [];
  for (const [title, body] of Object.entries(sections)) {
    if (typeof body !== "string" || !body.trim()) continue;
    for (const rubric of checks) {
      let activeRubric = rubric;
      if (rubric.id === "voice-conformance") {
        const voice = resolveVoice(filePath, repoRoot);
        if (!voice) {
          console.warn(
            `khai-review: skipped voice-conformance for ${filename}#${title}, no voice brief found.`,
          );
          continue;
        }
        activeRubric = buildVoiceRubric(voice);
      }
      const f = await review(body, activeRubric, judge);
      if (f.verdict === "flag") {
        flags.push({ where: `${filename}#${title}`, current: body, ...f });
      }
    }
  }
  return flags;
}

/**
 * A deterministic stand-in for a model, for tests and dry runs. It does NOT
 * judge meaning; it only proves the harness wiring (a real model-backed judge
 * replaces it behind the same interface). Flags prose with obvious filler.
 * @type {Judge}
 */
export const mockJudge = async ({ prose }) => {
  const filler = /\b(?:very|really|just|basically|actually|simply|in order to)\b/gi;
  // Decide from whether the strip removed anything, not a stateful `/g`.test():
  // a no-op strip means no filler, so pass. (Collapse spaces only after, so a
  // double-spaced but filler-free passage is not mistaken for padded.)
  const stripped = prose.replace(filler, "");
  if (stripped === prose) return { verdict: "pass" };
  const tighter = stripped.replace(/\s{2,}/g, " ").trim();
  return { verdict: "flag", suggestion: tighter, reason: "removable filler" };
};

/**
 * A finding is a risk; its `treatment` is the human's risk decision, in the
 * classic vocabulary; `status` is derived by the collector from the treatment
 * and whether the content still flags.
 *
 *   treatment:
 *     null       untreated: a human must still decide (the open comment).
 *     "accept"   acknowledged, left as is. The content may still flag; that is
 *                the accepted risk. The model cannot refute a decision.
 *     "reduce"   a claim that the content was fixed. VERIFIABLE: the next run
 *                checks it actually stopped flagging.
 *     "transfer" the risk is owned elsewhere (another engine, a sibling PR, a
 *                downstream world); `resolution` says where.
 *   status (derived by the collector, never by a human):
 *     "open"            untreated and still flagging, OR a regression (a finding
 *                       once "reduced" that flags again). Blocks: needs a decision.
 *     "accepted" / "transferred"   the treatment, respected.
 *     "reduce-pending"  a "reduce" whose fix has not landed yet (the content still
 *                       flags). A promise: it satisfies the table and releases the
 *                       audit, and is re-checked on the next run. Auditable.
 *     "reduced"         a "reduce" the re-run confirms no longer flags. For real.
 *     "cleared"         untreated, no longer flagging (an incidental fix, no decision).
 *
 * @typedef {"accept"|"reduce"|"transfer"|null} Treatment
 * @typedef {{ id: string, engine?: string, where?: string, rubric?: string,
 *   reason?: string|null, suggestion?: string|null, treatment?: Treatment,
 *   status?: "open"|"accepted"|"transferred"|"reduce-pending"|"reduced"|"cleared",
 *   resolution?: string|null }} LedgerEntry
 */

/**
 * The collector: reconcile a fresh review against the known ledger. Pure (no IO,
 * no clock), so it tests deterministically; the CLI reads/writes around it. It
 * does three jobs:
 *   1. dedup     a finding already in the ledger is not raised again (`added`
 *                holds only genuinely new findings, which need a comment).
 *   2. treat     each known finding keeps its human treatment (accept/transfer),
 *                its review text refreshed to the latest.
 *   3. verify    a "reduce" is checked against the content: gone -> "reduced"
 *                (solved for real); still flagging -> "reduce-pending" (a tracked
 *                promise, re-checked next run); a once-"reduced" finding that
 *                flags again -> reopened to "open" (a regression). The status is
 *                the collector's, never a human's, so a fix cannot be faked.
 *
 * @param {LedgerEntry[]} prior  the committed ledger (the collector's memory)
 * @param {{id:string,engine?:string,where?:string,rubric?:string,reason?:string|null,suggestion?:string|null}[]} fresh
 * @returns {{ ledger: LedgerEntry[], added: LedgerEntry[], reopened: LedgerEntry[] }}
 */
export function collect(prior = [], fresh = []) {
  const priorById = new Map(prior.map((e) => [e.id, e]));
  const freshById = new Map(fresh.map((f) => [f.id, f]));
  const ledger = [];
  const added = [];
  const reopened = [];

  // Known findings: carry the human treatment, refresh the text, derive status.
  // Only the collector sets `reduced`, and only when the content is actually
  // clean, so a human can never falsely claim a fix; the worst they can record is
  // `reduce`, which the run reads as a promise until it verifies.
  for (const e of prior) {
    const latest = freshById.get(e.id);
    const stillFlags = latest !== undefined;
    const base = latest
      ? { ...e, reason: latest.reason ?? null, suggestion: latest.suggestion ?? null }
      : { ...e };
    let entry;
    if (e.treatment === "accept") entry = { ...base, status: "accepted" };
    else if (e.treatment === "transfer") entry = { ...base, status: "transferred" };
    else if (e.treatment === "reduce") {
      if (!stillFlags)
        entry = { ...base, status: "reduced" }; // verified clean
      else if (e.status === "reduced") {
        // was verified, flags again: a regression. Reopen, undecided, re-ping.
        entry = { ...base, status: "open", treatment: null, resolution: null };
        reopened.push(entry);
      } else entry = { ...base, status: "reduce-pending" }; // the promise, not yet verified
    } else entry = { ...base, status: stillFlags ? "open" : "cleared" }; // untreated
    ledger.push(entry);
  }

  // Brand-new findings: untreated, open, and the only ones that need a comment.
  for (const f of fresh) {
    if (priorById.has(f.id)) continue;
    const entry = {
      id: f.id,
      engine: f.engine,
      where: f.where,
      rubric: f.rubric,
      reason: f.reason ?? null,
      suggestion: f.suggestion ?? null,
      treatment: null,
      status: "open",
      resolution: null,
    };
    ledger.push(entry);
    added.push(entry);
  }

  return { ledger, added, reopened };
}

/**
 * The consistency gate. The model's findings are advisory, but this is
 * deterministic and MEANT to gate: the committed ledger must agree with the
 * treatment each finding's PR comment thread records. It blocks when the record
 * and the conversation diverge, so neither can drift from the other.
 *
 * `decisions` are parsed from the audit PR's comment threads by the workflow:
 * one per finding id, carrying the treatment the human stated and whether the
 * thread is resolved. Pure, so the gate logic tests without GitHub.
 *
 * Blocks when:
 *   - an `open` finding has no recorded treatment (undecided), or a comment
 *     treats it while the table still shows it open (the table did not update,
 *     e.g. the anti-cheat reopened a Reduce the comment claims done);
 *   - a settled finding (accepted/transferred/reduced) has no comment decision,
 *     a comment whose treatment differs, or an unresolved thread;
 *   - a comment decision references a finding not in the table.
 *
 * @param {LedgerEntry[]} ledger
 * @param {{id:string, treatment?:Treatment, resolved?:boolean}[]} decisions
 * @returns {{ ok: boolean, blocks: {id:string, reason:string}[] }}
 */
export function reconcile(ledger = [], decisions = []) {
  const decById = new Map(decisions.map((d) => [d.id, d]));
  const inLedger = new Set(ledger.map((e) => e.id));
  const blocks = [];

  for (const e of ledger) {
    const d = decById.get(e.id);
    if (e.status === "open") {
      if (!d || !d.treatment)
        blocks.push({ id: e.id, reason: "open finding has no recorded treatment" });
      else
        blocks.push({
          id: e.id,
          reason: `comment treats it "${d.treatment}" but the table still shows it open`,
        });
      continue;
    }
    // settled: accepted / transferred / reduced / cleared
    if (e.status === "cleared") continue; // incidental fix, no decision needed
    if (!d || !d.treatment)
      blocks.push({
        id: e.id,
        reason: `table shows "${e.treatment}" but no comment records a decision`,
      });
    else if (d.treatment !== e.treatment)
      blocks.push({
        id: e.id,
        reason: `table says "${e.treatment}", comment says "${d.treatment}"`,
      });
    else if (!e.resolution || !String(e.resolution).trim())
      blocks.push({
        id: e.id,
        reason: `treatment "${e.treatment}" recorded with no resolution detail`,
      });
    else if (!d.resolved)
      blocks.push({
        id: e.id,
        reason: `treatment "${e.treatment}" recorded but the comment thread is unresolved`,
      });
    // The resolution is free text and may name a PR not yet raised; the gate
    // checks only that a detail is present, never that the PR exists. A Reduce
    // whose fix has not landed is still `open` (not settled), so it is held by
    // the open-finding branch above, not released by an IOU here.
  }

  for (const d of decisions)
    if (!inLedger.has(d.id))
      blocks.push({ id: d.id, reason: "comment decision for a finding not in the table" });

  return { ok: blocks.length === 0, blocks };
}

// ---------------------------------------------------------------------------
// The PR surface: pure helpers the workflow uses to post findings as inline
// comments and to read treatments back out of the comment threads. The GitHub
// API calls stay in the workflow; these (anchoring, comment body, parsing) are
// here so they test without GitHub.
// ---------------------------------------------------------------------------

/** A hidden marker carried in a finding's comment body, so a later run can map a
 * comment thread back to its finding id. */
export const FINDING_MARKER = "khai-finding";
const marker = (id) => `<!-- ${FINDING_MARKER}: ${id} -->`;

/** Pull the finding id out of a comment body that carries the marker, else null. */
export function findingIdOf(commentBody) {
  const m = new RegExp(`<!--\\s*${FINDING_MARKER}:\\s*([^\\s]+)\\s*-->`).exec(
    typeof commentBody === "string" ? commentBody : "",
  );
  return m ? m[1] : null;
}

/** The inline-comment body for a new finding: the marker, the suggestion, and
 * how to treat it. The marker lets the consistency run find this thread again. */
export function commentBody(f) {
  return [
    marker(f.id),
    `**Finding** (${f.rubric ?? "review"})`,
    f.current ? `\n**Current**\n> ${f.current}` : "",
    f.suggestion ? `\n**Suggestion**\n> ${f.suggestion}` : "",
    f.reason ? `\n**Reasoning:** ${f.reason}` : "",
    "\nTreat this finding by replying, then resolve this thread:",
    "`Accept: <why>` | `Reduce: <fixing PR or note>` | `Transfer: <where>`",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Escape a free-text value for a markdown table cell: the backslash FIRST (so
 * it does not double-escape the pipe we add next), then the pipe, then collapse
 * newlines that would break the row. Order matters (CWE-116). Shared so the log
 * row (renderLog) and anchorLine agree on the exact rendered form of an id. */
export function escapeCell(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

/** The 1-based line in the log where a finding's row sits, for anchoring an
 * inline comment to a line that is in the audit PR diff. null if not found. */
export function anchorLine(logText, id) {
  // Match the exact backtick-wrapped id cell renderLog emits, not a bare
  // substring: a finding id that is a prefix of another (e.g. "a:b:c" vs
  // "a:b:cd") would otherwise anchor to the wrong (earlier) row.
  const needle = "`" + escapeCell(id) + "`";
  const i = String(logText)
    .split("\n")
    .findIndex((l) => l.includes(needle));
  return i >= 0 ? i + 1 : null;
}

/** Parse a human reply into a treatment decision: a leading Accept / Reduce /
 * Transfer, then the resolution detail (free text, may name a not-yet-raised
 * PR). Returns null if the reply records no treatment. */
export function parseTreatment(text) {
  if (typeof text !== "string") return null;
  const m = /^\s*(accept|reduce|transfer)\b[\s:.\-]*([\s\S]*)$/i.exec(text.trim());
  if (!m) return null;
  return { treatment: m[1].toLowerCase(), resolution: m[2].trim() || null };
}

/** Build treatment decisions from a PR's review threads: the finding id comes
 * from the marker in the bot's comment, the treatment from the latest human
 * reply that parses to one, the resolved state from the thread. Pure. */
export function decisionsFromThreads(threads = []) {
  const out = [];
  for (const t of threads) {
    const comments = t.comments ?? [];
    let id = null;
    for (const c of comments) {
      const f = findingIdOf(c.body);
      if (f) {
        id = f;
        break;
      }
    }
    if (!id) continue;
    let decision = null;
    for (const c of comments) {
      const d = parseTreatment(c.body);
      if (d) decision = d; // the latest parsing reply wins
    }
    out.push({
      id,
      treatment: decision?.treatment,
      resolution: decision?.resolution,
      resolved: Boolean(t.isResolved),
    });
  }
  return out;
}

/** Apply comment decisions to the ledger, so the table records what each finding
 * was treated as (this is the comment -> table sync). The treatment and its
 * resolution come from the thread; the status follows: accept -> accepted,
 * transfer -> transferred, reduce -> reduce-pending while the content still flags
 * (in `flagging`), else reduced. A finding with no decision is left as-is. The
 * model, via `flagging`, still owns whether a reduce is verified, so a human
 * cannot mark something reduced that still flags. Pure. */
export function applyDecisions(ledger = [], decisions = [], flagging = new Set()) {
  const flags = flagging instanceof Set ? flagging : new Set(flagging);
  const dec = new Map(decisions.map((d) => [d.id, d]));
  return ledger.map((e) => {
    const d = dec.get(e.id);
    if (!d || !d.treatment) return e;
    let status;
    if (d.treatment === "accept") status = "accepted";
    else if (d.treatment === "transfer") status = "transferred";
    else status = flags.has(e.id) ? "reduce-pending" : "reduced";
    return {
      ...e,
      treatment: d.treatment,
      resolution: d.resolution ?? e.resolution ?? null,
      status,
    };
  });
}

// The reply contract appended to the rubric: the model must answer as one JSON
// object, so the verdict is machine-readable. Kept separate from the rubric so a
// rubric stays pure criterion (what to judge), not transport (how to answer).
const RESPONSE_CONTRACT =
  'Reply with exactly one JSON object, no prose around it: {"verdict":"pass"|"flag","suggestion":string,"reason":string}. ' +
  'Use "flag" only if the passage clearly meets the rubric for a finding; then "suggestion" is the rewrite and "reason" is one short clause. ' +
  'Otherwise "verdict" is "pass" and the other fields may be empty.';

/** Pull the verdict out of a model reply. Tolerant: a model may wrap the JSON in
 * prose or a code fence, so grab the first balanced object; on any parse failure
 * degrade to `pass` (this lane advises, so a flaky reply must not break a run). */
/** First balanced top-level {...} object in a string, or null. String-aware, so
 * a "}" inside a quoted value (or trailing prose) doesn't mis-bound the slice
 * the way indexOf("{")..lastIndexOf("}") would. */
function firstJsonObject(text) {
  let depth = 0;
  let start = -1;
  let inStr = false;
  let esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}" && depth > 0 && --depth === 0) {
      return text.slice(start, i + 1);
    }
  }
  return null;
}

function parseVerdict(content) {
  const text = typeof content === "string" ? content : "";
  const json = firstJsonObject(text);
  if (json === null) return { verdict: "pass" };
  let obj;
  try {
    obj = JSON.parse(json);
  } catch {
    return { verdict: "pass" };
  }
  if (obj.verdict !== "flag") return { verdict: "pass" };
  return {
    verdict: "flag",
    suggestion: typeof obj.suggestion === "string" ? obj.suggestion : undefined,
    reason: typeof obj.reason === "string" ? obj.reason : undefined,
  };
}

/**
 * The production judge: the model-backed counterpart to `mockJudge`, behind the
 * same Judge interface. It calls an OpenAI-compatible chat-completions endpoint
 * (GitHub Models / `openai/gpt-4o-mini` by default), has the model apply the
 * rubric to the prose, and parses a structured verdict. Native fetch, no SDK, so
 * the package keeps zero runtime dependencies; the network call is what keeps it
 * out of the test suite, which uses `mockJudge`. `fetchImpl` is injectable so a
 * test can stub the transport and stay offline + reproducible.
 *
 * A token and network are required at call time (CI, dry runs), not at import.
 * Reads config from the environment so a world wires it with secrets, not code:
 *   KHAI_REVIEW_TOKEN (or GITHUB_TOKEN), KHAI_REVIEW_ENDPOINT, KHAI_REVIEW_MODEL.
 *
 * @param {{ token?: string, endpoint?: string, model?: string, temperature?: number, fetchImpl?: typeof fetch }} [opts]
 * @returns {Judge}
 */
export function createModelJudge({
  token = process.env.KHAI_REVIEW_TOKEN ?? process.env.GITHUB_TOKEN,
  endpoint = process.env.KHAI_REVIEW_ENDPOINT ??
    "https://models.github.ai/inference/chat/completions",
  model = process.env.KHAI_REVIEW_MODEL ?? "openai/gpt-4o-mini",
  temperature = 0,
  fetchImpl = globalThis.fetch,
} = {}) {
  return async function modelJudge({ prose, rubric }) {
    if (!token)
      throw new Error("createModelJudge: no token (set KHAI_REVIEW_TOKEN or GITHUB_TOKEN)");
    if (typeof fetchImpl !== "function")
      throw new Error("createModelJudge: no fetch available (Node >=18, or pass fetchImpl)");

    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature, // 0: as reproducible as a model gets (the lane is still advisory)
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${rubric.instruction}\n\n${RESPONSE_CONTRACT}` },
          { role: "user", content: prose },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `modelJudge: ${model} returned ${res.status} ${res.statusText} ${body}`.trim(),
      );
    }
    const data = await res.json();
    return parseVerdict(data?.choices?.[0]?.message?.content);
  };
}

export default {
  rubrics,
  review,
  reviewRobust,
  skepticRubric,
  reviewCard,
  reviewMarkdown,
  parseH2Sections,
  parseFrontmatter,
  resolveVoice,
  buildVoiceRubric,
  resolvePositionRubrics,
  buildPositionInstruction,
  mockJudge,
  createModelJudge,
  collect,
  reconcile,
  commentBody,
  anchorLine,
  findingIdOf,
  parseTreatment,
  decisionsFromThreads,
  applyDecisions,
  FINDING_MARKER,
};
