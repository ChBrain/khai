# Discussions as Plays — the management collaboration model

> Status: design spec (draft for review). Captures the model for treating a
> management discussion as a khai Play, so the existing conformance standard
> validates it. Nothing here is built yet; the test fixture is in §8.
>
> Capitalization follows the house rule (docs/ROADIE.md §9): the spec register
> capitalizes khai's defined vocabulary; ordinary words stay lowercase.

## 1. The claim

A management discussion is **not a new content type**. It is a **Play**. The
company already has Personas and Positions; the canon already has Plays, Plots,
and the element types. Stage a discussion as a Play and the **standard
conformance gate validates it unchanged** — no bespoke "discussion" schema, no
new machinery.

The voice layer ([management_instructions.md](../management_instructions.md))
says _the team debates_. This note says _the debate is a Play_, and shows the
mapping that lets the standard carry it.

## 2. The mapping

| The discussion…           | … is the khai Play structure        |
| ------------------------- | ----------------------------------- |
| the whole deliberation    | a **Play** (ENACTS)                 |
| its four phases (P·D·C·A) | four **Plots**, chained by Triggers |
| each player's objective   | a standing **Plan** (TO DOIT)       |
| the cast it may field     | the Play's **Company**              |
| what it is deciding       | the **Stakes**                      |
| PDCA as one shape         | the **Arc**                         |

The Play's six chapters (Estate, Name, Arc, Company, Triggers, Stakes) carry it:

- **Company** declares the cast — the Personas (Nicias, Pericles, the Theatre
  Manager…) plus the Pieces, Places, Processes, and Positions in play. _A plot
  draws only from here; reach past the Company and it has gone off the play._
- **Triggers** chain the four plots: Plan's exit cues Do, Do's cues Check,
  Check's cues Act.
- **Arc** is PDCA itself — the bend that makes four plots one telling.
- **Stakes** is the decision under pressure: each plot earns its place by moving
  it.

## 3. The four plots are PDCA

The plots chain as the Deming cycle. Each is an ordinary Plot (Cue · Action ·
Stage · Tension):

| Plot      | What it casts                                            |
| --------- | -------------------------------------------------------- |
| **Plan**  | the standing **Plans** collide — each player's objective |
| **Do**    | the Action taken on the chosen Plan                      |
| **Check** | the evidence weighed against the Plan's Targets          |
| **Act**   | the verdict: adopt, adjust, or re-open                   |

The **Plan plot is where the tension lives**. Each player tables its **standing
Plan**, arguing from its **Persona** (character) and its **Position**
(accountability). The Choregos tables two — Nicias's and Pericles's — pulling
against each other inside one seat. This is not bolted on: the Plot card says a
plot succeeds when the **Action forces the system to move but the Tension
prevents it from moving smoothly**. Conflicting standing Plans _are_ that engine.

## 4. Standing Plans — what each player wants, and where they collide

A **Plan** is not invented in the meeting. It is **standing**: what a player
wants to achieve, carried into every discussion. The canon makes this exact — a
Plan is `class: meta` (a forward-looking blueprint, **TO DOIT**: Direction ·
Orders · Implementation · Targets), and a Position "persists after the Persona
leaves," so the objective it drives toward stands with it.

- **Every Position has a standing Plan.** It is the Position's **Drives** written
  as a Plan: the Roadie's is _keep the chain current and reach the audience_; the
  Theatre Manager's is _the house runs and conforms_; the Playwright's is _the
  art_; the Choregos's is _the production and the season_.
- **Personas may carry one too** — a character's own aim layered on the
  Position's: Nicias wants the cautious read to hold; Pericles wants the
  long-view selection to land.

These standing Plans **conflict by design, and the conflict is persistent** — not
a one-off. The Roadie's pull toward stability fights the Playwright's pull to
change the art; the Choregos's two personas pull against each other inside one
seat. A discussion does **not create** the conflict; it is where the standing
Plans **collide and are resolved for this turn**. The chosen Plan's Orders ride
out as the management order (the rider in the voice layer); the Plans that lost
**stay standing**, and collide again next discussion.

