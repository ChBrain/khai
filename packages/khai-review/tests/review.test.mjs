import { describe, it, expect } from "vitest";
import {
  review,
  reviewCard,
  rubrics,
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
} from "../index.mjs";

describe("review - harness over a pluggable judge", () => {
  it("returns the judge's verdict + suggestion as a finding (flag)", async () => {
    const f = await review("this is really just filler", rubrics.conciseness, mockJudge);
    expect(f.verdict).toBe("flag");
    expect(f.rubric).toBe("conciseness");
    expect(typeof f.suggestion).toBe("string");
  });

  it("passes lean prose: no flag, no suggestion", async () => {
    const f = await review(
      "the room reads the body before a word.",
      rubrics.conciseness,
      mockJudge,
    );
    expect(f.verdict).toBe("pass");
    expect(f.suggestion).toBeNull();
    expect(f.reason).toBeNull();
  });

  it("is judge-agnostic: the injected judge drives the verdict", async () => {
    const alwaysFlag = async () => ({ verdict: "flag", suggestion: "x", reason: "r" });
    const alwaysPass = async () => ({ verdict: "pass" });
    expect((await review("anything", rubrics.conciseness, alwaysFlag)).verdict).toBe("flag");
    expect((await review("anything", rubrics.conciseness, alwaysPass)).verdict).toBe("pass");
  });

  it("validates its inputs", async () => {
    await expect(review(123, rubrics.conciseness, mockJudge)).rejects.toThrow(/prose/);
    await expect(review("x", null, mockJudge)).rejects.toThrow(/rubric/);
    await expect(review("x", rubrics.conciseness, null)).rejects.toThrow(/judge/);
  });
});

describe("reviewCard - rubrics over a card's chapters", () => {
  const manifest = {
    card: {
      wire: "the anchor declares the read.",
      issue: "two expressions, really just male and female.",
      require: "carried under Projection.",
      enforce: "the engine owns its tests.",
      setup: "declare the law once.",
    },
  };

  it("flags only the chapters the judge flags, tagged by location", async () => {
    const flags = await reviewCard(manifest, mockJudge);
    expect(flags).toHaveLength(1);
    expect(flags[0].where).toBe("card.issue");
    expect(flags[0].verdict).toBe("flag");
    expect(flags[0].suggestion).toContain("male and female");
  });

  it("returns nothing for a clean card (advisory, never throws on content)", async () => {
    expect(await reviewCard({ card: { wire: "clean prose here." } }, mockJudge)).toEqual([]);
  });
});

describe("createModelJudge - the production, model-backed judge", () => {
  // A canned chat-completions response, the OpenAI-compatible shape the endpoint
  // returns. fetchImpl is stubbed, so these tests never touch the network.
  const reply = (content) => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ choices: [{ message: { content } }] }),
  });

  it("requires a token at call time, not import time", async () => {
    const judge = createModelJudge({ token: undefined, fetchImpl: async () => reply("{}") });
    await expect(judge({ prose: "x", rubric: rubrics.conciseness })).rejects.toThrow(/token/);
  });

  it("parses a flag verdict (suggestion + reason) from the model reply", async () => {
    const judge = createModelJudge({
      token: "t",
      fetchImpl: async () => reply('{"verdict":"flag","suggestion":"tighter","reason":"padded"}'),
    });
    const out = await judge({ prose: "wordy passage", rubric: rubrics.conciseness });
    expect(out).toEqual({ verdict: "flag", suggestion: "tighter", reason: "padded" });
  });

  it("parses a pass verdict", async () => {
    const judge = createModelJudge({
      token: "t",
      fetchImpl: async () => reply('{"verdict":"pass"}'),
    });
    expect(await judge({ prose: "lean", rubric: rubrics.conciseness })).toEqual({
      verdict: "pass",
    });
  });

  it("is tolerant: pulls the JSON out of a fenced / chatty reply", async () => {
    const judge = createModelJudge({
      token: "t",
      fetchImpl: async () =>
        reply('Sure!\n```json\n{"verdict":"flag","suggestion":"s","reason":"r"}\n```'),
    });
    expect((await judge({ prose: "x", rubric: rubrics.conciseness })).verdict).toBe("flag");
  });

  it("degrades to pass on an unparseable reply (advisory never breaks a run)", async () => {
    const judge = createModelJudge({ token: "t", fetchImpl: async () => reply("not json at all") });
    expect(await judge({ prose: "x", rubric: rubrics.conciseness })).toEqual({ verdict: "pass" });
  });

  it("throws on an HTTP error, surfacing status", async () => {
    const judge = createModelJudge({
      token: "t",
      fetchImpl: async () => ({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "bad token",
      }),
    });
    await expect(judge({ prose: "x", rubric: rubrics.conciseness })).rejects.toThrow(/401/);
  });
});

