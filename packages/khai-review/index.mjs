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
    else if (d.resolved === false)
      blocks.push({ id: e.id, reason: "decision recorded but the comment thread is unresolved" });
    else if (!e.resolution || !String(e.resolution).trim())
      blocks.push({
        id: e.id,
        reason: `treatment "${e.treatment}" recorded with no resolution detail`,
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
function parseVerdict(content) {
  const text = typeof content === "string" ? content : "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return { verdict: "pass" };
  let obj;
  try {
    obj = JSON.parse(text.slice(start, end + 1));
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

export default { rubrics, review, reviewCard, mockJudge, createModelJudge, collect, reconcile };
