# khai migration ledger — KAIHACKS retirement

*Status: planning. Nothing in this document is executed yet. It is the
inventory + loop plan for moving the KAI HACKS AI structure out of the
retiring `chbrain/kaihacks` repo and into `chbrain/khai` as npm packages.*

---

## Why this exists

`KAIHACKS` is the private end-to-end source of truth and **is being
retired**. `khai` is the destination: the public, npm-published home for
the architecture canon, the world-construction tooling, and the
multi-level compliance checks.

This is a *step-wise migration*, not a perpetual cross-repo audit. The
audit/compare machinery is used as a **parity oracle** — once per check,
to prove the khai version matches the KAIHACKS version on the same
content — and then discarded as the KAIHACKS side is retired.

The discipline is the one already proven in
`KAIHACKS/tests/khai/PLAN.md` (the `validate_*.py → pytest` migration):
**one loop = one check, slow and precise.** This ledger is the next leg
of that same loop: `KAIHACKS pytest + prose skills → khai npm canon + JS
checks + judged review`.

---

## Routing principle

Every unit re-homes as an **npm package in khai**, routed by nature:

| Nature | Destination package | Form |
| --- | --- | --- |
| **Deterministic** (encoding, links, structure, filenames, schema) | `@chbrain/khai-tests` | rule atoms with `audit \| warn \| fail` severity |
| **Judged / NLP** (voice, coherence, "what good looks like", marker signal) | `@chbrain/khai-review` | rubrics on the injectable-judge + ledger loop |
| **Type canon** | `@chbrain/khai-arch` | machine-readable frontmatter + `_schema.yml` |
| **World construction** ("building worlds") | new package, TBD (`khai-create` / generator) | templates + authoring guidance |

The judged layer is where the existing KAIHACKS *skills and checklists*
("what a good persona constitutes") finally get an executable home: the
`checklist_*.md` heuristics become khai-review **rubrics**, one per type
(or per chapter-test), rather than prose a human runs by hand.

---

## The three lifts

> *"arch was the first lift, but building worlds, assessing compliance is
> not yet there."*

| Lift | What it is | KAIHACKS source | khai destination | State |
| --- | --- | --- | --- | --- |
| **1. Arch** | type canon: 10 types, chapters, mnemonics, spine | `ARCHITECTURE.md`, `skills/khai/references/` | `khai-arch` (+ `_schema.yml`, `model.md`) | ✅ **done** (khai is ahead — has `play`, `plot`, meta types KAIHACKS never formalized) |
| **2. Build worlds** | how you *author* a persona/plot/world | skills `khai-create`, `khai-cultures-create`, `template_*.md` | new npm package (TBD) | ❌ **not started** |
| **3. Assess compliance** | the multi-level checks | `khai_tests` pytest + `review/checks.py` + `checklist_*` + marker-sets | `khai-tests` (deterministic) + `khai-review` (judged) | ⚠️ **partial** — structural atoms exist; judged "what good looks like" layer is still only KAIHACKS skills |

The frontier is **lifts 2 and 3**. Lift 3's judged layer is the highest
value and the hardest, so the loop order proves the deterministic
parity-oracle harness first, then turns to the judged rubrics.

---

## Inventory

### Types (lift 1 — done, kept here as the contract the checks lean on)

| Type | Class | Mnemonic | Content chapters | In khai-arch |
| --- | --- | --- | --- | --- |
| process | element | TO IDLE | Initiated by, Direction, Lever, Echo | ✅ |
| position | element | TO HOLD | Has, Orders, Loses, Drives | ✅ |
| piece | element | TO PLAY | Place, Load Bearing, Apparent, Yearbook | ✅ |
| place | element | TO SHOW | Shown, Holds, Offers, Withheld | ✅ |
| persona | element | TO PAST | Projection, Action, Shadow, Tell | ✅ |
| plot | house | TO CAST | Cue, Action, Stage, Tension | ✅ |
| play | house | ENACTS | Estate, Name, Arc, Company, Triggers, Stakes | ✅ |
| architecture | meta | GROW | — | ✅ |
| instructions | meta | HACKS | — | ✅ |
| engines | meta | WIRE | — | ✅ |

