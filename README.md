# khai

**Everything is theatre.**

khai was born under that one idea, and the idea is older than any repository.
All the world's a stage, and all the men and women merely players
(Shakespeare, _As You Like It_). Every everyday encounter is a performance: a
front presented to an audience, managed backstage before it is shown
(Goffman, _The Presentation of Self in Everyday Life_, 1959). khai takes the
claim at its word and builds with it: if all interaction is theatre anyway,
then theatre is the honest type system for work — human and AI together — and
pretending otherwise only leaves the stagecraft implicit and unmanaged.

So in khai nothing is a ticket, a prompt, or a pipeline. Everything is a
production.

## The model

A **Play** is the production; a **Plot** is one scene inside it. Each scene
carries its elements: a **Process** (what moves), a **Position** (what the
world demands of whoever holds it), a **Piece** (what carries more weight than
it shows), a **Place** (the pressure environment), a **Persona** (the specific
human the scene runs through). A **Plan** maps intent; a **Pitch** sets the
key the whole production is played in. **Architecture** is the extension seam,
**Instructions** the method, and **Engines** come through the seam to enrich
the stage.

The claim runs all the way down: the management layer is itself theatre.
Agents never speak as tools; they speak through named Personas holding
Positions, they collide as a discussion Play, and the decision falls out of
the dialogue — it is not forced.

The canon is [`packages/khai-arch`](packages/khai-arch), rendered at
[architecture.kaihacks.ai](https://architecture.kaihacks.ai). The name is the
specification: **KAI** (Kais, Architecture, Instructions) · **HACKS** (Human,
Agent, Collaboration, Knowledge, System) · **AI** (Agent, Implemented).

## What lives here

This monorepo holds the canon, the mechanism, and the engine content. The
productions themselves live in separate houses (below).

**The canon**

- [`packages/khai-arch`](packages/khai-arch) — the architecture spec: type
  definitions, mnemonics, and chapter rules.

**The mechanism**

- [`packages/khai-rules`](packages/khai-rules),
  [`packages/khai-tests`](packages/khai-tests),
  [`packages/khai-review`](packages/khai-review),
  [`packages/khai-language`](packages/khai-language) — validation: the pure
  rule atoms, the conformance kit that gates, the NLP-review lane that judges
  and advises, the language checks.
- [`packages/khai-guard`](packages/khai-guard) — the branch guard: the lane is
  computed from the diff, not chosen by hand.
- [`packages/khai-stage`](packages/khai-stage) — the impresario's generator:
  stamps a new production house from the codified blueprint.
- [`packages/khai-pack`](packages/khai-pack),
  [`packages/khai-tour`](packages/khai-tour) — serving and touring: bundle
  khai work and adapt it to its venues and audiences.
- [`packages/khai-skills`](packages/khai-skills),
  [`packages/khai-methods`](packages/khai-methods) — the skills kit and the
  methods registry built from the canon.

**The content**

- [`packages/engines`](packages/engines) — the engine domains, `adoption`
  through `wow`: the psychology, sociology, and economics that enrich a
  scene, each domain credited to its sources.
- [`packages/khai-plays`](packages/khai-plays) — the bill of houses: khai
  holds the registry, never the productions.

## The houses

A production house is its own repository, raised by `khai-stage` and
conformed by `khai-tests`. Each house stages one source as plays — for
example [khai-misfits](https://github.com/ChBrain/khai-misfits), the
catalogue of structural traps: productions where locally rational behaviour
sums to a globally bad outcome with no villain required.

## Working here

[CLAUDE.md](CLAUDE.md) is the short, executable coding contract every agent
follows; [docs/BRANCHING.md](docs/BRANCHING.md) holds the depth. The one rule
that removes the guesswork: do not choose a branch by hand — edit first, then
let the guard compute the lane (`npx khai-guard branch <topic>`).

## Licensing

khai's concepts are NonCommercial while the code stays open: content is
[CC-BY-NC-SA-4.0](LICENSE), code is [MIT](LICENSE-CODE), and the work of
others that khai stages is not ours to licence — it is credited
(`invented_by` + `source`), packaged, and never claimed.
