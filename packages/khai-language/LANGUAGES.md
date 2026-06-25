---
khai: design-of-record
title: "Additional languages: declaring and detecting (Low German first)"
status: partial
license: CC-BY-NC-SA-4.0
---

# Design of record — additional languages (`nds` Low German as the driving case)

The engine-side spec for letting a culture carry prose in a language beyond the
four built in today. It is the companion to the cultures-repo plan: the repo
declares and authors; **this package decides what `nds` means to the gate.**

> Scope note. Only this package (`@chbrain/khai-language`) is khai-monorepo work,
> and it is governance lane (`packages/khai-language/**`). The repo adoption
> (`khai-cultures`) is reproduced below only as the contract it implements against.

## Built-in languages (reliable local detection)

Every language whose own prose languagedetect returns as the **top hit** is
registered in `ISO_MAP` and gates locally today (`language: <code>`). The full
set (38), by region:

- **Europe — West/South:** `en` English · `de` German · `fr` French · `nl` Dutch ·
  `it` Italian · `es` Spanish · `pt` Portuguese
- **Europe — Nordic:** `da` Danish · `sv` Swedish · `no` Norwegian · `fi` Finnish ·
  `is` Icelandic
- **Europe — Central/SE (Latin):** `pl` Polish · `hu` Hungarian · `ro` Romanian ·
  `hr` Croatian · `cs` Czech † · `sk` Slovak · `sl` Slovene · `sq` Albanian
- **Europe — Baltic:** `lt` Lithuanian · `lv` Latvian · `et` Estonian
- **Celtic / classical:** `cy` Welsh · `la` Latin
- **Middle East / South Asia (distinct scripts):** `ar` Arabic · `fa` Farsi ·
  `ur` Urdu · `hi` Hindi · `bn` Bengali
- **Central Asia (distinct Cyrillic):** `kk` Kazakh · `mn` Mongolian
- **Africa / Pacific / SE Asia:** `sw` Swahili · `so` Somali · `ha` Hausa ·
  `haw` Hawaiian · `id` Indonesian · `ceb` Cebuano

A data-driven test gates one verified native sample per language.

> † **Czech** is the one languagedetect language that gates at the **tight-cluster
> grade** rather than as a clean top: its sibling Slovak frequently tops, but Czech
> stays within the 0.1 margin on its own prose, so it gates (gross-error catch
> only — it won't split Czech from Slovak). It is routed through languagedetect, not
> franc, because franc occasionally misreads Czech outright (one sample read as
> French at `fra` 1.00 / `ces` 0.85), whereas languagedetect only ever confuses it
> with Slovak. It is the languagedetect counterpart of franc's `bg`/`sr`.

## Detected via franc (`FRANC_MAP`) — the second tier

`validateLanguageOfFile` is a three-tier escalation: **languagedetect** (the 38
above) → **franc** (ISO 639-3, broad model) → **NLP** (`khai.languages`). franc
gates two grades of language, because the gate's **0.1 confidence margin** only
flags when the declared language scores _more than 0.1 below_ the detected top:

- **Clean detection** — own prose tops the list: `nds` Low German (the driving
  case) · `el` Greek · `ca` Catalan · `eu` Basque · `vi` Vietnamese · `tl`
  Tagalog · `ht` Haitian Creole · `ne` Nepali · `ru` Russian · `uk` Ukrainian ·
  `be` Belarusian · `mk` Macedonian · `gd` Scottish Gaelic · `lb` Luxembourgish ·
  `mt` Maltese.
- **Tight-cluster grade** — a sibling _tops_ the list, but the declared language
  stays within the margin, so correct prose still passes: `bg` Bulgarian (top:
  Macedonian) · `sr` Serbian (top: Bosnian) · `bs` Bosnian · `cnr` Montenegrin
  (top: Bosnian) · `tr` Turkish (top: Azeri) · `uz` Uzbek · `ga` Irish (top:
  Scottish Gaelic — the Goidelic cluster) · `sco` Scots (top: English). This is a
  **gross-error catch only** — it flags
  English-in-a-Serbian-house but will not split Serbian from Bosnian, or Scots
  from English. Weaker, but gating beats NLP.

This is the per-language detector registry the design called for, now built; the
franc tier does as much work as the margin lets it before anything reaches NLP.

> **The Serbo-Croatian cluster, completed.** Its four standard varieties now all
> gate: `hr` Croatian via languagedetect (clean top), and `sr` Serbian, `bs`
> Bosnian, `cnr` Montenegrin via franc. franc treats `bos` as the cluster
> attractor — Serbian and Montenegrin prose read _as_ Bosnian — so Bosnian's own
> prose tops `bos` on roughly half its samples and rides within the margin on the
> rest. Within the cluster the four are indistinguishable to the gate (it will not
> split Bosnian from Croatian); across it, a gross mismatch is still caught.

> **Eastern Europe.** The East Slavic trio gates cleanly via franc — `ru` Russian,
> `uk` Ukrainian, `be` Belarusian (each tops its own prose outright; Belarusian's
> nearest sibling, Ukrainian, sits ~0.3 back). **Moldova needs no code of its own:**
> "Moldovan" _is_ Romanian (ISO deprecated `mo`/`mol` and merged them into `ron` in
> 2008), and `ro` Romanian already gates via languagedetect — so a Moldovan culture
> declares `language: ro`, which is the truth about the content, not a substitution.

### UK / GB coverage

The UK's text languages: **English** (`en`, languagedetect) and **Welsh** (`cy`,
languagedetect) gate cleanly; **Scottish Gaelic** (`gd`), **Irish** (`ga`) and
**Scots** (`sco`) gate via franc (Gaelic clean; Irish and Scots at the
gross-error grade, within the Goidelic and English clusters respectively).
**Cornish** (`kw`) is the one gap — franc has no Cornish model (it reads as
Breton, its closest Brythonic relative), so it is exempt-only (`khai.languages`).