Migration debt this *closes* (do not preserve): KAIHACKS `frontmatter.md`
lists only the 5 element types as legal `khai:` values and has no
`play`/`plot` checklists.

### Deterministic checks (lift 3 → `khai-tests`)

| Check | KAIHACKS source | Old L-level | khai destination | Severity (proposed) | Loop |
| --- | --- | --- | --- | --- | --- |
| encoding + filename rules | `test_khai_encoding.py` | L1a | rule atom (partly present) | fail | A |
| relative link integrity | `test_khai_links.py` | L3 | rule atom (partly present) | fail | B |
| per-language detection | `test_khai_language.py` | L1b | rule atom / engine | fail | C |
| phrase-denylist plagiarism | `test_khai_plagiarism.py` | L4d | rule atom (opt-in) | fail | D |
| per-type section structure | `components/test_khai_{type}.py` | L2 | khai-arch chapter contract + rule atom | fail | E |
| required project files | `project/test_khai_required_files.py` | L4 | rule atom | warn | F |
| marker score shape | `marker_score.py` / `test_marker_score.py` | L4e/f | rule atom (deterministic part) | fail | G |

### Judged / NLP checks (lift 3 → `khai-review`)

| Rubric | KAIHACKS source | khai destination | Loop |
| --- | --- | --- | --- |
| conciseness | (already in khai) | `khai-review` rubric ✅ | — |
| language quality / fluency | `review/checks.py` | new rubric | H |
| per-type "what good looks like" (e.g. persona: does **Has** survive removing the persona? does **Loses** conflict with **Has**?) | `skills/khai/references/checklist_*.md` | one rubric per type | I |
| Hofstede / marker signal (judged half) | `skills/khai-cultures-review`, `marker_sets/hofstede.yaml` | rubric + marker-set data file | J |

### Construction skills (lift 2 → new package, TBD)

`khai-create`, `khai-cultures-create`, `khai-cultures-persona`,
`khai-cultures-tune`, `khai-lexicon`, `khai-update`, `khai-delete`,
`khai-package`, `khai-write`, `khai-writing-aa-*`,
`template_*.md`, `marker_sets/{hofstede,grimm_voice}.yaml`.

> Open: does construction ship as a single `khai-create` package, a
> skill bundle, or per-domain packages? Decide before Lift 2 loops start.

---

## Loop methodology

For each check, in isolation:

1. **Classify** — deterministic or judged?
2. **Route** — deterministic → `khai-tests` rule atom (assign severity);
   judged → `khai-review` rubric (port the checklist heuristic into
   rubric prose).
3. **Encode** in the destination package.
4. **Parity-oracle** — run the new khai check *and* the old KAIHACKS
   check over the same corpus (Cultures content is the natural test bed).
   Deterministic checks must match exactly; judged checks should
   converge, and any intentional divergence is recorded.
5. **Retire** — remove the KAIHACKS-side check, flip CI to the khai
   package.

One loop = one check. Do not batch.

---

## Loop 1 (proposed): encoding parity

Start with the smallest deterministic check to prove the parity-oracle
harness end to end before touching judged rubrics.

- **Source:** `KAIHACKS/tests/khai/khai_tests/test_khai_encoding.py`
- **Destination:** `khai-tests` encoding rule atom (confirm coverage gaps
  vs the pytest version: BOM, CRLF, em/en-dash, smart quotes, NBSP,
  trailing-LF, filename rules).
- **Oracle:** run both over a shared corpus; assert identical
  pass/fail per file.
- **Done when:** parity holds on the corpus and CI runs the khai atom.

---

## Open decisions

1. **Construction packaging** (Lift 2) — single package vs bundle vs
   per-domain.
2. **Cross-language transition** — the parity oracle must bridge Python
   (KAIHACKS) and JS (khai) while both exist. Harness lives where?
3. **Marker-sets** (`hofstede.yaml`, `grimm_voice.yaml`) — data files
   travel with `khai-review` or with the construction package?
4. **Severity defaults** — confirm the `audit/warn/fail` assignment per
   row above; worlds may override.
