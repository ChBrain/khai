# @chbrain/khai-language

## 0.1.21

### Patch Changes

- 674253b: Register Seychellois Creole / Seselwa (`crs`) in the detector. franc tops `crs`
  clean 3/3 on Seselwa prose (UDHR + narrative + modern), French ~0.76 back — well
  outside the margin, the same clean grade as Haitian Creole `ht`. This makes Seselwa
  detector-known, so Seychelles can author in its first official language and gate
  locally instead of taking the `khai.languages` exempt path.

  Mauritian Creole / Morisien (`mfe`) stays exempt — franc carries no `mfe` model and
  reads Morisien as its sister `crs`, not as French. Documented in LANGUAGES.md.

## 0.1.20

### Patch Changes

- 5b1c4dd: Register the West African creoles that gate: `pov` Guinea-Bissau Kriol (clean),
  `kri` Krio / Sierra Leone (clean), and `pcm` Nigerian Pidgin (tight-cluster, within
  English's margin) — all verified multi-sample. This makes them detector-known, so a
  nation can use its creole as a base `language:` and gate locally instead of needing
  the `khai.languages` exempt path. Cape Verdean Kriolu (`kea`) stays exempt — it
  false-fails to its Upper-Guinea sibling `pov`. Documented in LANGUAGES.md.

## 0.1.19

### Patch Changes

- 93ff4a4: Migrate js-yaml to v5 in governance lane (2/4). js-yaml 5 removed the default export; switched to namespace imports `import * as yaml` and bumped the dependency to ^5.1.0 in @chbrain/khai-language and @chbrain/khai-rules.

## 0.1.18

### Patch Changes

- fa14700: Africa round 2 — register eleven more national languages, saturating the
  continent. Sotho-Tswana/Nguni: `tn` Tswana, `nso` Sepedi, `ts` Tsonga, `ve`
  Venda, `ss` Swati (so South Africa's eleven officials now all gate). Great Lakes:
  `rn` Kirundi. Central Africa: `kg` Kikongo and `sg` Sango (tight-cluster, riding
  Kituba and Lingala respectively). West Africa: `ee` Ewe, `ff` Fula. North Africa:
  `tzm` Tamazight (Latin/Berber-Latin; Tifinagh untested). Each tops its own prose
  multi-sample, with close siblings within the margin (gross-error grade).
- 9d90256: Register Upper Sorbian (`hsb`), the West Slavic regional language of Lusatia — it
  gates clean (isolated; nearest sibling Polish ~0.8 back) because it is not German
  at all. Documents the German-dialect finding: the High German dialects (Bavarian,
  Swiss German/Alemannic, Kölsch, Palatine, Swabian) are the inverse of the
  distinct-script case — too close to Standard German, so franc reads them as `deu`
  and they stay exempt. Low German (`nds`) remains the one German dialect distinct
  enough to gate; a dialect culture declares Standard German and the dialect via
  `khai.languages`.

## 0.1.17

### Patch Changes

- 6257425: Register Georgian (`ka` → `kat`) and Armenian (`hy` → `hye`), completing the South
  Caucasus. Each has its own unique alphabet and is fully isolated — franc returns
  nothing but the language itself at 1.0 across every sample — so they gate clean,
  the most unambiguous adds in the registry.

## 0.1.16

### Patch Changes

- a9f7d10: Register the Africa batch (12 languages) — the last frontier. Mostly clean:
  `ti` Tigrinya, `om` Oromo (Horn); `sn` Shona, `st` Sesotho, `lg` Luganda, `ln`
  Lingala (Bantu); `yo` Yoruba, `wo` Wolof (West Africa); `mg` Malagasy (island).
  Tight-cluster grade: `rw` Kinyarwanda (Kirundi sibling), `bm` Bambara (Maninka),
  `tw` Twi/Akan (Fante). Yoruba overturns the early world-probe's "fail" (bad
  sample). `DENSE_SCRIPT_RE` gains Ethiopic for Tigrinya. Exempt (documented):
  Amharic (false-fails to Tigrinya — the Ge'ez cluster is asymmetric), Chichewa
  (1-in-4 false-fail to Swahili, like Papiamento), Kabyle (reads as Tamazight `tzm`).

## 0.1.15

### Patch Changes

- 3f060ff: Register the South/Central Asia + Middle East batch (9 languages) and generalize
  the dense-script length measure. New franc routes, all verified multi-sample:
  `mr` Marathi, `kn` Kannada, `ml` Malayalam (South Asia); `he` Hebrew, `ps` Pashto
  (Middle East); `ky` Kyrgyz, `tg` Tajik, `tk` Turkmen (Central Asia); and `az`
  Azerbaijani at the tight-cluster grade — overturning its old exempt verdict (real
  Azeri never falls 0.1 behind; it rides the Oghuz Turkic cluster within margin).

  The Dravidian/Brahmic scripts are agglutinative, so a full sentence is well under
  15 whitespace words and was being skipped. The `minSpanChars` fallback (from the
  CJK batch) is broadened to cover Devanagari, Bengali, Gurmukhi, Gujarati, Oriya,
  Tamil, Telugu, Kannada, Malayalam and Sinhala (`CONTINUOUS_SCRIPT_RE` →
  `DENSE_SCRIPT_RE`), so these gate properly — and it retroactively strengthens the
  already-shipped Tamil/Telugu. Odia, Assamese and Kurdish (Kurmanji) stay exempt
  (franc has no model for them).

- 02e6d90: Register Tetum (`tet` → `tet`) so Timor-Leste gates instead of riding the exempt
  path. franc tops `tet` cleanly on every sample (its only near sibling is `tdt`,
  Tetum's own Dili-variety code; the heavy Portuguese loanwords don't pull it to
  `por`). It is Latin-script and spaced, so no scriptio-continua handling is needed.
  A culture currently listing `tet` in `khai.languages` should drop it to take the
  gate (the NLP-fallback check precedes detection).

## 0.1.14

### Patch Changes

- 9c6da2b: Register the East Asia / Southeast Asia distinct-script batch — `zh` Chinese,
  `ja` Japanese, `ko` Korean, `th` Thai, `km` Khmer, `lo` Lao, `my` Burmese, `bo`
  Tibetan — all of which franc tops cleanly at 1.0. Crucially, this also teaches the
  span gate to measure scriptio-continua scripts (the spaceless ones) by character
  count: `minSpanWords` counts whitespace tokens, so a whole Chinese/Thai/etc.
  paragraph reads as one "word" and was being skipped — the language was registered
  but never actually checked. A new `minSpanChars` fallback (default 24, via
  `CONTINUOUS_SCRIPT_RE`) makes a paragraph qualify on enough words OR enough
  continuous-script characters, so detection genuinely runs. Korean and Vietnamese
  space their words and are unaffected.

## 0.1.13

### Patch Changes

- 7ea6327: Register the Pacific/Oceania batch (7 languages), completing the region's
  soul-language coverage alongside the Polynesian set landed with the Commonwealth.
  Clean grade: `tpi` Tok Pisin (PNG), `bis` Bislama (Vanuatu), `cha` Chamorro
  (Guam), `mah` Marshallese, `pau` Palauan. Tight-cluster grade: `pis` Pijin
  (Solomon Is.; Bislama within margin — the Melanesian creoles share a lexicon) and
  `tah` Tahitian (Rarotongan within margin). Each verified multi-sample. Gilbertese
  (Kiribati) and the smaller tongues stay exempt (unmodelled by franc).

## 0.1.12

### Patch Changes

- cb8ea13: Register Haitian Creole (`ht` → `hat`) so the Haiti culture can declare its
  soul-language. Kreyòl is French-lexified, but franc tops `hat` cleanly on every
  sample (French ~0.65 back, the Seychellois-creole sibling `crs` ~0.8 back, both
  well within margin); languagedetect mis-reads it as French, so it routes via
  franc at the clean grade. It is the one Caribbean creole that gates: Papiamento
  false-fails under multi-sample (Iberian-creole tangle), and the English-lexified
  Caribbean creoles (Jamaican, Belizean Kriol, Sranan, etc.) aren't in franc's
  model — all documented as exempt in LANGUAGES.md.

## 0.1.11

### Patch Changes

- 51cd684: Register Maltese (`mt` → `mlt`). The exempt list claimed franc didn't model it,
  but that was never tested — franc carries `mlt` and gates it clean on every
  sample, with no near sibling (Maltese is Semitic in Latin script with its own
  diacritics, so nothing collides). languagedetect has no Maltese, so it routes via
  franc. With this, Malta's titular language gates (its other official language,
  English, already did). The exempt note is corrected.

## 0.1.10

### Patch Changes

- 1b6b31d: Register Belarusian (`be` → `bel`) so the East Slavic trio (Russian, Ukrainian,
  Belarusian) all gate. languagedetect has no Belarusian, so it routes via franc,
  where it tops its own prose cleanly across samples (Ukrainian the nearest sibling
  ~0.3 back). Moldova needs no new code: "Moldovan" is Romanian (ISO merged
  `mo`/`mol` into `ron`), and `ro` already gates — documented in LANGUAGES.md.
- ea91085: Register Bosnian (`bs` → `bos`) so cultures can declare `language: bs` instead of
  staging Bosnian content as Croatian or Serbian. Bosnian routes via franc
  (languagedetect has no Bosnian) at the tight-cluster grade: franc treats `bos` as
  the Serbo-Croatian attractor, so Bosnian prose tops `bos` on roughly half its
  samples and stays within the 0.1 margin on the rest — its own prose passes, a
  gross mismatch is flagged. This completes the cluster: Croatian, Serbian,
  Montenegrin, and Bosnian all gate.

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
