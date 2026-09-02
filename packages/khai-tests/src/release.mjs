// The release workflow calls what changesets/action v2 actually reads.
//
// The khai monorepo's release was down for four consecutive runs and nothing
// said so: a dependabot bump moved it to changesets/action v2, which RENAMED
// its inputs (`version` -> `version-script`, `publish` -> `publish-script`) and
// refuses to run under the old names rather than falling back. `npm test`
// stayed green in every failed run, because the failure sits in the last step
// of a job whose visible work all passes, and the only downstream symptom is
// that a release does not appear. Two houses raised from this monorepo wrote
// the same test by hand afterward, word for word -- the case below is theirs,
// ported rather than repeated a third time.
//
// The input NAMES are what is pinned, not merely the scripts they name, because
// the name is the load-bearing half: under the wrong one the action does not
// degrade, it refuses. A house's own `version`/`release` npm scripts can be
// named anything; what breaks under a rename is the workflow forgetting which
// input carries which, so both are checked -- the workflow names real scripts,
// and the scripts still exist.
//
// The action's second break only becomes visible after the first is fixed: it
// carries a `github-token` input defaulting to the built-in token, and refuses
// to run when a `GITHUB_TOKEN` env var is set to something else beside it. So
// that check is scoped to the changesets step alone -- the workflow's `install`
// step is entitled to a `GITHUB_TOKEN` of its own (`npm ci` reaching GitHub
// Packages needs one), and a whole-file assertion about one step's environment
// is the wrong claim however right it looks.
//
// Deliberately NOT pinned: `push-with-git-cli`. A house that ships no
// executable CLI entry points never meets v2's API-only file-write path, and
// copying a pin that is right for a house that does is how the wrong thing gets
// asserted with confidence.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_WORKFLOW = ".github/workflows/release.yml";
const ACTION_MARKER = "changesets/action@";

/**
 * Findings against a house's release workflow. `[]` is clean; a missing
 * workflow, or one that never invokes `changesets/action`, is a finding rather
 * than a silent pass -- there is nothing to check a script name against when
 * there is no step to read it from.
 *
 * @param {string} root
 * @param {{workflow?: string}} [opts] `workflow` overrides the default path,
 *   relative to `root` -- a house whose release lives elsewhere names it.
 * @returns {{reason: string}[]}
 */
export function verifyRelease(root, { workflow = DEFAULT_WORKFLOW } = {}) {
  const path = join(root, workflow);
  if (!existsSync(path)) {
    return [{ reason: `no workflow at ${workflow}` }];
  }
  const wf = readFileSync(path, "utf8");
  const actionAt = wf.indexOf(ACTION_MARKER);
  if (actionAt === -1) {
    return [{ reason: `${workflow} never invokes changesets/action` }];
  }
  const step = wf.slice(actionAt);
  const findings = [];

  if (!/version-script:\s*npm run (\S+)/.test(step)) {
    findings.push({
      reason: 'the changesets step does not pass "version-script:" naming an npm script',
    });
  } else {
    const [, script] = step.match(/version-script:\s*npm run (\S+)/);
    const scripts = readScripts(root);
    if (typeof scripts[script] !== "string") {
      findings.push({
        reason: `version-script names "${script}", which is not in package.json scripts`,
      });
    }
  }

  if (!/publish-script:\s*npm run (\S+)/.test(step)) {
    findings.push({
      reason: 'the changesets step does not pass "publish-script:" naming an npm script',
    });
  } else {
    const [, script] = step.match(/publish-script:\s*npm run (\S+)/);
    const scripts = readScripts(root);
    if (typeof scripts[script] !== "string") {
      findings.push({
        reason: `publish-script names "${script}", which is not in package.json scripts`,
      });
    }
  }

  if (!/github-token:\s*\$\{\{\s*secrets\./.test(step)) {
    findings.push({
      reason: 'the changesets step does not pass "github-token:" from a repository secret',
    });
  }
  if (/^\s*GITHUB_TOKEN:/m.test(step)) {
    findings.push({
      reason:
        'the changesets step sets a GITHUB_TOKEN env var beside "github-token:" -- the action ' +
        "reads the input, and an env token beside it silently wins and is the wrong token",
    });
  }

  return findings;
}

function readScripts(root) {
  try {
    return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts ?? {};
  } catch {
    return {};
  }
}

/** Render findings for a terminal. Pure: findings in, text out. */
export function renderRelease(findings) {
  if (!findings.length) {
    return "khai-tests release verify: the release workflow calls this house's own scripts.";
  }
  const lines = [`khai-tests release verify: ${findings.length} finding(s).`, ""];
  for (const f of findings) lines.push(`  - ${f.reason}`);
  return lines.join("\n");
}
