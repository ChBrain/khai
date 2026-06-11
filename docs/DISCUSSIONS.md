# Discussions as Plays — the management collaboration model

> Status: design spec (draft for review). Captures the model for treating a
> management discussion as a khai Play, so the existing conformance standard
> validates it. Nothing here is built yet; the test fixture is in §6.
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

## 5. The cycle vs the chain

A Play's Triggers chain plots **linearly**: one plot's close is the next one's
cue. PDCA's Act→Plan loop is therefore **across Plays, not inside one**. One Play
is one turn of the wheel; re-opening a decision is a **new Play that chains off
the last** through its Estate. This keeps every discussion a finite, resolvable
artifact: a Play completes when its Stakes are moved and its chosen Plan has no
open `[ ]` Targets.

## 6. The complete cast — the test fixture

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

## 7. Why the standard already works

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

## 8. Open / deferred

- **Where discussion Plays live.** A management house, or the chain's
  `management/`? They are chain-level, but they are still Plays. _TBD._
- **Touring a decision.** Does a resolved discussion tour to a Venue (a decision
  record at a publication Venue), or stay internal? If it tours, the Estate /
  Venue model applies unchanged. _Open._
- **Act emits the order.** The exact handoff from the Act plot's chosen Plan to a
  `management/orders/` rider — automatic, or authored. _TBD._
- **Modes.** Is a discussion ever played interactively (Play Mode), or only
  recorded (Analysis Mode)? _TBD._