### Commonwealth coverage

Beyond Europe the Commonwealth is khai's best-aligned region: most of its
languages carry a distinct script and gate cleanly via franc. Each tops its own
prose (verified one native sample per language in the franc-routes test):

- **South Asia** — `ta` Tamil · `te` Telugu · `gu` Gujarati · `pa` Punjabi
  (Gurmukhi) · `si` Sinhala. (`hi` Hindi, `ur` Urdu, `bn` Bengali already gate via
  languagedetect.)
- **Africa** — `ig` Igbo · `af` Afrikaans, plus the Nguni pair `zu` Zulu and
  `xh` Xhosa: each tops its own prose, and they sit within each other's 0.1 margin
  (Zulu reads near-Xhosa and vice versa), so both gate but only at the gross-error
  grade for the pair — exactly the Goidelic `gd`/`ga` situation. (`sw` Swahili,
  `ha` Hausa already gate via languagedetect.)
- **Southeast Asia** — `ms` Malay, routed to franc's Malay code `zlm`. Its
  near-sibling is Indonesian (`ind`, within the margin), but Indonesian is declared
  as `id` and gates on the **other** engine (languagedetect), so the two never
  collide.
- **Pacific** — `mi` Maori · `fj` Fijian · `sm` Samoan · `to` Tongan, all clean.

`hi`/`ur`/`bn`/`sw`/`ha`/`cy` (built-in) plus the franc set above cover the
Commonwealth's principal written languages; the remaining gaps (smaller Indian and
Pacific tongues franc does not model) stay exempt-only.

### NATO coverage

The alliance is wholly European + North American, so the European pass already
gates most of the 32 members' official languages — Albanian, Bulgarian, Croatian,
Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian,
Icelandic, Italian, Latvian, Lithuanian, Macedonian, Norwegian, Polish,
Portuguese, Romanian, Slovak, Slovene, Spanish (+ Catalan/Basque), Swedish, Turkish
— each via `ISO_MAP` or the franc tiers above. Three more complete the set:

- **Luxembourgish** (`lb` → `ltz`) — Luxembourg. franc models it well: own prose
  tops at 1.0 across samples, German the nearest sibling ~0.2 back, so it gates
  **clean** (and doubles as a Benelux language).
- **Montenegrin** (`cnr` → `cnr`) — Montenegro. franc carries a `cnr` code, but it
  rides the Serbo-Croatian cluster (Bosnian/Serbian/Croatian all within the margin),
  so it gates only at the **gross-error grade**, exactly like Serbian.
- **Czech** (`cs` → `czech`) — Czechia. Routed through languagedetect (not franc,
  which misreads it outright on occasion), it gates at the tight-cluster grade with
  Slovak as the sibling, margin-protected. See the † note in the built-in section.

