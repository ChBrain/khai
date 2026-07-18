import { describe, it, expect } from "vitest";
import * as guard from "../index.mjs";

// Dormant until the source PR that exports checkMembers + reads memberPolicy
// lands. Source and tests are separate PRs (the source/test gate), so a test
// PR cut from a main without the function must still import cleanly and skip
// rather than fail to resolve the import.
const DORMANT = typeof guard.checkMembers !== "function";

// A policy mirroring the repo's khai-guard.config.json memberPolicy shape.
const cfg = {
  memberPolicy: {
    engines: ["packages/engines/*/package.json"],
    homonyms: ["bearer"],
    grandfathered: ["guilt"],
  },
};

const engine = (name, files) => ({
  path: `packages/engines/${name}/package.json`,
  engine: name,
  files,
});

describe.skipIf(DORMANT)("checkMembers", () => {
  it("passes a catalogue whose stems have one owner each", () => {
    const r = guard.checkMembers(
      [
        engine("flow", ["process_flow.md", "position_absorbed.md"]),
        engine("trust", ["process_trust.md"]),
      ],
      cfg,
    );
    expect(r).toEqual({ ok: true, errors: [] });
  });

  it("no policy configured = nothing to check", () => {
    const r = guard.checkMembers([engine("a", ["process_x.md"]), engine("b", ["piece_x.md"])], {});
    expect(r.ok).toBe(true);
  });

  it("fails a stem two engines claim, naming both files", () => {
    const r = guard.checkMembers(
      [engine("guilt2", ["process_remorse.md"]), engine("shame", ["process_remorse.md"])],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0]).toContain('"remorse"');
    expect(r.errors[0]).toContain("guilt2/process_remorse.md");
    expect(r.errors[0]).toContain("shame/process_remorse.md");
  });

  it("collates across type prefixes: same stem, different types, still one phenomenon", () => {
    const r = guard.checkMembers(
      [
        engine("hierarchy", ["position_ascending.md"]),
        engine("status-move", ["process_ascending.md"]),
      ],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('"ascending"');
  });

  it("fails a stem that restates another engine's whole domain", () => {
    const r = guard.checkMembers(
      [engine("ritual", ["process_liminality.md"]), engine("liminality", ["place_threshold.md"])],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('restates the domain of the "liminality" engine');
  });

  it("reads a multi-word slug: stem underscores match the engine's hyphens", () => {
    const r = guard.checkMembers(
      [engine("power", ["position_status_move.md"]), engine("status-move", ["position_rising.md"])],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toContain('restates the domain of the "status-move" engine');
  });

  it("an engine's own anchor naming its own domain is not a restatement", () => {
    const r = guard.checkMembers([engine("trust", ["process_trust.md"])], cfg);
    expect(r).toEqual({ ok: true, errors: [] });
  });

  it("a homonym stem is exempt", () => {
    const r = guard.checkMembers(
      [engine("document", ["position_bearer.md"]), engine("stigma", ["position_bearer.md"])],
      cfg,
    );
    expect(r).toEqual({ ok: true, errors: [] });
  });

  it("a grandfathered stem is exempt until its thinning lands", () => {
    const r = guard.checkMembers(
      [engine("guilt", ["process_guilt.md"]), engine("shame", ["process_guilt.md"])],
      cfg,
    );
    expect(r).toEqual({ ok: true, errors: [] });
  });

  it("keeps a stem's own underscores: only the type prefix is stripped", () => {
    const r = guard.checkMembers(
      [
        engine("locus-of-control", ["position_locus_of_control.md"]),
        engine("heritage", ["piece_cultural_capital.md"]),
      ],
      cfg,
    );
    expect(r).toEqual({ ok: true, errors: [] });
  });
});
