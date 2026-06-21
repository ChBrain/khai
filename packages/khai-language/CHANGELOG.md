# @chbrain/khai-language

## 0.1.9

### Patch Changes

- 4cd9e11: Add Commonwealth language coverage to the franc tier: Tamil, Telugu, Gujarati,
  Punjabi, Sinhala, Igbo, Afrikaans, Zulu, Xhosa, Malay, Maori, Fijian, Samoan,
  and Tongan. Each gates on its own native prose (verified one sample per language
  in the franc-routes test); the Nguni pair (Zulu/Xhosa) sits within the 0.1
  margin and gates at the gross-error grade, and Malay routes to franc's `zlm`.
- ff6cf4a: Promote Czech from exempt to a gating language. Re-examining the "exempt"
  verdict under the 0.1 margin showed Czech was simply on the wrong engine: franc
  occasionally misreads it outright (one sample read as French), but languagedetect
  only ever confuses it with its Slovak sibling — always within the margin. Routed
  through languagedetect (`cs` → `czech` in `ISO_MAP`), Czech now gates at the
  tight-cluster grade (gross-error catch only, won't split Czech from Slovak),
  verified across 8 samples plus English/German gross-mismatch flags. This closes
  NATO: all 32 members' official languages now gate locally.
- 6bb9a56: Complete NATO language coverage. The alliance is wholly European + North
  American, so 30 of the 32 members' official languages already gate from the
  European pass; this adds the two remaining routes: Luxembourgish (`lb` → `ltz`,
  clean) and Montenegrin (`cnr` → `cnr`, gross-error grade within the
  Serbo-Croatian cluster). Czech stays exempt — multi-sample stress testing shows
  its prose false-fails too often (one sample read as French), confirming the
  prior exempt decision. LANGUAGES.md gains a NATO coverage section and the
  Luxembourgish/Czech exempt notes are corrected.

## 0.1.8

### Patch Changes

- 1ef1f8d: detector: extend franc routing to the cluster languages the margin protects

  Adds `bg` Bulgarian, `sr` Serbian, `tr` Turkish and `uz` Uzbek to `FRANC_MAP`.
  franc's _top_ guess for these is often a sibling (Serbian reads as Bosnian,
  Bulgarian as Macedonian, Turkish as Azeri), but the declared language stays within
  the gate's 0.1 confidence margin, so correct prose still passes and only a gross
  mismatch is flagged. It is a weaker, gross-error-catch gate for these — it will not
  split Serbian from Bosnian — but gating is preferred over dropping them to NLP.

  Only Czech (`ces` falls to 0.77 behind Croatian) and Azeri (the `azj`/`azb` split)
  genuinely false-fail, so they remain exempt (`khai.languages`). The "unregistered"
  test now uses Czech. A verified sample per added language keeps the routing pinned.

- 223da01: detector: franc routing for the languages languagedetect can't separate

  `validateLanguageOfFile` now picks the detector per resolved language: the 37
  languagedetect languages as before, and **franc** (ISO 639-3) for ten that
  languagedetect collapses but franc gates stably across multiple samples — `nds`
  Low German (the driving case), `el` Greek, `ca` Catalan, `eu` Basque, `vi`
  Vietnamese, `tl` Tagalog, `ne` Nepali, `ru` Russian, `uk` Ukrainian, `mk`
  Macedonian. New `FRANC_MAP` (declared code → 639-3) sits beside `ISO_MAP`; both
  detectors return a score-ranked list so the existing top-vs-resolved comparison
  is unchanged. Adds the `franc-all` dependency.

  Still exempt (multi-sample testing showed them flipping, so no local gate):
  Czech (→Croatian), Bulgarian (→Macedonian), Serbian (→Bosnian) and the Turkic
  cluster. A data-driven test gates one verified native sample per franc-routed
  language, plus a wrong-language flag.

- 74b1c5d: detector: add the UK languages — Scottish Gaelic, Irish, Scots

  Routes `gd` Scottish Gaelic (clean), `ga` Irish and `sco` Scots through franc.
  Irish sits in the Goidelic cluster (franc's top may be Scottish Gaelic) and Scots
  is English-adjacent (top may be English), so both gate at the gross-error grade —
  within the 0.1 margin, correct prose passes and only a gross mismatch is flagged.

  With English and Welsh already gated, this covers the UK's text languages except
  **Cornish** (`kw`), which franc does not model (it reads as Breton); Cornish stays
  exempt via `khai.languages`. A verified sample per added language pins the routing.

## 0.1.7

### Patch Changes

- 097a285: detector: extend registration beyond Europe to the full reliably-detected set

  Builds on the European set: adds every remaining language languagedetect returns
  as the top hit on its own prose, taking ISO_MAP to 37. New: Welsh and Latin
  (completing Europe), the distinct-script Arabic, Farsi, Urdu, Hindi and Bengali,
  the distinct Cyrillic Kazakh and Mongolian, and Swahili, Somali, Hausa, Hawaiian,
  Indonesian and Cebuano.

  Still excluded (false-fail a per-paragraph gate; NLP/franc path instead): the
  Cyrillic Slavic cluster (ru/uk/sr/mk/bg), Czech, the Turkic-Latin pair
  (azeri/uzbek), Turkish, Nepali (ties Hindi), Tagalog/Vietnamese, and the
  unmodelled (Greek, Catalan, Basque, Low German). A data-driven test gates one
  verified native sample per registered language.

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
