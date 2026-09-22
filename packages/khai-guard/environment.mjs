// What this machine is, asked once, so nothing after it has to guess.
//
// This module is deliberately a LEAF: node builtins and nothing else, no import
// of index.mjs, no dependency from package.json. That is not tidiness, it is the
// whole point. AGENTS.md asks an agent to run the environment report "before
// your first shell command", and the two obvious ways to run it both fail on a
// fresh clone: `npx khai-guard` resolves the UNSCOPED name and npmjs returns 404
// (this package is `@chbrain/khai-guard`), and the CLI's own entry imports
// picomatch, so node cannot load it before `npm ci` either. A report about what
// the machine is, that can only run once the machine is set up, answers the
// question after the moment it was asked.
//
// So this file runs on its own with zero install:
//
//   node packages/khai-guard/environment.mjs
//
// index.mjs re-exports both functions, so `import { npmSpawn, renderEnvironment }
// from "@chbrain/khai-guard"` is unchanged for every existing caller.

import { mkdtempSync, mkdirSync, symlinkSync, rmSync } from "node:fs";
import { join, sep } from "node:path";
import { tmpdir, EOL } from "node:os";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * How to spawn npm, asked in the order that costs least to be wrong about.
 *
 * FIRST, what npm already told us. Under `npm run` and under `npx` -- which is
 * every path this repo uses, including the pre-push hook -- npm sets
 * `npm_execpath` to its own CLI, a plain `.js` file, and `npm_node_execpath` to
 * the node that should run it. Spawning `node <npm-cli.js>` is identical on every
 * operating system: no `.cmd` shim, no shell, no platform branch, nothing to be
 * wrong about.
 *
 * That is the whole correction here. Two releases went into guessing what `npm`
 * resolves to -- a bare name, then `npm.cmd`, then `npm.cmd` with a shell --
 * while npm was holding the answer in an environment variable the entire time.
 * A contributor was blocked for a day by a question the environment had already
 * answered and nobody asked.
 *
 * SECOND, and only when npm did not run us, the platform guess. It is still
 * right as far as anyone knows, and it is labelled `platform-guess` in the
 * returned `via` so a caller and the `environment` report can say which answer
 * they got. A fallback that cannot be told apart from a fact is how the first
 * version of this survived.
 *
 * @param {string[]} args        the npm arguments, without "npm"
 * @param {object} [env]         defaults to process.env
 * @param {string} [platform]    defaults to the host's
 * @returns {{ file: string, args: string[], shell: boolean, via: "npm_execpath"|"platform-guess" }}
 */
export function npmSpawn(args = [], env = process.env, platform = process.platform) {
  const cli = env?.npm_execpath;
  if (typeof cli === "string" && cli.endsWith(".js"))
    return {
      file: env.npm_node_execpath || process.execPath,
      args: [cli, ...args],
      shell: false,
      via: "npm_execpath",
    };
  return platform === "win32"
    ? { file: "npm.cmd", args: [...args], shell: true, via: "platform-guess" }
    : { file: "npm", args: [...args], shell: false, via: "platform-guess" };
}

/**
 * The environment report, rendered from facts the caller gathered.
 *
 * Pure so the wording is testable without a machine to be on, and so the two
 * uncertain rows can be phrased as signals rather than verdicts. A Node process
 * cannot reliably know which shell invoked it: ComSpec is always set on Windows,
 * PSModulePath survives into child processes, and git-bash sets SHELL on Windows
 * too. Printing "shell: PowerShell" confidently when it is git-bash would be a
 * fresh instance of the disease this report exists to cure, so the shell row
 * prints what was observed and the dialect row prints an implication marked as
 * one.
 *
 * @param {object} facts
 * @returns {string[]} lines, ready to print
 */
