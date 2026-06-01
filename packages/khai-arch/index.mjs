// Machine-readable contract for the khai architecture, read at runtime from
// the canon's own type-definition files. The `.md` frontmatter is the single
// source of truth (and is mnemonic-locked by khai-arch's own tests), so this
// export can never drift from the definitions — there is no generated artifact
// to fall out of sync.
//
// Consumers (khai-tests, the configurator website) import `types` instead of
// re-parsing markdown, collapsing N drift points to zero.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import matter from "gray-matter";

const here = dirname(fileURLToPath(import.meta.url));
const archDir = join(here, "architecture");

/**
 * @typedef {Object} KhaiType
 * @property {string} id        canonical slug, equals the `khai:` value instances declare
 * @property {"house"|"element"|"meta"} class
 * @property {string} mnemonic
 * @property {string[]} chapters  required `## <chapter>` sections, in canonical order
 * @property {string} subtitle
 */

/** @type {Record<string, KhaiType>} */
export const types = Object.fromEntries(
  readdirSync(archDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter(readFileSync(join(archDir, f), "utf8")).data)
    .filter((d) => d && typeof d.id === "string" && Array.isArray(d.chapters))
    .map((d) => [
      d.id,
      {
        id: d.id,
        class: d.class,
        mnemonic: d.mnemonic,
        chapters: d.chapters,
        subtitle: d.subtitle,
      },
    ]),
);

/**
 * The playbook spine, owned by the canon. model.md declares the ordered groups
 * (each an ordered list of type ids) in a `groups` yaml block; this reads it so
 * consumers render the playbook instead of re-declaring its order or grouping.
 * Parsed via gray-matter by wrapping the block as frontmatter -- no extra yaml
 * dependency.
 * @type {{ id: string, label: string, members: string[] }[]}
 */
const modelText = readFileSync(join(archDir, "model.md"), "utf8");
const groupsBlock = modelText.match(/```ya?ml\n([\s\S]*?)```/);
export const playbook = groupsBlock
  ? (matter(`---\n${groupsBlock[1]}---\n`).data.groups ?? [])
  : [];

/** Required `## ` section headers for a type id, in canonical order. */
export function chaptersFor(typeId) {
  return types[typeId]?.chapters ?? null;
}

export default { types, chaptersFor, playbook };
