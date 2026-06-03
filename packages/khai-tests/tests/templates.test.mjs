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
import { templates } from "@chbrain/khai-arch";
import { validateContentFile } from "../index.mjs";

describe("templates: every khai-arch template is a valid instance", () => {
  const entries = Object.entries(templates);

  it("the canon ships at least one template", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  for (const [type, tpl] of entries) {
    it(`${tpl.file} is a valid ${type} instance`, () => {
      expect(validateContentFile(tpl.text, { type })).toEqual([]);
    });
  }
});