So the two mnemonics are not rivals. **PDCA** is the discussion (the Play's four
plots); **DO IT** is the standing Plan each player brings into it. PDCA is the
Play; DO IT is the Plan inside it. The **Act** plot resolves which standing Plan's
Targets are accepted: discussion → decision → order, in one continuous structure.

## 5. The result of a turn

The Act plot closes the turn with one of two results. The criterion is simple:
can the chosen Plan be finished **in-flight**?

1. **Done in-flight (no plan file).** If the work can be completed now, it is: the
   Orders are worked directly (a PR), or the Roadie tours it now. Nothing is
   parked; the turn does the work.
2. **A management order (a plan file).** If steps are still missing, the chosen
   Plan is written as a Plan file under `management/orders/` and parked for later
   pickup — the same TO DOIT blueprint, its final step the deliverable (for a
   tour, the tour itself). A plan file exists only because the work could not
   finish in-flight.

Either result is a Plan; the only difference is whether it runs now or is parked.

A parked order carries a **target**: the address it directs work against. What it
may target depends on the scope you are deliberating in.

| Deliberating in…                | An order may target…                                       |
| ------------------------------- | ---------------------------------------------------------- |
| the chain (`khai`)              | `khai`, or any house in the registry                       |
| a house                         | the house itself, or `khai`                                |
| a website (a specialised house) | the website itself, or any package that delivers the house |

The target addresses up (toward `khai`), sideways (a sibling house in the
registry), or down (a package that delivers the current house) — always inside
the chain. An order whose target does not resolve is not yet placed, the same way
a play whose cast reaches past its Company has gone off the play.

## 6. Surfacing what's in flight

Because pickup is deliberate, management's standing job is to keep the in-flight
work **visible**, so the Human can set priority and sequence. Management surfaces
four kinds of in-flight work:

1. **Issues** — requested but not yet planned: intent.
2. **Plans** — parked orders (Plan files under `management/orders/`): deferred
   work whose steps are not all in place.
3. **PRs** — work in flight, awaiting review and merge.
4. **Branches** — work in progress that has not opened a PR yet.

Surfacing is not deciding. Management lays the four out and **advises on priority
and sequence** (what unblocks what, what is behind, what is ready); the Human
decides and holds the authority to merge and deploy. Deciding the sequence is
itself a discussion-as-Play, whose Piece is this in-flight inventory and whose
result is an ordered plan.

## 7. The cycle vs the chain

A Play's Triggers chain plots **linearly**: one plot's close is the next one's
cue. PDCA's Act→Plan loop is therefore **across Plays, not inside one**. One Play
is one turn of the wheel; re-opening a decision is a **new Play that chains off
the last** through its Estate. This keeps every discussion a finite, resolvable
artifact: a Play completes when its Stakes are moved and its chosen Plan has no
open `[ ]` Targets.

## 8. The complete cast — the test fixture

The **elements** (class `element`) are five: Persona, Position, **Piece, Place,
Process**. (Plan is `class: meta`, not an element — it is the standing objective
of §4, carried by a Position, not cast in the Company.) A discussion naturally
fields Personas and Positions; the fixture adds the other three so the gate sees
every type. For a discussion about a **change landing across the chain**:

| Element     | In this fixture                                                              |
| ----------- | ---------------------------------------------------------------------------- |
| **Piece**   | **the change** — the PR as a general anchor, not a specific number           |
| **Place**   | **two**: `khai` (the monorepo) and the **registry** (all registered houses)  |
| **Process** | **theatre-chain management** — the management process itself (PDCA included) |

**Place is the type that naturally fields more than one here.** A change to `khai`
propagates to every registered house, so the discussion is staged in both Places
at once — `khai` and the registry. That is not padding the fixture; it _is_ the
Roadie's standing plan (keep the chain current across all houses) showing up as
cast. The Process closes the loop: the procedure in play is chain management, and
this discussion is one turn of it.

So the fixture casts one Piece, two Places, one Process, plus the Personas and
Positions. The Company lists them, the plots cast them, and the standard checks
that nothing reaches past the Company.

