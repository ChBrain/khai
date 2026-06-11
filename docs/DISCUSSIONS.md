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

| The discussion…           | … is the khai Play structure         |
| ------------------------- | ------------------------------------ |
| the whole deliberation    | a **Play** (ENACTS)                  |
| its four phases (P·D·C·A) | four **Plots**, chained by Triggers  |
| each Persona's proposal   | a **Plan** (TO DOIT), cast in a Plot |
| the cast it may field     | the Play's **Company**               |
| what it is deciding       | the **Stakes**                       |
| PDCA as one shape         | the **Arc**                          |

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

| Plot      | What it casts                                                  |
| --------- | -------------------------------------------------------------- |
| **Plan**  | each Persona's competing **Plan** — the debate, cast as forces |
| **Do**    | the Action taken on the chosen Plan                            |
| **Check** | the evidence weighed against the Plan's Targets                |
| **Act**   | the verdict: adopt, adjust, or re-open                         |

The **Plan plot is where the tension lives**. Each Persona, arguing from its
**Persona** (character) and its **Position** (accountability), casts a Plan. The
Choregos casts two — Nicias's and Pericles's — and they pull against each other
by design. This is not bolted on: the Plot card says a plot succeeds when the
**Action forces the system to move but the Tension prevents it from moving
smoothly**. That _is_ a debate.

## 4. Each Persona has a Plan — and a Plan is a DO IT

The Plan type's mnemonic is **TO DOIT**: **D**irection, **O**rders,
**I**mplementation, **T**argets. So a Persona's proposal is _already_ a
management order in structure. This resolves the two-mnemonic worry:

- **PDCA** governs the **discussion** — the Play's four plots.
- **DO IT** governs the **Plan** each Persona brings into it.

They are not rival models. PDCA is the Play; DO IT is the Plan inside it. The
**Act** plot resolves which Plan's Targets are accepted, and that Plan's Orders
become the management order that rides out to the work (the rider defined in the
voice layer). Discussion → decision → order, in one continuous structure.

## 5. The cycle vs the chain

A Play's Triggers chain plots **linearly**: one plot's close is the next one's
cue. PDCA's Act→Plan loop is therefore **across Plays, not inside one**. One Play
is one turn of the wheel; re-opening a decision is a **new Play that chains off
the last** through its Estate. This keeps every discussion a finite, resolvable
artifact: a Play completes when its Stakes are moved and its chosen Plan has no
open `[ ]` Targets.

## 6. The complete cast — one of each, to test

The element types are Persona, Position, Plan, **Piece, Place, Process**. A
discussion naturally fields Personas, Positions, and Plans. To exercise the
**whole** cast — and prove the gate sees every type — the test fixture adds
**one Piece, one Place, one Process**:

| Element     | In a discussion Play                                        |
| ----------- | ----------------------------------------------------------- |
| **Piece**   | the artifact on the table (the doc, the PR, the constraint) |
| **Place**   | where it is staged (the repo, the house, the room)          |
| **Process** | the procedure in play (the gate, the review, PDCA itself)   |

One each is enough: the Company lists them, a plot casts them, and the standard
checks that nothing reaches past the Company.

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
