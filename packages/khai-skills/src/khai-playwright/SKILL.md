---
name: khai-playwright
description: In khai-playwright mode you become the playwright and build a khai "play" together with the author, read two ways. Mode A authors a single play file (the ENACTS container with chapters Estate, Name, Arc, Company, Triggers, Stakes). Mode B authors a full play, the play file plus every plot it chains and every process, position, piece, place, persona, and plan those plots draw on, plus the play's pitch (its default key) where it has one. Use when building or scaffolding a play, a KAI World production, its plots, or its cast, or when asked to create, draft, or write a play.
license: CC-BY-NC-4.0
---

# Playwright

In khai-playwright mode you are the playwright: you build the play together with
the author. A **play** is the whole production: many plots run inside it, and one
arc binds them into a single telling. You build it two ways:

- **Mode A, a play file** : the ENACTS container on its own.
- **Mode B, a full play** : the play file plus every plot it chains, plus every
  element those plots draw on.

Decide the mode first. Mode B always builds Mode A as its first step.

## The play file (both modes start here)

A play file has six chapters, in order. Their first letters spell **ENACTS**:

| Chapter      | Holds                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **E**state   | Who holds the whole run and answers for it: the production this play belongs to.                                                 |
| **N**ame     | The title the production runs under, that every plot is billed beneath.                                                          |
| **A**rc      | The overarching story: the bend that makes the plots one telling, not a list.                                                    |
| **C**ompany  | The closed cast the play may field: personas, plans, pieces, places, processes, positions, and a pitch (the play's default key). |
| **T**riggers | The clockwork chaining the plots: each plot's close is the next one's cue.                                                       |
| **S**takes   | What the whole production is fighting over: every plot must move it.                                                             |

Author it from [references/template_play.md](references/template_play.md). Open
with the YAML frontmatter the template carries (at minimum `khai: play` and the
stamp, plus an optional play-specific `voice` override brief). Use the six `## `
headers exactly, in order: the H2 sequence must spell ENACTS. Interview one
chapter at a time; stop when there is enough. Link each Company member and each
stake where a file exists; where it does not, name it.

**Self-check the play file:**

```
- [ ] Frontmatter declares khai: play and carries the stamp
- [ ] Frontmatter declares the play-specific voice (optional, overriding the house voice)
- [ ] Six chapters, in ENACTS order, no generic Owner/Title chapter added
- [ ] Estate names who answers for the whole run
- [ ] Arc is a bend, not a list: reordering the plots would lose something
- [ ] Company is a closed cast (the set every plot draws from)
- [ ] Triggers chain: each plot's close is the next plot's cue
- [ ] Stakes are something every plot can move
```

If the mode is A, deliver `play_[name].md` and stop here.

## Mode B, the full play

The hierarchy. The play sets the boundary; the plots cast forces inside it; the
elements are what the plots cast:

```
play  (ENACTS)        the production: Company is the closed cast, Triggers the plot chain
 └─ plot  (TO CAST)   Cue, Action, Stage, Tension : draws elements only from the Company
      └─ process, position, piece, place, persona, plan  : the cast a plot casts
```

A plot file has chapters Cue, Action, Stage, Tension (mnemonic **CAST**, under a
`## Taxonomy` and `## Owner` prefix). Cue draws a place; Action draws processes,
positions, and personas; Stage draws personas, pieces, and plans; Tension draws a piece, a process, or a plan.

The play's **pitch** (its default key, the tonal register the events are played
in) is fielded in the Company and authored from
[references/template_pitch.md](references/template_pitch.md). Unlike the system
elements, it is not drawn by a beat: it sets the key the play is read in, and the
Director may tune it at production time. Author it only when the play has a native
key worth fixing; otherwise leave the pitch to the Director.

**Build sequence:**

1. **Author the play** (above). Its Company is the closed cast; its Triggers name
   the plots and their order.
2. **For each plot the Triggers chain**, author it from
   [references/template_plot.md](references/template_plot.md), drawing every
   Cue / Action / Stage / Tension element **only from the play's Company**.
3. **For each Company element a plot draws on that has no file yet**, author it,
   in this fixed order: process, then position, piece, place, persona, plan. Templates:
   [process](references/template_process.md),
   [position](references/template_position.md),
   [piece](references/template_piece.md),
   [place](references/template_place.md),
   [persona](references/template_persona.md),
   [plan](references/template_plan.md).

### The plan element: a scheme caught between done and undone

A `plan` is an in-world blueprint: not dialogue, but a mechanism with order. Who
acts, in what sequence, to what end, and how far it has got.

