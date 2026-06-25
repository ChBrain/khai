# @chbrain/khai-methods

## 0.0.6

### Patch Changes

- 36e80b7: Migrate js-yaml to v5 in methods lane (3/4). js-yaml 5 removed the default export; switched to namespace import `import * as yaml` and bumped the dependency to ^5.1.0 in @chbrain/khai-methods.

## 0.0.5

### Patch Changes

- 2b9a57e: registry: parse frontmatter with js-yaml 4.2.0 instead of gray-matter

  parseMethod now splits frontmatter with a small built-in parser on js-yaml 4.2.0
  rather than gray-matter, dropping gray-matter and its js-yaml 3.x (exposed to
  the merge-key DoS GHSA-h67p-54hq-rp68). Self-contained; behaviour unchanged.

## 0.0.4

### Patch Changes

- 253ba83: Method prose now follows the repo-wide house voice (no em/en-dashes): the
  Starfish retrospective's prompt questions used em-dashes as clause separators;
  they are recast with parentheses. A test guards the rule across every method
  (name, prompts, body), mirroring the STYLE_DENYLIST the skills side enforces, so
  a dash can no longer slip into a surface that renders method prose verbatim.
- 32a4fed: parseMethod now honors its documented "returns null on parse error rather than
  throwing" contract. It called gray-matter with no try/catch, so a single method
  file with malformed YAML frontmatter threw a YAMLException that propagated
  through listMethods / loadMethod / listMethodsByType, taking down the entire
  registry API instead of dropping the one bad file via .filter(Boolean). Wrap
  the read and parse so a bad file returns null and is skipped.

## 0.0.3

### Patch Changes

- fb56e30: Add a `khai.tagline` to package.json, a house-voice one-line description of the methods registry, so a consumer surface prints it verbatim instead of authoring its own copy.

## 0.0.2

### Patch Changes

- 0f535fc: Initial release — khai methods registry with `listMethods()`, `loadMethod()`, `listMethodsByType()`. Ships three retrospective formats: 4 L's (Gorman & Gottesdiener), Starfish (Kua), Start/Stop/Continue.
- 25838bb: License alignment: declare the package under the repo dual-license (content + code) instead of MIT, since it ships method definitions as content. Drop the per-method `license` frontmatter field — methods are ideas (not copyrightable); provenance lives in `invented_by` and `source`.
