import { describe, it, expect } from "vitest";
import * as guard from "../index.mjs";

// Dormant until the source PR that exports checkLockfiles + validates
// lockfilePolicy lands. Source and tests are separate PRs (the source/test
// gate), so a test PR cut from a main without the function must still import
// cleanly and skip rather than fail to resolve the import.
const DORMANT = typeof guard.checkLockfiles !== "function";

// A policy mirroring the repo's khai-guard.config.json lockfilePolicy.
const cfg = {
  lockfilePolicy: { lockfiles: ["package-lock.json", "npm-shrinkwrap.json"], allowRoot: true },
};

describe.skipIf(DORMANT)("checkLockfiles", () => {
  it("allows the authoritative root package-lock.json", () => {
    expect(guard.checkLockfiles(["package-lock.json"], cfg)).toEqual({ ok: true, offenders: [] });
  });

  it("flags a lockfile committed inside a package", () => {
    const r = guard.checkLockfiles(
      ["package.json", "packages/khai-methods/package-lock.json"],
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.offenders).toEqual(["packages/khai-methods/package-lock.json"]);
  });

  it("normalizes a leading ./ so ./package-lock.json reads as root", () => {
    expect(guard.checkLockfiles(["./package-lock.json"], cfg)).toEqual({ ok: true, offenders: [] });
  });

  it("polices every configured lockfile name, not just package-lock.json", () => {
    const r = guard.checkLockfiles(["packages/x/npm-shrinkwrap.json"], cfg);
    expect(r.ok).toBe(false);
    expect(r.offenders).toEqual(["packages/x/npm-shrinkwrap.json"]);
  });

  it("ignores non-lockfile paths (package.json, look-alike source files)", () => {
    const r = guard.checkLockfiles(
      ["packages/x/package.json", "src/package-lock.json.js", "a/b/yarn.lock"],
      cfg,
    );
    expect(r).toEqual({ ok: true, offenders: [] });
  });

  it("reports every offender, keeping their normalized paths", () => {
    const r = guard.checkLockfiles(
      ["packages/a/package-lock.json", "./packages/b/package-lock.json"],
      cfg,
    );
    expect(r.offenders).toEqual(["packages/a/package-lock.json", "packages/b/package-lock.json"]);
  });

  it("can forbid even the root lock when allowRoot is false", () => {
    const r = guard.checkLockfiles(["package-lock.json"], {
      lockfilePolicy: { lockfiles: ["package-lock.json"], allowRoot: false },
    });
    expect(r.ok).toBe(false);
    expect(r.offenders).toEqual(["package-lock.json"]);
  });

  it("defaults to just package-lock.json when lockfiles is omitted", () => {
    const r = guard.checkLockfiles(
      ["packages/x/package-lock.json", "packages/x/npm-shrinkwrap.json"],
      {
        lockfilePolicy: {},
      },
    );
    expect(r.offenders).toEqual(["packages/x/package-lock.json"]);
  });

  it("is a no-op when no lockfilePolicy is configured", () => {
    expect(guard.checkLockfiles(["packages/x/package-lock.json"], {})).toEqual({
      ok: true,
      offenders: [],
    });
  });
});

describe.skipIf(DORMANT || typeof guard.resolveConfig !== "function")(
  "resolveConfig lockfilePolicy validation",
  () => {
    it("accepts a well-formed lockfilePolicy", () => {
      expect(() =>
        guard.resolveConfig({
          lockfilePolicy: { lockfiles: ["package-lock.json"], allowRoot: true },
        }),
      ).not.toThrow();
    });

    it("rejects a non-object lockfilePolicy", () => {
      expect(() => guard.resolveConfig({ lockfilePolicy: [] })).toThrow(/lockfilePolicy/);
    });

    it("rejects a non-string entry in lockfiles", () => {
      expect(() => guard.resolveConfig({ lockfilePolicy: { lockfiles: [1] } })).toThrow(
        /lockfilePolicy\.lockfiles/,
      );
    });

    it("rejects a non-boolean allowRoot", () => {
      expect(() => guard.resolveConfig({ lockfilePolicy: { allowRoot: "yes" } })).toThrow(
        /lockfilePolicy\.allowRoot/,
      );
    });
  },
);
