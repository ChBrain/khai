/**
 * khai-tour compose: assemble the deployed instructions for a Venue.
 *
 * The deployed contract is a computed artifact: the Prose Standard, with engines
 * injected at Knowledge and the shared house rules + the Venue adaption injected
 * at System. The H1 title is dropped (the deployed contract is chapters only).
 *
 * Fixture stage: HOUSE_RULES and VENUE_ADAPTIONS live here so the compose logic
 * can be proven against the known-good Perplexity output. The real fix relocates
 * the adaptions into spine (spine/<venue>/) and reads the Standard from the spine
 * package; this function's signature (pure: standard in, instructions out) does
 * not change.
 */

/** Shared, runtime-output house rules, injected into every deployed System. */
export const HOUSE_RULES = ["no em-dash / no en-dash / no dash in prose text."];

/** Per-Venue adaptions (interim fixtures; relocating to spine/<venue>/). */
export const VENUE_ADAPTIONS = {
  perplexity_space: ["no Follow-Up Questions"],
};

const bullets = (items) => items.map((i) => `- ${i}`).join("\n");

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
  let out = standard.replace(/^#[ \t]+[^\n]*\r?\n+/, ""); // drop the H1 title

  // Knowledge <- engines (each declares its law), appended under the chapter.
  if (engines.length) {
    out = out.replace(
      /(## Knowledge\r?\n\r?\n(?:- [^\n]*\r?\n)*)/,
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
