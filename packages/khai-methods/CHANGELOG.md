# @chbrain/khai-methods

## 0.0.3

### Patch Changes

- fb56e30: Add a `khai.tagline` to package.json, a house-voice one-line description of the methods registry, so a consumer surface prints it verbatim instead of authoring its own copy.

## 0.0.2

### Patch Changes

- 0f535fc: Initial release — khai methods registry with `listMethods()`, `loadMethod()`, `listMethodsByType()`. Ships three retrospective formats: 4 L's (Gorman & Gottesdiener), Starfish (Kua), Start/Stop/Continue.
- 25838bb: License alignment: declare the package under the repo dual-license (content + code) instead of MIT, since it ships method definitions as content. Drop the per-method `license` frontmatter field — methods are ideas (not copyrightable); provenance lives in `invented_by` and `source`.