That closes the alliance: **all 32 NATO members'** official languages now gate
locally, none left on the NLP-only path.

### Pacific / Oceania coverage

Oceania is the best-gating region beyond Europe — franc models most of its
languages, so the soul-languages gate, not just the official English. The
Polynesian set landed with the Commonwealth (`mi` Maori, `sm` Samoan, `to` Tongan,
`fj` Fijian; `haw` Hawaiian is built-in). Seven more complete it:

- **Melanesian creoles** — `tpi` Tok Pisin (PNG) and `bis` Bislama (Vanuatu) top
  their own prose clean; `pis` Pijin (Solomon Is.) gates at the tight-cluster grade
  (Bislama tops on some prose, but Pijin rides within the margin — the three creoles
  share a lexicon).
- **Micronesian** — `cha` Chamorro (Guam), `mah` Marshallese, `pau` Palauan, each
  clean and isolated (no near sibling in the model).
- **East Polynesian** — `tah` Tahitian, tight-cluster grade (Rarotongan can tie it;
  the two are close East Polynesian relatives).

Exempt — empirically confirmed absent from franc's 329-language model (each native
sample tops a relative): `gil` Gilbertese / Kiribati (reads as Maori), `tvl`
Tuvaluan / Tuvalu (reads as Samoan), `nau` Nauruan / Nauru (reads as Marshallese),
plus Hiri Motu and the like. They take the `khai.languages` path. **Micronesia
(FSM)** has no single national language — its states speak Chuukese, Pohnpeian,
Yapese, Kosraean — so its honest national tongue is `en` (gated). Australia and New
Zealand are covered by `en` (NZ also by `mi`).

### East Asia / Southeast Asia coverage

Distinct scripts make this the lowest-risk batch — franc tops each at 1.0 with no
near sibling: `zh` Chinese (`cmn`) · `ja` Japanese (`jpn`) · `ko` Korean (`kor`) ·
`th` Thai · `km` Khmer · `lo` Lao · `my` Burmese (`mya`) · `bo` Tibetan (`bod`).
Maritime SE Asia adds `tet` Tetum (Timor-Leste), Latin-script and spaced: it tops
its own prose at 1.0 (its only near sibling is `tdt`, Tetum's own Dili-variety
code; Portuguese loanwords don't pull it off `tet`). (`vi` Vietnamese was already
registered; `id` Indonesian, `ms` Malay and `ceb` Cebuano are built-in/franc.)

The catch here is not detection but **length measurement** — a problem shared by
the next region too, so the fix is general. Most of these scripts are _scriptio
continua_ — Chinese, Japanese, Thai, Khmer, Lao, Burmese and Tibetan do not put
spaces between words — so the span gate's `minSpanWords` (a whitespace token count)
reads a whole Chinese sentence as **one word** and skips it, and the language is
never actually checked. The same trap catches the **agglutinative Brahmic** scripts
of South Asia (a full Malayalam sentence is ~10 words). The gate therefore measures
all of these **dense scripts** by **character count** instead (`minSpanChars`,
default 24; see `DENSE_SCRIPT_RE`, which covers the spaceless scripts plus
Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam
and Sinhala): a paragraph qualifies if it has enough words _or_ enough
dense-script characters. Korean and the Latin/Cyrillic/Arabic-script languages
space their words and count normally. With this, a Japanese span in a Chinese house
(or a Tamil span in a Malayalam one) is flagged, not silently skipped — and it
retroactively strengthens the Commonwealth Dravidian set (`ta`/`te`), whose short
dense paragraphs were being waved through before.

### South / Central Asia + Middle East coverage

West of the CJK batch, the scripts stay distinct and the gate stays easy. Nine more
land (the Dravidian/Brahmic ones via the dense-script measure above):

