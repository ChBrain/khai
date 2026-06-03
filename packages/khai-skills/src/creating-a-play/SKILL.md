---
name: creating-a-play
description: Creates a khai "play" component, the whole production that binds many plots into one telling via the ENACTS chapters (Estate, Name, Arc, Company, Triggers, Stakes). Use when building or scaffolding a play, defining a KAI World production arc, company, triggers, or stakes, or when asked to create, draft, or write a play file.
license: CC-BY-NC-4.0
---

# Creating a play

A **play** is the whole production. Many plots run inside it, and one arc
binds them into a single telling. A play does not act out a scene: it sets
what every plot inherits and what they all add up to. Build a play when you
need the container above a set of plots, not the scenes themselves.

A play file has six chapters, in order. Their first letters spell **ENACTS**:

| Chapter      | Holds                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| **E**state   | Who holds the whole run and answers for it: the production this play belongs to.    |
| **N**ame     | The title the production runs under, that every plot is billed beneath.             |
| **A**rc      | The overarching story: the bend that makes the plots one telling, not a list.       |
| **C**ompany  | The closed cast the play may field: personas, pieces, places, processes, positions. |
| **T**riggers | The clockwork chaining the plots: each plot's close is the next one's cue.          |
| **S**takes   | What the whole production is fighting over: every plot must move it.                |

The full per-chapter guidance is in
[references/template_play.md](references/template_play.md). Load it before
drafting. Do not paraphrase it from memory: it is the canonical template.

## Workflow

Copy this checklist and tick each item as you go:

```
Play build:
- [ ] 1. Orient: confirm a play is what is needed (a production over plots)
- [ ] 2. Interview the six ENACTS chapters, one at a time
- [ ] 3. Draft the file from references/template_play.md
- [ ] 4. Self-check against the checklist below
- [ ] 5. Confirm with the requester, then output
```

**1. Orient.** A play is a container above plots. If the request is a single
scene or a step-by-step run, that is a plot, not a play. If no one answers for
the whole run, there is no production yet: surface that before continuing.

**2. Interview.** Ask only what is needed to fill the template, one question at
a time, and stop when there is enough. Take the chapters in ENACTS order:
Estate, then Name, Arc, Company, Triggers, Stakes. Company is a closed cast:
list every persona, piece, place, process, and position the plots may draw
from, and nothing else.

**3. Draft.** Produce the complete file using
[references/template_play.md](references/template_play.md). Open with the YAML
frontmatter block the template carries (at minimum `khai: play` plus the stamp
block). Use the six `## ` chapter headers exactly as named, in order: the H2
sequence must still spell ENACTS. Link each Company member and each stake where
a file exists; where it does not, name it without a link and ask whether it
should become its own khai component.

**4. Self-check.** Run every line before showing the draft:

```
- [ ] Frontmatter declares khai: play and carries the stamp block
- [ ] Exactly six chapters: Estate, Name, Arc, Company, Triggers, Stakes, in order
- [ ] Estate names who answers for the whole run (the production)
- [ ] Name is the run's billed title, distinct from the H1 file heading
- [ ] Arc is a bend, not a list: reordering the plots would lose something
- [ ] Company is closed: a plot reaching past it has gone off the play
- [ ] Triggers chain: each plot's close is the next plot's cue
- [ ] Stakes move: a plot that leaves them unchanged does not earn its place
- [ ] References to existing files are linked; missing ones are named, not linked
```

**5. Confirm and output.** Show the draft, wait for approval, then deliver the
file named `play_[name].md`.

## Quality rules

- **The H2s must spell ENACTS.** Adding a generic `Owner` or `Title` chapter
  breaks the mnemonic. Estate and Name already carry the whose and the what.
- **A play is not a plot.** If it acts out one run of scenes, it is a plot.
- **No arc, no play.** If the plots could be reordered with nothing lost, the
  Arc is missing.
- **Closed Company.** The cast is a fixed set; a plot may draw only from it.
- **House voice.** Do not use em-dashes or en-dashes in the output file. Use
  colons, ellipses (...), or line breaks instead.

## Failure modes to watch for

- **Plots that do not hand off.** Without Triggers chaining close to cue, the
  play is a pile of scenes, not a run.
- **Inert Stakes.** A production whose stakes end where they began has no
  pressure: every plot must move them, in whatever shape the telling takes.
- **A list pretending to be an Arc.** If nothing breaks when the plots are
  reordered, name the bend or admit there is none.
- **An open Company.** A cast that grows as plots demand is not a Company: it is
  a sign the play's boundary was never set.