describe("collect - the risk register: dedup, treat, verify", () => {
  const finding = (id, extra = {}) => ({
    id,
    engine: "gender",
    where: "card.setup",
    rubric: "conciseness",
    reason: "padded",
    suggestion: "tighter",
    ...extra,
  });
  const known = (id, treatment, extra = {}) => ({
    ...finding(id),
    treatment,
    resolution: null,
    ...extra,
  });

  // 1. dedup ----------------------------------------------------------------
  it("adds a genuinely new finding as open + untreated (only these need a comment)", () => {
    const { ledger, added } = collect([], [finding("a")]);
    expect(added.map((e) => e.id)).toEqual(["a"]);
    expect(ledger[0]).toMatchObject({ status: "open", treatment: null });
  });

  it("does NOT re-add a finding already in the ledger", () => {
    const { added } = collect([known("a", null)], [finding("a")]);
    expect(added).toEqual([]);
  });

  it("only the new ones are added when some are known and some are new", () => {
    const { added } = collect([known("a", null)], [finding("a"), finding("b")]);
    expect(added.map((e) => e.id)).toEqual(["b"]);
  });

  it("refreshes the latest review text on a carried finding", () => {
    const { ledger } = collect(
      [known("a", null, { suggestion: "old", reason: "old" })],
      [finding("a", { suggestion: "new", reason: "new" })],
    );
    expect(ledger[0]).toMatchObject({ suggestion: "new", reason: "new" });
  });

  // 2. treat (Accept / Transfer are respected, content cannot refute) --------
  it("an accepted risk stays accepted even while the content still flags", () => {
    const { ledger, added, reopened } = collect([known("a", "accept")], [finding("a")]);
    expect(ledger[0].status).toBe("accepted");
    expect(added).toEqual([]);
    expect(reopened).toEqual([]);
  });

  it("a transferred risk stays transferred", () => {
    const { ledger } = collect([known("a", "transfer", { resolution: "#80" })], [finding("a")]);
    expect(ledger[0]).toMatchObject({ status: "transferred", resolution: "#80" });
  });

  // 3. verify (Reduce is a claim about the content; the re-run checks it) -----
  it("a Reduce that no longer flags is verified: status reduced (solved for real)", () => {
    const { ledger, reopened } = collect([known("a", "reduce")], []); // gone from fresh
    expect(ledger[0].status).toBe("reduced");
    expect(reopened).toEqual([]);
  });

  it("a Reduce that still flags is a tracked promise: reduce-pending, not reopened", () => {
    const { ledger, reopened, added } = collect([known("a", "reduce")], [finding("a")]);
    expect(ledger[0].status).toBe("reduce-pending");
    expect(reopened).toEqual([]); // a promise, re-checked next run; not an alarm
    expect(added).toEqual([]);
  });

  it("a once-reduced finding that flags again is reopened as a regression", () => {
    const prior = [{ ...finding("a"), treatment: "reduce", status: "reduced", resolution: "#80" }];
    const { ledger, reopened } = collect(prior, [finding("a")]);
    expect(ledger[0]).toMatchObject({ status: "open", treatment: null }); // undecided again
    expect(reopened.map((e) => e.id)).toEqual(["a"]);
  });

  // untreated lifecycle ------------------------------------------------------
  it("an untreated finding that no longer flags is cleared (incidental fix)", () => {
    const { ledger, added } = collect([known("a", null)], []);
    expect(ledger[0].status).toBe("cleared");
    expect(added).toEqual([]);
  });
});

