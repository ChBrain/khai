#!/usr/bin/env node
// release-token: will RELEASE_TOKEN still be able to run a release.
//
// Every khai house releases through a RELEASE_TOKEN secret, a personal access
// token the changesets action uses to push the version branch and open the
// Version PR (see .github/workflows/release.yml). A PAT can expire, and a
// fine-grained PAT can lose a repository it used to cover, silently: nothing
// about that failure is visible until the release step itself goes red, and
// by then a release is already missing. This script does not run a release.
// It reads what the GitHub API says the token can currently do -- who it
// authenticates as, when it stops working, and whether it can reach this
// repository and every house on the bill -- and reports that ahead of time.
//
// What this proves and what it does not: the API's `permissions` object on a
// repository (pull/push/admin) is GitHub's own account of what the token may
// do there, read at the moment this script runs. It is not a rehearsal of a
// release and it does not catch an API-level restriction outside those three
// permissions (an organization SAML gate, a temporarily suspended app
// installation, a branch-protection rule the token's identity cannot satisfy).
// A 404 on a repository is recorded as "unreachable": for a fine-grained PAT
// that is exactly what a repository outside the token's selected access looks
// like, indistinguishable at this API from the repository not existing. The
// true test of a release is the release; this is the instrument that says a
// token will not be able to run one, not a guarantee that it will.
//
// The token itself is never printed and no response header that carries it is
// ever echoed -- only the login and the expiration date derived from it.
//
// Usage:
//   node scripts/release-token.mjs          # this repo + every house on the bill
//   node scripts/release-token.mjs --json    # machine-readable rows

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadRegistry } from "@chbrain/khai-plays";

const GITHUB_API = "https://api.github.com";
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");

/** A `repo` card field ("https://github.com/<owner>/<repo>") to its two parts. */
export function ownerRepoFromUrl(repoUrl) {
  const m = /^(?:https?:\/\/|git\+https:\/\/)?github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(
    String(repoUrl ?? ""),
  );
  return m ? { owner: m[1], repo: m[2] } : null;
}

/** This repository's own owner/repo, read from package.json's `repository.url`
 * rather than written by hand -- the one line that would otherwise be a house
 * name typed into code. */
export function selfOwnerRepo(root = repoRoot) {
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const url =
    typeof manifest.repository === "string" ? manifest.repository : manifest.repository?.url;
  const parsed = ownerRepoFromUrl(url);
  if (!parsed)
    throw new Error("release-token: could not read this repository's owner/repo from package.json");
  return parsed;
}

/**
 * Who the token authenticates as, and when it expires. Reads
 * `github-authentication-token-expiration`, the header GitHub sets on a
 * response authenticated with a token that carries an expiry (present on
 * fine-grained PATs and classic PATs given an expiration; absent on a
 * non-expiring classic PAT or an app installation token). Never reads or
 * returns the token itself, and never returns a raw header object -- only the
 * two derived fields a caller needs.
 *
 * @param {string} token
 * @returns {Promise<{ok: true, login: string, expiresAt: string|null, daysLeft: number|null} | {ok: false, status: number}>}
 */
export async function authenticate(token) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "khai-release-token",
    },
  });
  if (!res.ok) return { ok: false, status: res.status };
  const body = await res.json();
  const expiresAt = res.headers.get("github-authentication-token-expiration") || null;
  const daysLeft = expiresAt
    ? Math.floor((Date.parse(expiresAt) - Date.now()) / (24 * 60 * 60 * 1000))
    : null;
  return { ok: true, login: body.login, expiresAt, daysLeft };
}

/**
 * What the token's `permissions` say it may do on one repository. A 404 means
 * the token does not reach the repository at all -- either it does not exist,
 * or (the case this exists to catch) a fine-grained token's selected
 * repository access does not cover it. Both look identical at this API, so
 * both are recorded as "unreachable" rather than guessed apart.
 *
 * @param {string} owner
 * @param {string} repo
 * @param {string} token
 * @returns {Promise<{owner:string, repo:string, reach:"reachable"|"unreachable", pull:boolean|null, push:boolean|null, admin:boolean|null}>}
 */
export async function checkRepo(owner, repo, token) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "khai-release-token",
    },
  });
  if (!res.ok) {
    return { owner, repo, reach: "unreachable", pull: null, push: null, admin: null };
  }
  const body = await res.json();
  const perms = body.permissions || {};
  return {
    owner,
    repo,
    reach: "reachable",
    pull: perms.pull ?? null,
    push: perms.push ?? null,
    admin: perms.admin ?? null,
  };
}

/** @param {{owner:string, repo:string, reach:string, pull:boolean|null, push:boolean|null}} r */
function renderRepoRow(r) {
  const mark = (b) => (b === null ? "unknown" : b ? "yes" : "no");
  return `| ${r.owner}/${r.repo} | ${r.reach} | ${mark(r.pull)} | ${mark(r.push)} |`;
}

/** @param {{login:string, expiresAt:string|null, daysLeft:number|null}} auth */
function renderHeader(auth) {
  if (!auth.expiresAt) return `Authenticated as \`${auth.login}\`. Token does not expire.`;
  const warn = auth.daysLeft !== null && auth.daysLeft < 30 ? " (warning: under 30 days left)" : "";
  return `Authenticated as \`${auth.login}\`. Expires ${auth.expiresAt} (${auth.daysLeft} days left)${warn}.`;
}

async function main() {
  const args = process.argv.slice(2);
  const json = args.includes("--json");

  const token = process.env.RELEASE_TOKEN;
  if (!token) {
    console.error("release-token: RELEASE_TOKEN is not set");
    process.exit(2);
  }

  const auth = await authenticate(token);
  if (!auth.ok) {
    console.error(`release-token: authentication failed (status ${auth.status})`);
    process.exit(2);
  }

  const targets = [selfOwnerRepo()];
  for (const house of loadRegistry()) {
    const parsed = ownerRepoFromUrl(house.repo);
    if (parsed) targets.push(parsed);
  }

  const rows = [];
  for (const t of targets) {
    rows.push(await checkRepo(t.owner, t.repo, token));
  }

  if (json) {
    console.log(
      JSON.stringify(
        { login: auth.login, expiresAt: auth.expiresAt, daysLeft: auth.daysLeft, rows },
        null,
        2,
      ),
    );
    return;
  }

  console.log(renderHeader(auth));
  console.log("");
  console.log("| repo | reach | pull | push |");
  console.log("| --- | --- | --- | --- |");
  for (const r of rows) console.log(renderRepoRow(r));
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error(`release-token: ${err.message}`);
    process.exit(1);
  });
}
