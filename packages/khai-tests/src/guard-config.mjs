// Where a root's khai-guard.config.json actually is.
//
// The policy loaders used to read `join(root, "khai-guard.config.json")` and
// return empty policies when it was absent. That is correct while every house
// keeps its content beside its config, and it goes quietly wrong the day a
// house takes khai's workspace shape: the content root moves down into
// packages/<house>, the config stays at the repository root because lanes are
// a repository-level fact, and every policy the house declared -- its canon,
// its contrast and support vocabulary, its scholar homonyms -- silently
// becomes a default. Loud symptoms, wrong diagnosis: the namesake wall would
// report declarations missing that are sitting one directory up, read by
// nothing.
//
// So the config is resolved the way instructions.mjs already resolves an
// installed package: walk up from the root until found. Nearest wins, as a
// whole file -- a package that carries its own config keeps exactly that
// config, with no key-level inheritance from one above, because a merged
// policy is a computation no file on disk shows and a maintainer reading the
// nearer file would be reading the wrong policy.

import { existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

/**
 * The nearest khai-guard.config.json at or above `root`, or null.
 *
 * Null is not an error: a house with no config anywhere runs on the kit's
 * defaults, exactly as before.
 *
 * @param {string} root
 * @returns {string|null}
 */
export function findGuardConfig(root) {
  let dir = resolve(root);
  for (;;) {
    const candidate = join(dir, "khai-guard.config.json");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}
