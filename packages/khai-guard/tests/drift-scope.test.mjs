import { describe, it, expect } from "vitest";
import * as guard from "../index.mjs";

// Dormant until the source PR that exports checkDrift lands. Source and tests
// are separate PRs (the source/test gate), so a test PR cut from a main without
// the function must still import cleanly and skip rather than fail to resolve
// the import.
const DORMANT = typeof guard.checkDrift !== "function";

// A policy mirroring what a house configures: the scopes whose packages the
// registry is asked about.
const cfg = { driftPolicy: { scopes: ["@chbrain/"] } };

const at = (name, held, latest) => ({
  declared: { [name]: "^0.0.1" },
  held: { [name]: held },
  latest: { [name]: latest },
});

describe.skipIf(DORMANT)("checkDrift", () => {
  it("reports a package level with the registry as ok", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", "0.2.4", "0.2.4"), cfg);
    expect(r.ok).toBe(true);
    expect(r.behind).toEqual([]);
    expect(r.rows).toHaveLength(1);
  });

  it("flags a package the registry has moved past", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", "0.2.1", "0.2.4"), cfg);
    expect(r.ok).toBe(false);
    expect(r.behind).toHaveLength(1);
    expect(r.behind[0]).toMatchObject({
      name: "@chbrain/khai-tests",
      held: "0.2.1",
      latest: "0.2.4",
      behind: true,
    });
  });

  // A registry that will not answer must surface as a finding, never as
  // silence: a broken token would otherwise read as "nothing is behind".
  it("carries a package the registry would not serve as unreachable", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", "0.2.4", null), cfg);
    expect(r.ok).toBe(false);
    expect(r.unreachable).toHaveLength(1);
    expect(r.unreachable[0]).toMatchObject({ name: "@chbrain/khai-tests", unreachable: true });
    // reported, not dropped
    expect(r.rows).toHaveLength(1);
  });

  it("does not call a package behind when the lockfile holds nothing for it", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", null, "0.2.4"), cfg);
    expect(r.behind).toEqual([]);
    expect(r.rows[0]).toMatchObject({ held: null, behind: false });
  });

  it("watches only the named scopes", () => {
    const r = guard.checkDrift(
      {
        declared: { "@chbrain/khai-tests": "^0.2.0", prettier: "^3.9.6" },
        held: { "@chbrain/khai-tests": "0.2.4", prettier: "3.0.0" },
        latest: { "@chbrain/khai-tests": "0.2.4", prettier: "3.9.6" },
      },
      cfg,
    );
    expect(r.rows.map((x) => x.name)).toEqual(["@chbrain/khai-tests"]);
    expect(r.ok).toBe(true);
  });

  it("reads both dependencies and devDependencies, sorted by name", () => {
    const r = guard.checkDrift(
      {
        declared: { "@chbrain/khai-tests": "^0.2.0", "@chbrain/khai-arch": "^0.1.0" },
        held: { "@chbrain/khai-tests": "0.2.4", "@chbrain/khai-arch": "0.1.25" },
        latest: { "@chbrain/khai-tests": "0.2.4", "@chbrain/khai-arch": "0.1.25" },
      },
      cfg,
    );
    expect(r.rows.map((x) => x.name)).toEqual(["@chbrain/khai-arch", "@chbrain/khai-tests"]);
  });

  it("separates behind from unreachable rather than pooling them", () => {
    const r = guard.checkDrift(
      {
        declared: { "@chbrain/a": "^1", "@chbrain/b": "^1" },
        held: { "@chbrain/a": "1.0.0", "@chbrain/b": "1.0.0" },
        latest: { "@chbrain/a": "1.1.0", "@chbrain/b": null },
      },
      cfg,
    );
    expect(r.behind.map((x) => x.name)).toEqual(["@chbrain/a"]);
    expect(r.unreachable.map((x) => x.name)).toEqual(["@chbrain/b"]);
    expect(r.ok).toBe(false);
  });

  // No policy is not a pass with an opinion: it is nothing to check.
  it("checks nothing when no driftPolicy is configured", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", "0.2.1", "0.2.4"), {});
    expect(r).toEqual({ ok: true, rows: [], behind: [], unreachable: [] });
  });

  it("checks nothing when the policy names no scopes", () => {
    const r = guard.checkDrift(at("@chbrain/khai-tests", "0.2.1", "0.2.4"), {
      driftPolicy: { scopes: [] },
    });
    expect(r.rows).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("survives being called with nothing at all", () => {
    expect(guard.checkDrift(undefined, cfg)).toEqual({
      ok: true,
      rows: [],
      behind: [],
      unreachable: [],
    });
  });
});
