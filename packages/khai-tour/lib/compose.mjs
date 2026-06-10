/**
 * khai-tour compose: assemble the deployed instructions for a Venue.
 *
 * The deployed contract is a computed artifact: the Prose Standard, with engines
 * injected at Knowledge and the shared house rules + the Venue adaption injected
 * at System. The H1 title is dropped (the deployed contract is chapters only).
 *
 * The Standard, the House Rules and the Venue adaptions are read live from
 * @chbrain/khai-engine-spine (spine owns the content). `composeInstructions`
 * stays pure (standard in, instructions out) so it can be proven against the
 * known-good Perplexity output; `composeVenue` is the thin layer that feeds it
 * the live spine content for a named Venue.
 */

import {
  instructions as proseStandard,
  houseRules as houseRulesFragment,
  adaptions,
} from "@chbrain/khai-engine-spine";

const bullets = (items) => items.map((i) => `- ${i}`).join("\n");

/** Extract the bullets under a fragment's `## System` heading. The house-rules
 * and adaption fragments are authored as chapter-targeted markdown; compose
 * needs them as a plain list of System rules. Line-based, so no regex
 * backtracking: the per-line patterns are anchored and non-nested. */
function systemBullets(fragment) {
  const lines = (fragment ?? "").split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === "## System");
  if (start === -1) return [];
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break; // the next chapter ends the System section
    const m = /^- (.+)$/.exec(line);
    if (m) out.push(m[1].trim());
  }
  return out;
}

/**
 * Compose the deployed instructions for a Venue.
 *
 * @param {string} standard - the Prose Standard body (frontmatter already stripped)
 * @param {{ houseRules?: string[], adaption?: string[], engines?: string[] }} [opts]
 * @returns {string} the deployed instructions, chapters only
 */
export function composeInstructions(
  standard,
  { houseRules = [], adaption = [], engines = [] } = {},
) {
  // Drop the H1 title. Use a single [ \t] (not [ \t]+): a quantified [ \t]+
  // beside [^\r\n]* both match spaces, so a run of spaces backtracks O(n)
  // (CodeQL polynomial-regex). [^\r\n] (not [^\n]) likewise keeps \r out of the
  // class so it cannot overlap the following \r?.
  let out = standard.replace(/^#[ \t][^\r\n]*\r?\n+/, "");

  // Knowledge <- engines (each declares its law), appended under the chapter.
  if (engines.length) {
    out = out.replace(
      /(## Knowledge\r?\n\r?\n(?:- [^\r\n]*\r?\n)*)/,
      (block) => `${block}${bullets(engines)}\n`,
    );
  }

  // System <- shared house rules + the Venue adaption, under the heading.
  const system = [...houseRules, ...adaption];
  if (system.length) {
    out = out.replace(/## System\r?\n\r?\n/, `## System\n\n${bullets(system)}\n\n`);
  }

  return `${out.trimEnd()}\n`;
}

/**
 * Compose the deployed instructions for a Venue from live spine content: the
 * Prose Standard, the shared House Rules, and the Venue's adaption (keyed by its
 * spine folder, e.g. `perplexity`), with optional engines injected at Knowledge.
 *
 * @param {string} venue - the spine adaption folder name (e.g. "perplexity")
 * @param {{ engines?: string[] }} [opts]
 * @returns {string} the deployed instructions, chapters only
 */
export function composeVenue(venue, { engines = [] } = {}) {
  return composeInstructions(proseStandard, {
    houseRules: systemBullets(houseRulesFragment),
    adaption: systemBullets(adaptions[venue]),
    engines,
  });
}
