# khai core migration ledger — KAIHACKS retirement

*Status: planning. Nothing here is executed yet. It is the inventory +
loop plan for lifting the **generic, world-agnostic** KAI HACKS AI
structure out of the retiring `chbrain/kaihacks` repo into `chbrain/khai`
as npm packages.*

---

## Why this exists

`KAIHACKS` is the private source of truth and **is being retired**.
`khai` is the destination: the public, npm-published home for the
architecture canon, the world-construction tooling, and the multi-level
compliance checks.

This is a *step-wise lift*, not a port-and-pray. KAIHACKS is reference
material we lift *from*; khai is built on its own terms and verified by
its own fixtures. We do **not** build a cross-repo comparison harness.
The past is past; we lift with care.

The discipline: **one loop = one check, slow and precise.** Each check
lands in its destination package with its own good/bad fixtures, goes
green, and is done.

---

## Scope: khai **core** only, independent of any world

Migrate only the **generic / khai-tier** units — the ones KAIHACKS itself
calls universal, with no world-specific naming. Everything Cultures-
flavored is out of scope and stays the Cultures repo's own migration, on
its own timeline.

| Migrate (khai core) | Out of scope (a world's own concern) |
| --- | --- |
| type canon — `khai-arch` ✅ | Hofstede marker-set, scores, ±5 reference |
| encoding, links, language *engine* | culture completeness (8-file layout) |
| per-type structure (the 7 content types) | phrase-denylist plagiarism (world-seeded) |
| per-type judged rubrics ("good persona") | `khai-cultures-review`, branch-scope |
| generic construction (`khai-create`, templates) | `khai-cultures-create` and siblings |

khai core has no external world to depend on. That is the point.

---

## Routing principle

Every unit re-homes as an **npm package in khai**, routed by nature:

| Nature | Destination package | Form |
| --- | --- | --- |
| **Deterministic** (encoding, links, structure, filenames, schema) | `@chbrain/khai-tests` | rule atoms with `audit \| warn \| fail` severity |
| **Judged / NLP** (voice, coherence, "what good looks like") | `@chbrain/khai-review` | rubrics on the injectable-judge + ledger loop |
| **Type canon** | `@chbrain/khai-arch` | machine-readable frontmatter + `_schema.yml` |
| **World construction** ("building worlds") | new package, TBD (`khai-create`) | templates + authoring guidance |

The judged layer is where the KAIHACKS *checklists* ("what a good persona
constitutes") get an executable home: the `checklist_*.md` heuristics
become khai-review **rubrics**, one per type (or per chapter-test),
instead of prose a human runs by hand.

---

## Boundary: one canon, two engines, pulled

A type is **defined once, in khai-arch.** Two type-agnostic engines
validate against that single definition — they do not know what a
"persona" is until they read it from the canon.

| Layer | Owner |
| --- | --- |
| **Definition** (structure + criteria) | `khai-arch` — e.g. `persona.md` |
| **Test cases** (a valid persona; a `bad-persona-shadow-restates-projection`) | `khai-arch` — they pin what the definition *means* |
| **Deterministic mechanism** (chapters present, ordered, encoding) | `khai-tests` |
| **Judged / NLP mechanism** (is **Shadow** a real blind spot?) | `khai-review` |

`persona.md` already holds both halves the engines need: its
**frontmatter** is the structural facts khai-tests charges; its **prose**
(what each chapter should achieve) is the rubric khai-review charges.
Add an 8th type tomorrow and both engines validate it with zero code
change — the only place a type exists is khai-arch.

### Direction: **pull**

The arrow points one way: `khai-tests → khai-arch` and
`khai-review → khai-arch`. khai-arch is inert: it declares, it never
invokes. The engine *charges itself from* the canon — it pulls.

```js
// khai-tests/src/validate.mjs
import { types, chaptersFor } from "@chbrain/khai-arch";   // the pull
```

khai-arch's `index.mjs` imports nothing back. The only back-edge is
dev-only — khai-arch's *tests* pull the checker from khai-tests to
validate its own spec files; that is still a pull, in test scope.

Why pull, never push:

1. keeps khai-arch dependency-free (runtime deps stay `gray-matter` only);
2. dependency points toward the stable thing (the canon), not away from it;
3. a new consumer (a third engine, website, construction) just pulls — no
   edit to the canon;
4. the canon must not need to know who reads it.

**The proof the boundary holds:** after the refactor, khai-arch's runtime
dependency list is `gray-matter` and nothing else.

### Ownership split of the current khai-arch contents

| khai-arch item | Verdict |
| --- | --- |
| `architecture/*.md`, `_schema.yml`, `model.md` | **stay** — the canon |
| `index.mjs` canon accessors (`types`, `chaptersFor`, `playbook`, `wiresChapters`, `engine*`) | **stay** |
| `index.mjs` `renderEngineReadme` | **borderline** — presentation, flag for a consumer |
| `tests/encoding.test.ts`, `markdown.test.ts`, `frontmatter.test.ts` | **logic → khai-tests**; the canon's self-test pulls it back |
| `tests/type-rules.test.ts` | **stays** (validates khai-arch's own declarations) but **calls khai-tests**, stops reimplementing |
| `fixtures/bad-encoding-*`, `bad-markdown-*` | **→ khai-tests** (generic) |
| `fixtures/bad-frontmatter-*`, `bad-type-rules-*`, `minimal-*` | **stay** (they define the type rules) |
| `tests/engine-*.test.ts` | **stay** — unit tests of khai-arch's own API |
| devDeps `ajv`, `js-yaml`, `markdown-it` | **→ khai-tests** (they exist only to power validation) |

> Open: keep the dev-only back-edge (2 packages) or extract a zero-dep
> `khai-rules` core so the graph is acyclic even in dev (3 packages).

---

## The three lifts

> *"arch was the first lift, but building worlds, assessing compliance is
> not yet there."*

| Lift | What it is | KAIHACKS source | khai destination | State |
| --- | --- | --- | --- | --- |
| **1. Arch** | type canon: 10 types, chapters, mnemonics, spine | `ARCHITECTURE.md`, `skills/khai/references/` | `khai-arch` (+ `_schema.yml`, `model.md`) | ✅ **done** (khai is ahead — has `play`, `plot`, meta types KAIHACKS never formalized) |
| **2. Build worlds** | how you *author* a persona/plot/world (generic) | `skills/khai-create`, `template_*.md` | new npm package (TBD) | ❌ **not started** |
| **3. Assess compliance** | the generic multi-level checks | `khai_tests` pytest + `review/checks.py` + `checklist_*` | `khai-tests` (deterministic) + `khai-review` (judged) | ⚠️ **partial** — structural atoms exist; judged "what good looks like" layer is still only KAIHACKS skills |

Order of work: **Lift 3 first** (half-done, and it is what makes a world
trustworthy), then **Lift 2** (construction), then KAIHACKS's core role
retires.

---

## Inventory

### Types (lift 1 — done; the contract the checks lean on)

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

### Deterministic checks (lift 3 → `khai-tests`)

| Check | KAIHACKS source | khai destination | Severity (proposed) | Loop |
| --- | --- | --- | --- | --- |
| encoding + filename rules | `test_khai_encoding.py` | rule atom (partly present) | fail | 1 |
| relative link integrity | `test_khai_links.py` | rule atom (partly present) | fail | 2 |
| per-language detection (engine) | `test_khai_language.py` | rule atom / engine | fail | 3 |
| per-type section structure | `components/test_khai_{type}.py` | khai-arch chapter contract + rule atom | fail | 4 |
| generic required files | `project/test_khai_required_files.py` | rule atom | warn | 5 |

### Judged / NLP checks (lift 3 → `khai-review`)

| Rubric | KAIHACKS source | khai destination | Loop |
| --- | --- | --- | --- |
| conciseness | (already in khai) | `khai-review` rubric ✅ | — |
| language quality / fluency | `review/checks.py` | new rubric | 6 |
| per-type "what good looks like" (e.g. persona: does **Has** survive removing the persona? does **Loses** conflict with **Has**?) | `skills/khai/references/checklist_*.md` | one rubric per type | 7 |

### Construction units (lift 2 → new package, TBD)

`khai-create`, `khai-update`, `khai-delete`, `khai-package`, `khai-write`,
`template_*.md`. (World-specific create skills are out of scope.)

> Open: single `khai-create` package vs skill bundle vs per-domain.
> Decide before Lift 2 loops start.

---

## Loop methodology

For each check, in isolation:

1. **Classify** — deterministic or judged?
2. **Route** — deterministic → `khai-tests` rule atom (assign severity);
   judged → `khai-review` rubric (port the checklist heuristic into
   rubric prose).
3. **Encode** in the destination package.
4. **Fixture** — write a good and a known-bad example for the check
   (per type where relevant); the good passes, the bad fails for the
   right reason.
5. **Green** — the check and its fixtures pass in CI. Done.

One loop = one check. Do not batch.

---

## Loop 1 (proposed): encoding

The smallest deterministic check — proves the loop end to end before the
harder judged rubrics.

- **Source:** `KAIHACKS/tests/khai/khai_tests/test_khai_encoding.py`
- **Destination:** `khai-tests` encoding rule atom — close coverage gaps
  vs the pytest version (BOM, CRLF, em/en-dash, smart quotes, NBSP,
  trailing-LF, filename rules).
- **Fixtures:** a clean file (passes) + a file with each violation
  (fails, one finding per violation).
- **Done when:** rule atom + fixtures green in CI.

---

## Open decisions

1. **Construction packaging** (Lift 2) — single package vs bundle vs
   per-domain.
2. **Severity defaults** — confirm the `audit/warn/fail` assignment per
   row above; worlds may override.