export function renderEnvironment(facts = {}) {
  const {
    platform = "?",
    arch = "?",
    userAgent = null,
    npmVia = "platform-guess",
    npmFile = "?",
    nodeVersion = "?",
    shellSignals = [],
    pathSep = "?",
    eol = "?",
    dirSymlink = "untested",
  } = facts;
  const win = platform === "win32";
  // Node 24 deprecates passing args alongside `shell: true` (DEP0190), which is
  // exactly what the platform guess has to do on Windows. The tier-1 answer --
  // node running npm's own .js CLI -- needs no shell at all, so it is not merely
  // tidier: it is the only spawn here with a future. Surfaced by a Windows run on
  // Node 24.13.1 that passed while printing the warning; this machine's Node 22
  // does not emit it, so nobody here would have seen it.
  const deprecated = npmVia !== "npm_execpath" && win;
  return [
    `platform          ${platform} ${arch}`,
    `node              ${nodeVersion}`,
    `npm reports       ${userAgent ?? "(not running under npm; run this through `npx` or `npm run`)"}`,
    `npm spawns as     ${npmFile}${npmVia === "npm_execpath" ? "  (npm told us)" : "  (GUESSED from platform)"}`,
    `path separator    ${JSON.stringify(pathSep)}`,
    `line ending       ${JSON.stringify(eol)}`,
    `directory symlink ${dirSymlink}`,
    `shell signals     ${shellSignals.length ? shellSignals.join(", ") : "(none)"}`,
    "",
    ...(deprecated
      ? [
          "NOTE: npm is being spawned through a shell because npm did not start this",
          "process. Node 24 deprecates that (DEP0190). Run this through `npx` or",
          "`npm run` and npm will say how to reach it, which needs no shell.",
          "",
        ]
      : []),
    `SHELL DIALECT: probably ${win ? "PowerShell or cmd" : "a POSIX shell"}. This row is an`,
    `INFERENCE, not a fact -- a process cannot see which shell started it. Check the`,
    `signals above before assuming, and prefer a command that works in both.`,
    "",
    win
      ? "On this platform `grep`, `sed`, `rm` and `ls` may not exist. Prefer node -e,"
      : "On this platform PowerShell cmdlets do not exist. Prefer POSIX tools or node -e,",
    "which runs the same everywhere and is already a dependency of this repo.",
  ];
}

/**
 * Gather the facts this machine will admit to and print the report.
 *
 * Three tiers, in the order that costs least to be wrong about: what the
 * environment already DECLARED (npm sets npm_execpath and a user agent naming
 * the OS), then what can be TESTED (try a directory symlink and see), and only
 * then what must be ASSUMED from the platform. Every fix this kit shipped for
 * Windows started at the third tier and never looked at the first.
 *
 * @param {{ log?: (line: string) => void }} [io]
 */
export function reportEnvironment({ log = console.log } = {}) {
  const ua = process.env.npm_config_user_agent ?? null;
  const npm = npmSpawn([]);

  // Tier 2, and it must be a probe rather than a platform branch: Windows WITH
  // Developer Mode or an elevated shell can create a directory symlink, so
  // "win32 cannot" is an assertion the machine may contradict.
  let dirSymlink = "untested";
  try {
    const dir = mkdtempSync(join(tmpdir(), "khai-env-"));
    try {
      mkdirSync(join(dir, "src"));
      symlinkSync(join(dir, "src"), join(dir, "link"), "dir");
      dirSymlink = "yes";
    } catch (err) {
      dirSymlink = `no (${err.code ?? "failed"}) -- use "junction" on this machine`;
    }
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // no temp dir is a finding about the machine, not about symlinks
  }

  const signals = [];
  for (const k of ["SHELL", "ComSpec", "PSModulePath", "MSYSTEM", "TERM_PROGRAM"])
    if (process.env[k]) signals.push(`${k}=${k === "PSModulePath" ? "(set)" : process.env[k]}`);

  log("KHAI-Guard environment:\n");
  for (const line of renderEnvironment({
    platform: process.platform,
    arch: process.arch,
    userAgent: ua,
    npmVia: npm.via,
    npmFile: npm.via === "npm_execpath" ? `${npm.file} ${npm.args[0]}` : npm.file,
    nodeVersion: process.version,
    shellSignals: signals,
    pathSep: sep,
    eol: EOL,
    dirSymlink,
  }))
    log(line ? `  ${line}` : "");
}

const isMain = (() => {
  try {
    return (
      process.argv[1] &&
      realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
})();
if (isMain) reportEnvironment();