## 9. Why the standard already works

Nothing above adds a type or a chapter. A discussion Play is an ordinary Play:
ENACTS chapters, plots chained by Triggers, a Company every plot draws from, an
Estate it logs into. So:

- the **conformance test** validates it as-is (chapters present, Company closed,
  links resolve, Estate logged);
- the **guard / lanes** treat it as content (it lands in a play house);
- the **voice layer** stops being prose to hand-tune and becomes content the
  gate can check.

That is the whole point of the move: **management deliberation becomes
first-class khai content** — produced, chained, and conformed like any Play.

## 10. The discussion register

A discussion is enacted in voice, and its register **inverts the Prose
Standard's balance**. Prose says _everything is a Scene_ and lets narration
bridge; a discussion says _everything is a discussion_ and lets the **dialogue
carry**. Narration is still needed, but **limited**: it serves the dialogue and
stays out of its way. On the plot this maps cleanly — narration is the **Cue**
and **Stage** (the setup); dialogue is the **Action** and **Tension** (the
engine).

This is the management-track analog of the runtime Prose Standard. Below is a
draft **Discussion Standard** to learn from, trim, and eventually lift into its
own file (the same way the Prose Standard is a file in spine):

```markdown
---
khai: instructions
title: "Discussion"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-06-11"
---

# Instructions: Discussion

## Human

- Sets requirements.
- Reviews and approves plans.
- Holds all authority to merge and deploy.

## Agent

- Speaks and acts through the management Personas.
- Everything is a discussion.
- Narrates only to bridge; the dialogue carries the rest.

## Collaboration

- Personas argue in their own voices, each prefixed.
- One move triggers the next: the Persona whose standing plan is most pressed responds.
  - Not a rotation.
  - A Persona might be skipped.
  - A Persona might speak twice.
  - Pressing a plan is a move; conceding is a move; silence is a move.
- The discussion rests when no standing plan has anything left to press; the decision falls out, it is not forced.

## Knowledge

- Behavior is evidence.

## System

- Dialogue over narration: the exchange carries the turn; narration stays out of its way.
- Limit narration to three places: the cue that opens, the bridge between moves, the verdict that closes. Brief each time.
- Never narrate what a Persona means; let the Persona say it.
- Surface reasoning through the dialogue, not commentary; the Human follows the argument, not a summary.
```

Once it stabilises, this lifts into its own Standard file on the management track,
beside the Management voice layer. The operative lines also fold into that voice
layer's Agent / Collaboration / System now, so the register is in force before
the Standard is its own file.

## 11. Decisions and open questions

- **Where discussion Plays live.** _Resolved._ A discussion Play lives in
  `management/discussions/` at the scope where the deliberation happens: the
  chain's for chain-level discussions, each house's for house-level ones. Not a
  separate management house, and not under `plays/` (which holds the source's
  productions and the playhouse registry). This mirrors the §5 targeting rule
  (you deliberate in a scope; the order addresses out from it), and the fixture
  and house blueprint already embody it.
- **Touring a decision.** _Resolved._ Touring is never automatic: it is a
  deliberate decision a house makes, to any destination (any Venue), executed by
  the Roadie. It follows the §5 result rule like any other work — toured in-flight
  needs no plan file; if steps are missing, a Plan is created whose final step is
  the tour. So a discussion does not "tour by default" and is not
  "publication-only"; a tour is its own decided act.
- **Order pickup.** _Resolved._ Never automatic: a parked order is taken up by a
  deliberate hand-off at its target scope, once its missing steps are met (the
  step landing is the cue, not a trigger). Management does not auto-pick-up; it
  surfaces the in-flight work (§6) and advises priority and sequence, and the
  Human decides.
- **Modes.** _Resolved._ Modes don't apply. Play Mode / Analysis Mode are an
  audience/runtime concept (the play-instructions track); a discussion is on the
  management track. It is enacted live in voice for the Human (interactive by
  nature) and recorded as the Play file — no Mode switch.
