# @chbrain/khai-language

## 0.1.6

### Patch Changes

- ebe5195: detector: register the reliably-detected European languages

  Adds the European languages languagedetect identifies as the top hit on real
  prose to `ISO_MAP`, so each can be declared (`language: <code>`) and gated
  locally like the original four: nl, it, es, pt, sv, no, fi, is, pl, hu, ro, hr,
  sk, sl, sq, lt, lv, et (joining en, de, fr, da). Cyrillic (ru/uk/sr/mk/bg), the
  czech<->slovak pair on the czech side, turkish, and languages languagedetect
  does not model (greek, catalan, ...) are intentionally left off local detection
  — they would false-fail a per-paragraph gate and stay on the NLP/franc path
  (LANGUAGES.md). A per-language acceptance test covers the set.

## 0.1.5

### Patch Changes

- 5e09ede: detector: register Italian (it)

  Adds `it: "italian"` to `ISO_MAP`, so a culture can declare `language: it` and
  have its prose gated by the local detector — languagedetect already recognises
  Italian, so no NLP fallback or extra detector is needed (unlike Low German).
  English (or other) spans in an Italian house are still flagged.

## 0.1.4

### Patch Changes

- 323b66b: detector: parse frontmatter with js-yaml 4.2.0 instead of gray-matter

  resolveLanguage now splits frontmatter with a small built-in parser on js-yaml
  4.2.0 rather than gray-matter, dropping gray-matter and its js-yaml 3.x (exposed
  to the merge-key DoS GHSA-h67p-54hq-rp68). Self-contained; behaviour unchanged.

## 0.1.3

### Patch Changes

- bba3d28: cleanProse now strips a line-start `*` or `+` list marker as a marker (with its
  trailing space), not one character at a time. The alternation tried the inline
  char class before the bullet branch, so only `-` bullets were fully stripped;
  `*`/`+` left a stray space. Reordered so the bullet branch matches first. Affects
  only the text fed to language detection, so detection results are unchanged.
- 113d2d6: Add support for declared titles in playbooks, allowing a localized staging H1 title to match a `declared` frontmatter key while keeping `title` in English for the registry.
- de6ab9b: findPlayFile now stays within the project by comparing paths, not by a raw
  `current.startsWith(root)`. The string prefix check treated a sibling directory
  that shares root's textual prefix (e.g. validating a file under `<root>2` with
  projectPath `<root>`) as in-scope, so it could walk a foreign directory and
  resolve a play's language from another project. It now stops as soon as the
  walked directory is outside root (`relative(root, current)` escapes with `..`).
- 272d1dc: The "which markdown is language-checked" policy is now single-sourced. The skip
  list (CHANGELOG, README, REFERENCES — infra, not content) lived in two places
  with different rules: findProjectMarkdownFiles excluded only CHANGELOG, while
  validateProjectLanguages separately skipped README/REFERENCES by basename. Both
  now flow through one NON_CONTENT_MD set in the discovery walk, so the two can't
  diverge. Behavior is unchanged (those files were skipped before and still are).
- 5c0d150: validateLanguageOfFile now normalizes the configured nlpLanguages through the
  same ISO map it uses for the resolved language, so an entry given as an ISO code
  (e.g. "fr") matches the normalized resolved language ("french") and actually
  routes to the NLP/LLM fallback. Previously the codes were only lowercased, so
  "fr" could never match "french" and the local detector ran anyway — the
  opposite of the intent of declaring the language NLP-handled.

## 0.1.2

### Patch Changes

- 6225576: Register French (`fr`) as a natively supported language in the ENACTS language detector.
- 6225576: Resolve nlpLanguages dynamically from package.json#khai.languages if not explicitly provided.

## 0.1.1

### Patch Changes

- 7aa9796: Register French (`fr`) as a natively supported language in the ENACTS language detector.

## 0.1.0

### Minor Changes

- 9a60b72: governance: add new @chbrain/khai-language package with JS-native language validation engine.