describe("reconcile - the consistency gate: table must agree with the comments", () => {
  const entry = (id, status, treatment, extra = {}) => ({
    id,
    where: "card.setup",
    status,
    treatment,
    resolution: null,
    ...extra,
  });

  it("passes when every settled finding has a matching, resolved comment + a resolution", () => {
    const ledger = [
      entry("a", "accepted", "accept", { resolution: "kept terse on purpose" }),
      entry("b", "reduced", "reduce", { resolution: "#80" }),
    ];
    const decisions = [
      { id: "a", treatment: "accept", resolved: true },
      { id: "b", treatment: "reduce", resolved: true },
    ];
    expect(reconcile(ledger, decisions)).toEqual({ ok: true, blocks: [] });
  });

  it("blocks a settled finding with no resolution detail", () => {
    const ledger = [entry("a", "accepted", "accept", { resolution: null })];
    const decisions = [{ id: "a", treatment: "accept", resolved: true }];
    const { ok, blocks } = reconcile(ledger, decisions);
    expect(ok).toBe(false);
    expect(blocks[0].reason).toMatch(/no resolution detail/);
  });

  it("accepts a resolution that names a not-yet-raised PR (text only, no existence check)", () => {
    const ledger = [entry("b", "reduced", "reduce", { resolution: "PR to be raised" })];
    const decisions = [{ id: "b", treatment: "reduce", resolved: true }];
    expect(reconcile(ledger, decisions).ok).toBe(true);
  });

  it("a reduce-pending promise satisfies the table (released, re-checked next run)", () => {
    const ledger = [entry("b", "reduce-pending", "reduce", { resolution: "#80, lands next week" })];
    const decisions = [{ id: "b", treatment: "reduce", resolved: true }];
    expect(reconcile(ledger, decisions)).toEqual({ ok: true, blocks: [] });
  });

  it("blocks an open finding with no recorded treatment (undecided)", () => {
    const { ok, blocks } = reconcile([entry("a", "open", null)], []);
    expect(ok).toBe(false);
    expect(blocks[0]).toMatchObject({ id: "a", reason: /no recorded treatment/ });
  });

  it("blocks when the table and the comment disagree on the treatment", () => {
    const ledger = [entry("a", "accepted", "accept")];
    const decisions = [{ id: "a", treatment: "transfer", resolved: true }];
    const { ok, blocks } = reconcile(ledger, decisions);
    expect(ok).toBe(false);
    expect(blocks[0].reason).toMatch(/table says "accept", comment says "transfer"/);
  });

  it("blocks the anti-cheat case: comment claims reduce, but the table reopened it to open", () => {
    // the model reopened a Reduce that still flags; the table shows open while the
    // comment says reduce -> they diverge, so the PR is held.
    const ledger = [entry("a", "open", null)];
    const decisions = [{ id: "a", treatment: "reduce", resolved: true }];
    const { ok, blocks } = reconcile(ledger, decisions);
    expect(ok).toBe(false);
    expect(blocks[0].reason).toMatch(/still shows it open/);
  });

  it("blocks a comment decision that references no finding in the table", () => {
    const { ok, blocks } = reconcile([], [{ id: "ghost", treatment: "accept", resolved: true }]);
    expect(ok).toBe(false);
    expect(blocks[0]).toMatchObject({ id: "ghost", reason: /not in the table/ });
  });

  it("ignores a cleared finding (incidental fix needs no decision)", () => {
    expect(reconcile([entry("a", "cleared", null)], [])).toEqual({ ok: true, blocks: [] });
  });
});

describe("PR surface - comment body, anchor, marker, treatment parsing", () => {
  const f = {
    id: "gender-conciseness:gender:card.setup:conciseness",
    rubric: "conciseness",
    current: "the wordy original prose",
    reason: "padded",
    suggestion: "tighter",
  };

  it("a comment body shows current, suggestion, reasoning, the marker, and the menu", () => {
    const body = commentBody(f);
    expect(findingIdOf(body)).toBe(f.id);
    expect(body).toMatch(/\*\*Current\*\*\n> the wordy original prose/);
    expect(body).toMatch(/\*\*Suggestion\*\*\n> tighter/);
    expect(body).toMatch(/\*\*Reasoning:\*\* padded/);
    expect(body).toMatch(/Accept:.*Reduce:.*Transfer:/s);
  });

  it("findingIdOf returns null when no marker is present", () => {
    expect(findingIdOf("just a human comment")).toBeNull();
  });

  it("anchorLine finds the 1-based row of a finding id in the log", () => {
    const log = `# Audit log\n\n| id |\n| -- |\n| \`${f.id}\` |\n`;
    expect(anchorLine(log, f.id)).toBe(5);
    expect(anchorLine(log, "absent")).toBeNull();
  });

  it("parseTreatment reads Accept / Reduce / Transfer + resolution", () => {
    expect(parseTreatment("Accept: known tradeoff")).toEqual({
      treatment: "accept",
      resolution: "known tradeoff",
    });
    expect(parseTreatment("Reduce #80")).toEqual({ treatment: "reduce", resolution: "#80" });
    expect(parseTreatment("Transfer: language engine")).toEqual({
      treatment: "transfer",
      resolution: "language engine",
    });
  });

  it("parseTreatment is case-insensitive and tolerates no detail", () => {
    expect(parseTreatment("REDUCE")).toEqual({ treatment: "reduce", resolution: null });
  });

  it("parseTreatment returns null for a reply that records no treatment", () => {
    expect(parseTreatment("looks fine to me")).toBeNull();
    expect(parseTreatment("")).toBeNull();
  });
});

