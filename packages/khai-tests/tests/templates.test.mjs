// The canon ships one authoring template per type (in khai-arch/templates/).
// A template is an asset the builder fills and the kit tests against, so it must
// itself be a valid content instance. This closes the loop: the kit proves the
// template, the template feeds the kit's notion of "a valid <type>".
//
// Validated with no `owner` (the Owner section is required, its placeholder
// values are not pinned), so the check is structural: frontmatter, H1, the
// exact `["Taxonomy","Owner",...chapters]` H2 set in order (the T slot is the
// group above, not a re-name of the H1), encoding, extensions.

import { describe, it, expect } from "vitest";
import { templates, types } from "@chbrain/khai-arch";
import { validateContentFile } from "../index.mjs";

// The classes an author instantiates, and so the classes that must have a
// skeleton to start from. `meta` is left out on purpose and the asymmetry is
// real rather than an oversight: `architecture`, `engines`, `instructions`,
// `order` and `repertoire` describe the architecture rather than being cast
// from it, and `plan` ships a template without being asked to by this rule.
const AUTHORED_CLASSES = ["element", "house"];

describe("templates: every khai-arch template is a valid instance", () => {
  const entries = Object.entries(templates);

  it("the canon ships at least one template", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  // The check the suite was missing: it proved every template SUPPLIED was
  // valid and never that one existed per type, so `performance` sat as the only
  // element type with no skeleton until someone read the README and counted
  // (#1564). A wall that only inspects what it was handed reports on the
  // author's diligence, not on the canon.
  it("ships a template for every element and house type", () => {
    const authored = Object.entries(types)
      .filter(([, t]) => AUTHORED_CLASSES.includes(t.class))
      .map(([id]) => id)
      .sort();
    // Read against the type table rather than a list written here: a type added
    // to the canon with no skeleton fails this without anyone remembering to
    // edit a test.
    expect(authored.length).toBeGreaterThan(0);
    const missing = authored.filter((id) => !(id in templates));
    expect(
      missing,
      missing.length
        ? `No templates/template_<type>.md for: ${missing.join(", ")}. An author of ` +
            "one of these has nothing stamped to start from and must work from the " +
            "architecture doc, which is what the templates export exists to prevent. " +
            "Write the skeleton from architecture/<type>.md; the test above proves it valid."
        : undefined,
    ).toEqual([]);
  });

  for (const [type, tpl] of entries) {
    it(`${tpl.file} is a valid ${type} instance`, () => {
      expect(validateContentFile(tpl.text, { type })).toEqual([]);
    });
  }
});
