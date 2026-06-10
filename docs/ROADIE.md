# Roadie -- set up the Stage, take it on Tour

> Status: design spec (draft for review). Captures the deployment/composition
> model agreed in design. Nothing here is built yet; the build order is in §12.
>
> Capitalization in this document follows the house rule (§9): the spec register
> capitalizes khai's defined vocabulary; ordinary words stay lowercase.

## 1. The picture

khai content is **produced** and then **experienced**. Between the two stands
the **Roadie** -- the crew that moves a world into an environment.

Every deployment takes the same inputs:

- **khai-arch** -- the canon: the type framework and the templates. _Always there._
- **spine** -- the meta layer a world runs on: the instruction Standards, the
  Architecture (the extension point), and the Setup Plan. _Always there._
- **engines** (0..n) -- the content domains (Gender, Virtue, ...). _Optional._
- the **content** -- the Plays, the Houses.

> spine + engines + content → **Roadie** → a target deployment

The Roadie composes these into a target: an adapted set of instructions plus a
content bundle, fit to where it is going. The spine ships _inputs_; the Roadie
_renders_.

## 2. The Roadie's two jobs

A roadie sets the Stage up before the show, and loads it out for the Tour. Same
crew, both ends of the lifecycle.

| Job                  | Direction | Toolset      | Purpose / Mode               | For                              |
| -------------------- | --------- | ------------ | ---------------------------- | -------------------------------- |
| **Set up the Stage** | inbound   | `khai-stage` | Development                  | the Playwright, to produce Plays |
| **Take on Tour**     | outbound  | `khai-tour`  | Play / Analysis _or_ publish | the audience, at a Venue         |

Both jobs run the same machinery; only the Mode (purpose) and the destination
differ.

## 3. The composition model: Standards × Adaptions

A deployment's instructions are a **computed artifact**, never hand-written.

- There are multiple **Standards** -- one per output Format (Prose, Dialogue,
  ...). Each Standard is a complete, canonical instruction set.