describe("decisionsFromThreads + applyDecisions - the comment -> table sync", () => {
  const thread = (id, reply, resolved) => ({
    isResolved: resolved,
    comments: [
      { body: `<!-- khai-finding: ${id} -->\n**conciseness finding**` },
      ...(reply ? [{ body: reply }] : []),
    ],
  });

  it("reads the finding id, the latest treatment, and the resolved state", () => {
    const out = decisionsFromThreads([thread("x", "Reduce: #80", true)]);
    expect(out).toEqual([{ id: "x", treatment: "reduce", resolution: "#80", resolved: true }]);
  });

  it("skips a thread with no finding marker, and reports an untreated thread", () => {
    const out = decisionsFromThreads([
      { isResolved: false, comments: [{ body: "just chatting" }] },
      thread("y", null, false),
    ]);
    expect(out).toEqual([
      { id: "y", treatment: undefined, resolution: undefined, resolved: false },
    ]);
  });

  it("writes the treatment + status into the ledger (accept / transfer)", () => {
    const ledger = [
      { id: "a", status: "open", treatment: null, resolution: null },
      { id: "b", status: "open", treatment: null, resolution: null },
    ];
    const out = applyDecisions(ledger, [
      { id: "a", treatment: "accept", resolution: "terse on purpose" },
      { id: "b", treatment: "transfer", resolution: "language engine" },
    ]);
    expect(out[0]).toMatchObject({
      status: "accepted",
      treatment: "accept",
      resolution: "terse on purpose",
    });
    expect(out[1]).toMatchObject({
      status: "transferred",
      treatment: "transfer",
      resolution: "language engine",
    });
  });

  it("reduce is reduce-pending while it still flags, reduced once it does not", () => {
    const ledger = [
      { id: "a", status: "open", treatment: null, resolution: null },
      { id: "b", status: "open", treatment: null, resolution: null },
    ];
    const out = applyDecisions(
      ledger,
      [
        { id: "a", treatment: "reduce", resolution: "#80" },
        { id: "b", treatment: "reduce", resolution: "#81" },
      ],
      new Set(["a"]), // only "a" still flags
    );
    expect(out[0].status).toBe("reduce-pending");
    expect(out[1].status).toBe("reduced");
  });

  it("leaves a finding with no decision untouched", () => {
    const ledger = [{ id: "a", status: "open", treatment: null, resolution: null }];
    expect(applyDecisions(ledger, [])).toEqual(ledger);
  });
});

describe("createModelJudge - prompt assembly", () => {
  const reply = (content) => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ choices: [{ message: { content } }] }),
  });

  it("sends the rubric instruction and prose to the configured model + endpoint", async () => {
    let captured;
    const judge = createModelJudge({
      token: "secret",
      endpoint: "https://example.test/chat",
      model: "openai/gpt-4o-mini",
      fetchImpl: async (url, init) => {
        captured = { url, init };
        return reply('{"verdict":"pass"}');
      },
    });
    await judge({ prose: "the prose under review", rubric: rubrics.conciseness });
    expect(captured.url).toBe("https://example.test/chat");
    expect(captured.init.headers.Authorization).toBe("Bearer secret");
    const body = JSON.parse(captured.init.body);
    expect(body.model).toBe("openai/gpt-4o-mini");
    expect(body.temperature).toBe(0);
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0].content).toContain(rubrics.conciseness.instruction);
    expect(body.messages[1].content).toBe("the prose under review");
  });
});