- **South Asia** — `mr` Marathi (Devanagari; Hindi isn't even a near sibling),
  `kn` Kannada, `ml` Malayalam. (Tamil/Telugu/Gujarati/Punjabi/Sinhala landed with
  the Commonwealth; Hindi/Urdu/Bengali are built-in.)
- **Middle East** — `he` Hebrew (Yiddish the only sibling, far below) and `ps`
  Pashto (franc's `pbu`; Persian ~0.68 back). `ar`/`fa` are built-in.
- **Central Asia** — `ky` Kyrgyz, `tg` Tajik (Persian-in-Cyrillic; Uzbek ~0.65
  back), `tk` Turkmen. `kk`/`mn` are built-in, `uz` already franc.
- **South Caucasus** — `ka` Georgian (`kat`) and `hy` Armenian (`hye`), each its own
  unique alphabet, fully isolated: franc returns nothing but the language itself at
  1.0. The cleanest gates in the whole registry.
- **Azeri** (`az` → `azj`) gates at the **tight-cluster grade** — it rides the Oghuz
  Turkic cluster (Gagauz tops one sample, Turkish ~0.95), but `azj` stays within the
  margin on its own prose. This **overturns its old exempt verdict**: re-tested
  multi-sample, real Azerbaijani never falls 0.1 behind, so it gates (gross-error
  catch only). The fourth "exempt" call corrected by re-testing, after Czech,
  Luxembourgish and Maltese.

The genuine gaps here stay exempt (see below): Odia, Assamese, Kurdish (Kurmanji).

### Africa coverage

The last and most mixed frontier. The Commonwealth pass took the anglophone slice
(`ig`/`af`/`zu`/`xh`; `sw`/`so`/`ha` built-in); this adds twelve more, mostly clean
(Latin script, distinct vocabulary), verified multi-sample:

- **Horn** — `ti` Tigrinya (Ge'ez; gated by the dense-script measure, with Ethiopic
  added to `DENSE_SCRIPT_RE`) and `om` Oromo. _Amharic does **not** gate_ — see exempt.
- **Bantu** — `sn` Shona · `st` Sesotho (Sotho-Tswana siblings `nso`/`tsn` within
  margin) · `lg` Luganda · `ln` Lingala (Kongo siblings within margin), plus
  `rw` Kinyarwanda at the tight-cluster grade (Kirundi `run` tops some prose, within
  margin).
- **West Africa & Sahel** — `yo` Yoruba (**clean** — overturning the early
  world-probe's "fail", which was a bad sample), `wo` Wolof, and at tight-cluster
  grade `bm` Bambara (Maninka `emk` sibling) and `tw` Twi/Akan (Fante `fat` sibling).
- **Island** — `mg` Malagasy (franc's Plateau-Malagasy `plt`), clean and isolated.

**Round 2** saturates the continent's nationals — eleven more, each topping its own
prose (close siblings within the margin, gross-error grade):

- **Sotho-Tswana / Nguni (South Africa & neighbours)** — `tn` Tswana, `nso` Sepedi
  (the `sot`/`tsn`/`nso` trio all sit within each other's margin), `ts` Tsonga,
  `ve` Venda, `ss` Swati (Nguni cluster with `zu`/`xh`). South Africa's eleven
  officials now all gate.
- **Great Lakes** — `rn` Kirundi (Burundi; the `kin`/`run` pair, like Kinyarwanda).
- **Central Africa** — `kg` Kikongo and `sg` Sango at tight-cluster grade (Kikongo
  rides its creole Kituba `ktu`; Sango rides Lingala).
- **West Africa & Sahel** — `ee` Ewe (Togo/Ghana), `ff` Fula (franc's Nigerian
  Fulfulde `fuv`; Pular `fuf` sibling within margin).
- **North Africa** — `tzm` Tamazight (Morocco), clean in **Latin/Berber-Latin**;
  Tifinagh script is untested and likely exempt. (`ar` MSA covers the Arabic nationals.)

## Still exempt only (would false-fail even with the margin)

These drop straight to NLP, because the declared language falls **more than 0.1
below** a sibling on real prose, or franc has no model for it at all:

- **Odia** (`or`) — franc returns `und` (undetermined) on Odia prose: its script is
  not in the model at all. Exempt.
- **Assamese** (`as`) — not modelled; franc reads it as Bengali (`ben`, near-identical
  Eastern-Nagari script). Staging it as `bn` would be a lie (distinct language), so
  it stays exempt — the Bosnian principle.
- **Kurdish (Kurmanji)** (`ku`/`kmr`) — the Latin standard is not in franc's model
  (it reads as Sorani `ckb`). A Sorani (Arabic-script) culture may gate via `ckb`,
  untested here; Kurmanji is exempt.
- **Amharic** (`am`) — the Ge'ez cluster is asymmetric: Tigrinya gates cleanly, but
  Amharic prose reads as Tigrinya (`tir` tops, `amh` ~0.85, gap >0.1) on every
  sample. franc is biased toward `tir`, so Amharic false-fails and stays exempt —
  the notable gap in the Horn (Ethiopia's main language, ~57M speakers).
- **Chichewa / Nyanja** (`ny`) — franc carries `nya`, but the Bantu field has
  Swahili as a strong attractor: one in four samples loses to `swh` outright
  (gap >0.1), too noisy to gate. Exempt — the same 1-in-4 false-fail that cut
  Papiamento. (Shona survived the same test; Chichewa didn't.)
- **Kabyle / Berber** (`kab`) — not in franc's model; reads as Central Atlas
  Tamazight (`tzm`). A Tamazight culture may gate via `tzm`; Kabyle is exempt.
- **Papiamento** — franc carries `pap`, but the Iberian-creole field (Ladino,
  Tetum, Upper-Guinea Crioulo) is tangled: one in four samples loses `pap`
  outright (one topped Tetum), so it false-fails too often to gate. Exempt — the
  Caribbean creole that looked clean on a single sample but didn't survive
  multi-sample, the same way Czech once did.
- **Caribbean English-lexified creoles** — Jamaican Patois (`jam`), Belizean Kriol
  (`bzj`), Sranan Tongo (`srn`), Bajan, Guyanese, Trinidadian and the like: franc
  has no model for them (it carries the broader `pis`/`kri`/`tpi` creoles, not the
  Caribbean codes), so they read as those or as English. The **French-lexified**
  Antillean creoles (Saint Lucian `acf`, Guadeloupean `gcf`) read as Haitian `hat`.
  All exempt; their official languages (English, French, Dutch, Spanish) gate.
- **Pacific micro-languages** — `gil` Gilbertese (Kiribati), `tvl` Tuvaluan
  (Tuvalu), `nau` Nauruan (Nauru): confirmed absent from franc's model, each reading
  as a larger relative (Maori, Samoan, Marshallese respectively). **Do not register
  these in `FRANC_MAP`** — franc would detect their prose as that relative, the
  declared code would score ~0, and the gate would false-fail _every_ paragraph
  (1.0 − 0 > margin). The `khai.languages` exempt path, which skips local detection,
  is the only correct route. A Kiribati / Tuvalu / Nauru culture authors natively
  this way; verification falls to the NLP layer.
- **High German dialects** — Bavarian (`bar`), Swiss German / Alemannic (`gsw`),
  Kölsch (`ksh`), Palatine (`pfl`), Swabian (`swg`): the **inverse** of the
  distinct-script case. They are too _close_ to Standard German, so franc reads them
  as `deu` (the attractor). Even `gsw`, which franc does model, false-fails 2-in-3
  (deu tops, gsw ~0.85). Only **Low German** (`nds`) is distinct enough to gate (it
  leans Dutch-ward) — the driving case. **Upper Sorbian** (`hsb`) also gates, but it
  is a West Slavic regional language, not a German dialect, so nothing German is near
  it. Lower Sorbian (`dsb`, reads as `hsb`), North Frisian (`frr`, reads as West
  Frisian) and Saterland Frisian (`stq`, reads as `nds`) are exempt. For a dialect
  culture, declare Standard German (`de`) as the house and the dialect via
  `khai.languages`.
- **Unmodelled by franc** — Cornish (reads as Breton), and the like. (Maltese was
  listed here on assumption; franc in fact models `mlt` and gates it clean — another
  case where the both-engines re-test overturned an untested "exempt" verdict.)

Every exempt language is still **declarable** today via `khai.languages`; what it
lacks is a local gate. (Czech was long held here too, but it gates once routed
through languagedetect under the margin — see the † note above; the lesson is to
re-test an "exempt" language against _both_ engines before trusting the verdict.)

## What already works (no engine change)

Two of the three pieces the plan assumes are already built — confirm before
writing code:

- **Declaration.** `resolveLanguage` (`src/detector.mjs`) already resolves a
  `language:` frontmatter key with **file → play → house** precedence. Declaring
  a single persona file `language: nds` while its culture stays `de` is free, and
  the per-file precedence already permits that mix.
- **The lenient/exempt path is the existing NLP fallback.** `validateLanguageOfFile`
  builds `allowedLangs` from `ISO_MAP` **plus** `nlpLanguages`, and any language
  in `nlpLanguages` **skips the local detector** ("Local check skipped; expectations
  routed to assistant/LLM verification"). `nlpLanguages` is read from
  `package.json` `khai.languages`. So:

  > A culture that sets `khai.languages: ["nds"]` and `language: nds` on its Platt
  > files is **already accepted today**, with detection deferred — no engine
  > change at all. `normalizeLanguage("nds")` returns `"nds"` (not in `ISO_MAP`),
  > which matches on both sides.

So the **minimum viable Low German is a repo-only change.** What the engine work
buys is _rigor_: actually verifying the prose is Platt instead of trusting the
author.

## The crux: detection

`languagedetect` (the local detector) has no Low German and reads Platt as a
german/dutch near-tie, so it can never gate `nds`. Rigorous detection is the
whole risk, and it is the only part that needs engine code.

**Lever: `franc`** (trigram-based) — its language set includes `nds`. Route
detection per-language: keep `languagedetect` for `en/de/da/fr` (good there), use
`franc` for `nds`. Two caveats that must be validated, not assumed:

- **Short text.** franc is weak on short spans, and khai checks **per paragraph**;
  many khai paragraphs are short. Expect a tuning problem on the `minSpanWords` /
  `confidenceMargin` knobs.
- **Overlap.** Platt, Dutch, and German share trigrams; false-negatives ("this
  isn't Platt") on genuine Platt are the likely failure mode.

**Fallback, already in hand:** if franc's per-paragraph accuracy is too noisy,
ship `nds` as a **detection-exempt** language (the NLP-fallback path above) rather
than a flaky gate. Declared, allowed, author-trusted; tighten later.

## Engine deltas — `@chbrain/khai-language`

Land **only when rigorous detection is wanted**; the lenient path needs none of
this.

1. **Per-language detector registry.** Replace the single `languagedetect` call in
   `validateLanguageOfFile` with a small map: `en/de/da/fr → languagedetect`,
   `nds → franc`. Keep the existing top-vs-resolved `confidenceMargin` comparison;
   only the detector behind it changes.
2. **`ISO_MAP` + normalization.** Add `nds: "low german"` (or keep the bare code —
   decide the canonical name `normalizeLanguage("nds")` returns so it matches what
   the chosen detector emits). This makes `nds` allowed **without** `khai.languages`,
   i.e. promotes it from exempt to detected.
3. **Threshold tuning for minority/short text.** A per-detector (or per-language)
   `minSpanWords` / `confidenceMargin`, since franc on short Platt will not behave
   like languagedetect on long German.
4. **Dependency.** Add `franc` (MIT). Note it is ESM and has its own data tables;
   weigh the install-size cost against the four-language status quo.

## Contract decision — mixed vs. fan-out (decide before repo adoption)

`resolveLanguage`'s per-file precedence already supports both; pick the policy and
write it into `REFERENCE.md`:

- **Mixed (recommended for a dialect).** One persona (e.g. Okke) carries
  `language: nds`; the rest of the culture stays Hochdeutsch. Lightest and most
  authentic. Needs a one-line allowance in `validateProjectLanguages` and a
  `REFERENCE.md` note that a file's declared language overrides the house.
- **Fan-out.** The current multilingual contract (every file in every language).
  Doubles files; overkill for a dialect only _some_ personas speak.

## Downstream — `khai-cultures` (out of this repo)

- `package.json` → `khai.languages: ["nds"]` (`"da"` needs nothing — Danish is
  already in `ISO_MAP`).
- Set `language: nds` on the chosen Platt files; author that prose in Platt.
- `REFERENCE.md` → document the mixed-vs-fan-out policy chosen above.
- _(optional, Phase 0)_ model the dialect as a `position_platt` (Hochdeutsch
  prose) to capture its weight now, before any engine work.

## Verify — the make-or-break step

Test the chosen detector on **genuine Platt vs. Hochdeutsch-masquerading-as-Platt
at real khai paragraph lengths.** If `nds` detection is too noisy on short text,
ship the exempt/lenient path (Phase 0/repo-only) instead of a flaky gate. This
test decides whether engine deltas 1–4 land at all.

## Net

Declaring Low German is free and half-built (the NLP-fallback exemption). **Detection
is the entire engineering risk**, `franc` is the only lever that knows `nds`, and
short-text accuracy is the gate on whether rigorous detection ships or the lenient
path stands. Danish (`da`) needs nothing. All of it lands in this package, behind
the same engine access as the registry/groups work.
