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
      "You are a ruthless editor. Could this passage say the same thing in materially fewer words (aim for at least 20% shorter)? If yes, reply FLAG with a tighter rewrite; if it is already lean, reply PASS. Cut filler, hedging, redundancy, and restating. Keep the meaning, the specific terms, and the house voice ( , ; : () , never a dash). Do not invent or drop content.",
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
 * Review every chapter of an engine's WIRES card against the given rubrics
 * (conciseness by default). Returns only the flags, each tagged with its
 * location, for an advisory PR comment. Pure JSON walk plus the judge.
 * @param {{ card?: Record<string, string> }} manifest  the package.json `khai` block
 * @param {Judge} judge
 * @param {Rubric[]} [checks]
 * @returns {Promise<(Finding & { where: string })[]>}
 */
export async function reviewCard(manifest, judge, checks = [rubrics.conciseness]) {
  const card = (manifest && manifest.card) || {};
  const flags = [];
  for (const [chapter, prose] of Object.entries(card)) {
    if (typeof prose !== "string" || !prose.trim()) continue;
    for (const rubric of checks) {
      const f = await review(prose, rubric, judge);
      if (f.verdict === "flag") flags.push({ where: `card.${chapter}`, ...f });
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
  if (!filler.test(prose)) return { verdict: "pass" };
  const tighter = prose
    .replace(filler, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { verdict: "flag", suggestion: tighter, reason: "removable filler" };
};

export default { rubrics, review, reviewCard, mockJudge };
