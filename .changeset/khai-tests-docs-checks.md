---
"@chbrain/khai-tests": patch
---

Add structural rule atoms for the engine docs standard (not yet wired into
`validateEnginePackage` - they land with the severity dimension so they can ramp
from advisory to fail without breaking installed engines):

- `rules.checkLinkText(text)` - a link's text is read literally by an LLM, so it
  must be a natural name, never a filename. Flags empty link text and any label
  that ends in a file extension or equals the target's basename
  (`[position_gender.md](...)` fails; `[gender](position_gender.md)` passes).
- `rules.looseFiles(files)` - the "no file hangs loose" check (the Obsidian
  graph): given `[{ name, text }]`, returns the files with no markdown-link edge
  to any other file in the set. Backtick mentions are not edges, which is why
  REFERENCES must _link_ the member files, not name them in backticks.
- `rules.checkClauseDash(text)` - the spaced hyphen " - " is the LLM's em-dash in
  disguise, not the house voice ( , ; : () ). Flags the inline clause dash while
  exempting line-start list markers (`*` and `-`) and `---` fences. (em/en-dash
  stay in `checkEncoding`.)
- `rules.checkNoFooter(text)` - flags a trailing `_..._` version/attribution
  stamp; metadata belongs in YAML frontmatter, not a footer.
- `rules.checkHasFrontmatter(text)` - a doc whose metadata must be machine-
  readable needs a leading `---` YAML block, not a `**Bold:**` header.