- Each Standard is **extended with Adaptions** -- the per-model/Venue deltas (the
  Gemini Gem's "no em-dash", "no headlines", its bound Modes).
- The artifact = `Standard[Format] + Adaption[Venue]` (+ bindings), composed by
  the Roadie.

> adapted instructions = Standard (the Format) + Adaption (the Venue)

We **start with one cell**: the **Prose** Standard, extended for the **Gemini
Gem**.

## 4. The two seams

The Roadie injects into exactly **two** chapters of the Standard. Nothing else
is touched.

- **Knowledge ← engines.** Each included engine's law is injected here. Runtime:
  the AI applies it while playing.
- **System ← deployment specifics.** The Venue Adaption lands here: render
  rules, the bound Modes, content bindings.

The Architecture is where these extensions are _defined_; the contract's System
points to it.

## 5. The three axes (do not conflate them)

| Axis        | Values                        | Changes                   | Carried by                                      |
| ----------- | ----------------------------- | ------------------------- | ----------------------------------------------- |
| **Format**  | Prose · Dialogue · ...        | the shape of every line   | distinct Standards                              |
| **Scope**   | a Play · a House · the Chain  | how much content is bound | content binding (Single/Cross Play/Cross World) |
| **Purpose** | Play · Analysis · Development | what the human is doing   | a Mode; also picks the Roadie job               |

Format rewrites the output shape (so it needs distinct Standards). Scope is a
binding the Roadie resolves. Purpose is a Mode, and it is the same choice as
which Roadie job runs (Development = Stage; Play/Analysis = Tour).

## 6. Venues

One **Venue** abstraction, each with a **Profile** carrying a `kind`:

- **interactive** -- gets the adapted instructions + a content bundle; the human
  _plays_ it.
- **publication** -- rendered content only, no instructions or Modes; the human
  _reads_ it.

| Venue (slug)       | kind        |
| ------------------ | ----------- |
| `gemini_gem`       | interactive |
| `claude_project`   | interactive |
| `perplexity_space` | interactive |
| `notebooklm`       | interactive |
| `github_pages`     | publication |
| `print`            | publication |
| `email`            | publication |
| `markdown`         | publication |

The Profile also holds **constraints** (file/size limits), **format** (how it is
packaged), and -- for interactive -- **render rules** and the **setup README**.
The shared pipeline is `aggregate → fit → format`; the
**instructions + Modes stage runs only for interactive Venues**.

The spine Setup Plan's targets _are_ the interactive Venues; `khai-tour`'s
profiles _are_ the full set + `kind`. One vocabulary, not two lists.

## 7. The engine's two wirings

An engine is two-faced, and wires both ways:

| Wire | Into                         | Serves                                              | Mechanism                                       |
| ---- | ---------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| 1    | **Knowledge** (instructions) | runtime -- the AI applies the domain's law          | Roadie injects at the Knowledge seam (deploy)   |
| 2    | **khai types**               | authoring -- the Playwright instantiates the domain | the engine's **WIRES card** (already canonical) |

So an engine is a **type library** for the Playwright and a **knowledge module**
for the runtime. The Roadie makes both live: the Stage job lights up the types
(authoring); the Tour job bakes the law into Knowledge (runtime). The engine is
the hinge between produce and experience.

## 8. The Playwright's stack

The Playwright produces against what the Roadie deployed:

- **khai-arch** -- always (the type framework)
- **spine** -- always (the contract)
- **engines** -- optional (the domains)

The engines' WIRES cards give the Playwright the type palette; the Play that
results, when toured, carries those engines' law into Knowledge.

## 9. House rule: capitalization

Two registers, each consistent.

- **Spec register** (instructions, templates, this document): **capitalize
  khai's defined vocabulary**.
  - khai types: Persona, Position, Process, Piece, Place, Plan, Play,
    Instructions, Architecture
  - cast + structures: Human, Agent, Narrator, Scene, Conditions, Collaboration,
    Knowledge, System
  - Modes: Play Mode, Analysis Mode
  - ordinary words stay lowercase: move, behavior, evidence, silence, rotation
- **Content register** (the engine / Play prose): lowercase literary prose. We
  do **not** uppercase the Position / Virtue files.

This is already what the canon does in spec text (the Taxonomy guidance reads
"link it if it is a **Position** with its own file"; file H1s are
`Position: Gender`, `Instructions: Prose`).

## 10. The locked Prose Standard

The first Standard. The Roadie composes from this base by injecting engines at
Knowledge and the Venue Adaption at System.

```markdown
---
khai: instructions
title: "Prose"
license: CC-BY-NC-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.1.0
  date: "2026-06-10"
---

# Instructions: Prose

## Human

- Sets the Scene.
- Provides Conditions.
- Can join, but only if stating it explicit.

## Agent

- Speaks through a Persona.
- Operates through a Persona.
- Narrates Scenes.

## Collaboration

- Personas interact with each other through words and actions.
- One move triggers the next.
  - The persona most moved by what just happened responds.
  - Not a rotation.
  - A persona might be skipped.
  - A persona might move twice.
  - Silence is a move.
- The Collaboration rests when it has nowhere left to go.
- The Scene remains open.

## Knowledge

- Behavior is evidence.

## System

- Extensions are defined in the [architecture](architecture.md).

### Play Mode

- The Narrator does not invite the Human into the Scene.
- The Narrator does not explain the Scene.
- The Narrator does not explain the behavior.
- Explains only if explicit asked by the Human.

### Analysis Mode

- Only opened when the Human asks for it.
```

## 11. The pieces

| Piece             | Kind          | Role                                            |
| ----------------- | ------------- | ----------------------------------------------- |
| `khai-arch`       | package       | the canon: types + templates                    |
| `spine`           | engine (meta) | the Standards, the Architecture, the Setup Plan |
| `khai-engine-*`   | packages      | content domains; two wirings each               |
| `khai-stage`      | package       | set up the Stage (production)                   |
| `khai-tour`       | package       | take on Tour (Venues)                           |
| `khai-roadie`     | skill         | the crew that drives Stage + Tour               |
| `khai-playwright` | skill         | produces Plays on the deployed stack            |

Pattern: **packages compute deterministically; skills make the smart calls** --
the same split as Playwright/Engineer over the canon.

## 12. Build order

Dependencies are real; most of this is gated on PRs in flight.

1. **Spine base contract** grows the Mode framework (the Prose Standard, §10),
   retitled `Prose`. _After #376 merges._
2. **Architecture** declares all three wirings -- Knowledge ← engine law,
   types ← engine WIRES card, System ← deployment. _After #376._
3. **`khai-tour`** reworked to Venue + `kind`: shared pipeline + an
   interactive-only instructions stage. _After #377/#378 reconciled._
4. **`khai-roadie`** skill: the two jobs (Stage, Tour) over the packages.
   _After 1–3._

First cell to prove end-to-end: **Prose × Gemini Gem.**

## 13. Open / deferred

- **Mode structure** -- shared base + per-mode overlay vs full distinct file per
  mode vs hybrid (base + mode + format snippet). _Not decided._
- **Formats beyond Prose** -- Dialogue, Screenplay, narrated-dialogue. _TBD._
- **`khai-stage`'s exact role** in the Stage job. _TBD._
- **Venue Profile field schema** (constraints, format, render rules). _TBD._
- **What the Roadie consumes from spine** (`compose()` / exports surface). _TBD._
- **Conformance**: do `###` Mode subsections pass the HACKS card, or do Modes
  become bold labels? _Verify at build._