Its **Owner** is the subject it is directed at, and the subject sets the kind: a
**persona** holds a personal scheme; a **position** drives a mandate (the office
acts, not the person: a warden's plan to put out a fire); a **process** carries a
method (how a mechanism is run); a **place** a development (its becoming); a
**piece** a making (its construction); the **project** a production directive. A
plan **commands, it never copies**: its Orders reference existing elements, so two
plans may drive one `process` (one poison, two schemers) without duplicating it.
So the Owner is what the plan is _for_; its **Orders** name the agents who _act_;
and its **Targets** carry a verdict on each step, where the drama sits:

- `[ ]` open: no verdict yet, the live edge;
- `[x]` done: achieved;
- `[F]` failed: attempted, missed;
- `[W]` waived: a live step dropped or overtaken by events;
- `[-]` struck: cut as moot or never applicable.

"Resolved" is a verdict, not a success, so a plan may carry failed, waived, or
struck targets. Keep an in-world plan `status: active`: it is a live scheme, not
a finished record.

**Set the targets to the state at the moment the curtain rises, not the ending.**
A play opens _before_ its schemes have played out, so every step the production
will still enact stays `[ ]`, the live edge the scenes decide: the poison not yet
poured, the flight not yet made, the proof not yet won. Only what is already
settled when the play begins, its backstory, carries a verdict: a step the world
completed before the first scene is `[x]` (or `[F]`/`[W]`/`[-]` for how it went).
So _Woyzeck_ opens with the Doctor's diet already running: that step is `[x]`,
while the killing it drives stays `[ ]`. The line between `[ ]` and the rest is
the curtain itself; pre-marking an outcome the play has yet to stage steals the
scene's drama before it is played. The mix of `[x]`/`[F]`/`[W]`/`[-]` among the
resolved is how the scheme stood at the open, and `[F]`/`[W]`/`[-]` are where its
settled past already swerved from clean success. A plan steers the scene
structurally; it never dictates the lines.

### Staying in lane (what the play defines, the plot may not exceed)

The play defines what is in the production. A plot must stay in that lane:

- **A plot draws from the Company, and only the Company.** It need not use every
  member, but it may use no element the Company does not name. An element a plot
  references that is **not in the Company** has gone off the play: **stop**.
  Either add it to the Company (amend the play) or drop it from the plot. This is
  the bite: what the play leaves undefined cannot appear in a plot.
- **A Company member a plot references but that has no file** is an obligation
  the plot inherits: author it (step 3) before the plot is done.

**Two kinds of check, do not confuse them:**

- **Existence, mechanical.** Every element a plot names resolves to a Company
  member with a file. This is testable by structure alone (a tool-capable runtime
  runs the khai conformance kit; running solo, confirm each reference resolves).
- **An existing Position file is cast, mechanical.** Naming a role in prose
  raises no duty, and not every seat is worth a file. But each `position_[name].md`
  that does exist is a seat some persona fills, so at least one persona's Taxonomy
  must link it, `[its name](position_[name].md)`. The conformance kit fails a
  Position file no persona claims, so before you ship, confirm every
  `position_[name].md` is held in some persona's Taxonomy: one persona may hold
  several, several may share one.
- **Judgement, by review.** That each plot **moves the Stakes**, that the
  **Tension** genuinely blocks the Action, that the **Arc** actually bends across
  the plots, that the **Triggers** chain close to cue. Structure cannot settle
  these; flag them for review. A model running solo must self-check them and say
  so, not assume them passed.

### Output

One zip carrying the whole production in the world layout:

```
[play-name]/
  play_[name].md
  plot_[name].md            (one per plot the Triggers chain)
  process_[name].md         (every element a plot draws on)
  position_[name].md
  piece_[name].md
  place_[name].md
  persona_[name].md
  plan_[name].md
```

## Quality rules

- **The play H2s spell ENACTS; the plot H2s spell CAST** (under Taxonomy/Owner).
  Adding a generic chapter to either breaks the mnemonic.
- **A play is not a plot.** The play sets what every plot inherits; a plot casts
  one collision of forces inside it.
- **Closed Company, subset plots.** The cast is fixed at the play; each plot uses
  some of it, never more than it.
- **House voice.** No em-dashes or en-dashes in output files. Use colons,
  ellipses (...), or line breaks instead.

## Failure modes to watch for

- **A plot off the play.** An element appears in a plot that the Company never
  named: the lane was broken. Amend the play or cut it.
- **A list pretending to be an Arc.** Reorder the plots and nothing is lost: name
  the bend or admit there is none.
- **Plots that do not hand off.** Triggers that do not chain close to cue leave a
  pile of scenes, not a run.
- **Inert Stakes.** A plot that leaves the Stakes where it found them did not earn
  its place.
- **A plot with no Tension.** If the Action could run cleanly to its end, the plot
  is a list of events, not a plot.
