---
khai: design-of-record
title: "Additional languages: declaring and detecting (Low German first)"
status: proposed
license: CC-BY-NC-SA-4.0
---

# Design of record — additional languages (`nds` Low German as the driving case)

The engine-side spec for letting a culture carry prose in a language beyond the
four built in today. It is the companion to the cultures-repo plan: the repo
declares and authors; **this package decides what `nds` means to the gate.**

> Scope note. Only this package (`@chbrain/khai-language`) is khai-monorepo work,
> and it is governance lane (`packages/khai-language/**`). The repo adoption
> (`khai-cultures`) is reproduced below only as the contract it implements against.

## Built-in European languages (reliable local detection)

These declare **and gate** locally today (`language: <code>`), because
languagedetect returns each as the top hit on real prose:

`en` English · `de` German · `fr` French · `nl` Dutch · `it` Italian ·
`es` Spanish · `pt` Portuguese · `da` Danish · `sv` Swedish · `no` Norwegian ·
`fi` Finnish · `is` Icelandic · `pl` Polish · `hu` Hungarian · `ro` Romanian ·
`hr` Croatian · `sk` Slovak · `sl` Slovene · `sq` Albanian · `lt` Lithuanian ·
`lv` Latvian · `et` Estonian.

**Deliberately _not_ local** — these would false-fail a per-paragraph gate, so
they take the NLP/`franc` path instead of `ISO_MAP`:

- **Cyrillic cluster** (Russian, Ukrainian, Serbian, Macedonian, Bulgarian) —
  languagedetect collapses them; `ru`/`uk` samples read as serbian.
- **Czech** — reads as Slovak (the `cs`↔`sk` pair). Slovak itself is fine.
- **Turkish** — misreads (read as danish on accent-stripped prose).
- **Unmodelled by languagedetect** — Greek, Catalan, Basque, Irish, Maltese,
  Luxembourgish: no trigram model at all.
- **Low German (`nds`)** — the driving case below.

Every excluded language is still **declarable** today via the NLP-fallback
exemption (`khai.languages`); what it lacks is a _local_ gate. `franc` (below) is
the lever that promotes the franc-capable ones — including `nds` — to detected.

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
