---
updated: "2026-08-25"
---

# Engine & composite gaps — a chase list

A structured backlog of **genuinely-missing, well-warranted** engines and
composites, produced by a systematic gap analysis: ten domain-expert passes,
each enumerating its field's canonical constructs and diffing them against the
full inventory (163 engines, 20 composites at the first pass), verifying each
candidate against actual member files — not directory names — so that a
construct already owned as a _form_ of an existing engine is not counted as a
gap. Later passes are recorded in place; **the inventory the list is diffed
against is now 276 engines and 99 composites (2026-08-24)**, and every count in
a heading below is the count that heading was written against, not today's.

This is a **planning artifact**, not canon. Nothing here is committed content;
each row is a proposal to be built to the usual standard (LORE warrant, one
phenomenon / one engine, clean boundaries, member-check clean under its own
stem) on its own lane and PR. Update **Status** as items land.

**Status legend:** `proposed` · `approved` · `building` · `shipped` · `parked`
(deferred) · `rejected` (with reason).

**A distinct stem beats a homonym whitelist** (maintainer's ruling, 2026-08-24).
When a candidate's obvious stem is already claimed, the resolution is a
_different name_ — not an entry in `memberPolicy.homonyms`. The whitelist stays
what `AGENTS.md` rule 7 makes it: the maintainer's call, for the case where the
same word genuinely carries two sciences and neither side can be renamed without
losing the field's own term. It is the last resort, not the first offer, and no
**open** row below proposes one — the rows that used to offer the choice now
name the stem to build under. (Tier 2's heading is left as it was written: those
rows shipped, and the heading is a record of how they looked at proposal.) The
49 entries already in `memberPolicy.homonyms` are chased for distinct names in
"The homonym backlog" below — the ruling reads forward, but the backlog is what
it implies about what is already there.

**Every candidate table carries a Status column.** Nineteen of the later tables
were written without one and went stale: 24 rows had shipped and still read as
unbuilt. A table without a Status column cannot be audited, so a new table gets
one at the point it is written, and a row that lands gets its PR number here in
the same PR — see "Shipped off-chart" below for what happens when it does not.

## How to read a row

Each candidate carries: the **phenomenon** (one line), the **warrant** (key
citations), the **nearest existing engine** and the **boundary** that keeps it
distinct, whether it is an **engine or composite** (composites name the atoms
they read over — all must already exist), and the **collision risk** on its
likely member stem (whether it clashes with the inventory, and the distinct
stem it should take instead).

---

## Cross-cutting findings

**Both clusters are now closed** — recorded here rather than deleted, because
the finding was right and the closure is the evidence that the method works.
The reception cluster closed with `transportation` (#973), `allegiance` (#974)
and `dramatic-irony` (#999) as engines, `comic` (#1000) and then the
`spectating` composite (#1237) reading all three as one — "what a story does to
the one receiving it." The culture cluster closed with `self-construal` (#982),
`tightness-looseness` (#983) and `worth-logic` (#1006). The two findings as
first written:

1. **The audience / reception side of narrative.** The structural and authorial
   axis is saturated (Freytag → `dramatic-arc`, Polti → `dramatic-situations`,
   Campbell → `monomyth`, Propp → `morphology`, Genette's hypertextuality →
   `palimpsest`, _peripeteia_ → `reversal`, catharsis → `tragic`), but how an
   _audience_ engages a fiction is nearly empty. For a system whose purpose is
   running live productions before an implied audience, this is the most
   consequential gap.
2. **Cross-cultural values architecture.** khai has essentially no culture-level
   constructs — tightness–looseness and individualism–collectivism are both
   absent with first-rate warrant, and could anchor a small `culture` cluster.

**Two candidates were independently flagged by two different domain passes**
(strong signal): **ostracism** (social + group) and **individualism–collectivism
/ self-construal** (self + group).

**Four gaps the codebase already disclaims in its own REFERENCES** — the
highest-confidence rows, because an existing engine explicitly hands the
territory away:

- `fear` scopes itself to phasic/cued fear and names anxiety as outside its
  boundary → **anxiety**
- `virtue` disclaims the standing trait ("models the firing as event, not
  trait") → **moral-identity**
- `loneliness` delegates specific rejections away → **ostracism**
- `space` models the setting-as-mover, not the person's bond → **place-attachment**

---

## Tier 1 — build-ready (strong warrant, clean stems, high value)

| #   | Candidate            | Phenomenon                                                                     | Warrant                                                                                  | Nearest / boundary                                                                                            | E/C                                               | Status         |
| --- | -------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------- |
| 1   | **anxiety**          | diffuse, anticipatory dread of an uncertain future threat                      | Barlow; LeDoux; Gray & McNaughton; Grupe & Nitschke                                      | `fear` (phasic/cued — disclaims anxiety); `stress` (present mobilization); `hope/dread` (OCC stance)          | Engine (process)                                  | shipped (#969) |
| 2   | **ostracism**        | being excluded → threat to belonging/control/esteem/meaning, then coping       | Williams (need-threat / temporal model); Cyberball                                       | `loneliness` (chronic gap — delegates rejection away); `stigma` (a mark)                                      | Engine (process)                                  | shipped (#970) |
| 3   | **self-control**     | _hot_ in-the-moment override of impulse/temptation; willpower; trait           | Baumeister/Vohs/Tice (strength model); Metcalfe & Mischel (hot/cool); Tangney et al.     | `executive-function` (_cold_ cognitive inhibition); `reward` (the discount that makes the pull)               | Engine                                            | shipped (#975) |
| 4   | **moral-identity**   | centrality of being moral to the self-concept; self-regulatory anchor          | Aquino & Reed (2002); Blasi; Hardy & Carlo                                               | `virtue` (disclaims the trait); `identity` (general); `moral-judgment` (reads others)                         | Engine (position)                                 | shipped (#971) |
| 5   | **transportation**   | absorption _into a narrative world_, with persuasive/emotional effects         | Green & Brock (2000); Gerrig (1993); Busselle & Bilandzic                                | `absorption`/`flow` (content-agnostic merge — not story-world entry or belief change)                         | Engine                                            | shipped (#973) |
| 6   | **allegiance**       | audience morally tracking characters into liking/disliking; "rooting interest" | Zillmann (disposition theory); Raney; M. Smith (_Engaging Characters_); Cohen            | `empathy` (persona→persona); `moral-judgment` (a persona's lens) — neither is spectator→character             | Engine (or C over moral-judgment+empathy+emotion) | shipped (#974) |
| 7   | **place-attachment** | enduring affective bond to a specific place; rootedness; displacement grief    | Low & Altman (1992); Scannell & Gifford (tripartite); Proshansky (place-identity)        | `space` (setting-as-mover); `attachment` (interpersonal); `nostalgia` (temporal longing)                      | Engine (position/process)                         | shipped (#972) |
| 8   | **metacognition**    | the knowing-what-you-know monitor/control loop; FOK, JOL, calibration          | Nelson & Narens (1990); Flavell (1979); Koriat (1993)                                    | `self-monitoring` (Snyder — self-_presentation_, unrelated); `bias` owns only the failure modes               | Engine (process)                                  | shipped (#976) |
| 9   | **possible-selves**  | hoped-for, expected, and feared future self-representations                    | Markus & Nurius (1986); Oyserman                                                         | `identity` (present self-story); `goal` (an end-state, not a self-image)                                      | Engine (position)                                 | shipped (#977) |
| 10  | **self-discrepancy** | actual vs ideal/ought self gaps → dejection (ideal) / agitation (ought)        | Higgins (1987)                                                                           | `regulatory-focus` (same author, different theory — pursuit orientation, not the self-guide gap)              | Engine                                            | shipped (#978) |
| 11  | **extended-self**    | possessions/objects experienced as extensions of identity                      | Belk (1988); Csikszentmihalyi & Rochberg-Halton (1981); James                            | `heirloom` (lineage), `totem` (collective), `document` (inscribed) — all specialize the ordinary private case | Engine (piece)                                    | shipped (#979) |
| 12  | **moral-licensing**  | past good buys latitude for later questionable acts; compensatory cleansing    | Monin & Miller (2001); Merritt/Effron/Monin (2010); Zhong & Liljenquist (Macbeth effect) | `moral-disengagement` (switches off self-sanction for a specific harm — not running credit)                   | Engine (process)                                  | shipped (#980) |

---

## Tier 2 — strong, but need a homonym whitelist or careful naming

| #   | Candidate                                       | Phenomenon                                                                                      | Warrant                                                      | Boundary / friction                                                                                                                                                                                                  | Status         |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 13  | **individualism–collectivism** / self-construal | independent vs interdependent self-construal; cultural default weighting of self-vs-group       | Markus & Kitayama (1991); Triandis (1995); Hofstede          | **Homonym**: the `construal` engine is Construal-_Level_ Theory (Trope/Liberman). Name it `collectivism` / `interdependence`, or whitelist `self-construal`. _(2-pass convergence: self + group)_                    | shipped (#982) |
| 14  | **tightness–looseness**                         | strength of a culture's norms and its tolerance for deviance                                    | Gelfand et al. (2011, _Science_); Gelfand (2018)             | `conformity` (a person yielding) vs the _system property_ upstream of yielding. Clean stems (`tight`/`loose`). Pairs with #13 as a `culture` cluster                                                                 | shipped (#983) |
| 15  | **defense**                                     | unconscious, anxiety-driven reality-distortion; mature→immature maturity hierarchy              | A. Freud (1936); Vaillant (1977); Cramer (2006)              | Distinct from `regulation` (_conscious_ strategy) & `moral-disengagement`. **Homonym load**: `denial` (mortality), `suppression` (regulation), `displacement` (moral-disengagement), `projection` → whitelist needed | shipped (#988) |
| 16  | **self-verification**                           | drive to seek feedback that _confirms_ the self-concept, even when negative                     | Swann (1983, 2012); Swann/Rentfrow/Guinn (2003)              | Opposing motive to self-enhancement (`bias/self_serving`, `dissonance`). Slight adjacency to `bias/self_consistency`; stem `verification` free                                                                       | shipped (#984) |
| 17  | **coping**                                      | effortful, appraisal-driven repertoire vs a stressor (problem/emotion/avoidant/meaning-focused) | Lazarus & Folkman (1984); Carver COPE (1989); Folkman (2008) | `stress` owns the involuntary autonomic routing; `regulation` owns emotion-timeline moves. Must hand emotion-focused coping to `regulation` explicitly                                                               | shipped (#985) |
| 18  | **self-handicapping**                           | erecting obstacles pre-outcome so failure is externally attributable                            | Berglas & Jones (1978); Rhodewalt                            | Behavioral, anticipatory self-protection — not a post-hoc attribution bias (`bias/self_serving`). Keep stem `handicap` distinct                                                                                      | shipped (#986) |
| 19  | **self-affirmation**                            | restoring self-integrity by affirming an _unrelated_ valued domain to reduce defensiveness      | Steele (1988); Sherman & Cohen (2006)                        | Currently a prose footnote in `dissonance`; operates far beyond it (health, stereotype threat). Coupled to `dissonance`/`self-esteem` but not reducible                                                              | shipped (#987) |

---

## Tier 3 — moderate / lean-composite (worth filing; not top priority)

| #   | Candidate                                | Phenomenon                                                                    | Warrant                                                            | Note                                                                                             | Status                                                       |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 20  | **hatred**                               | durable eliminatory sentiment toward a devalued other                         | Sternberg (duplex theory); Fischer et al. (2018)                   | Sustained sentiment vs `anger` (incident) / `contempt` (disengaged dismissal). Engine-leaning    | shipped (#992-994, reworked as the love/hate composite trio) |
| 21  | **belief-in-a-just-world**               | standing conviction the world is fair → victim derogation                     | Lerner (1980); Hafer & Bègue (2005)                                | `schadenfreude` cedes the deservingness judgment; distinct standing worldview. Engine (position) | shipped (#995)                                               |
| 22  | **moral-conviction**                     | the metacognitive stamp that an attitude is a moral imperative                | Skitka et al. (2005); Skitka (2010)                                | Orthogonal to _which_ foundation fires (`moral-judgment`) — the mandate _status_ on an attitude  | shipped (#996)                                               |
| 23  | **altruistic-punishment**                | paying a personal cost to sanction a norm violator (incl. third-party)        | Fehr & Gächter (2002); Fehr & Fischbacher (2004)                   | The behavioral act vs `condemnation`'s emotion. Overlaps `aggression`; discount for that         | shipped (#997)                                               |
| 24  | **capitalization**                       | sharing good news; the partner's active-constructive response builds the bond | Gable/Reis/Impett/Asher (2004); Langston (1994)                    | `savoring` owns only the intrapersonal "sharing"; this is the _responder_ fork                   | shipped (#998)                                               |
| 25  | **dramatic-irony**                       | audience knows what a character does not                                      | Pfister (1988); Sternberg (1978)                                   | `secret` is character↔character; this is audience↔character asymmetry. Small engine              | shipped (#999)                                               |
| 26  | **comic** (composite)                    | the mirth response comedy is built to produce — the twin of `tragic`          | McGraw & Warren (benign violation); Frye; Morreall                 | Composite over `humor` + `surprise` + `emotion`. `tragic` exists; comedy has no counterpart      | shipped (#1000)                                              |
| 27  | **insight**                              | sudden "aha" restructuring, no feeling-of-warmth ramp                         | Metcalfe & Wiebe (1987); Ohlsson (1992)                            | Distinct from `confusion`'s effortful resolve; joins the knowledge-emotion family. Engine        | shipped (#1001)                                              |
| 28  | **mind-wandering**                       | spontaneous, task-unrelated thought; perceptual decoupling                    | Smallwood & Schooler (2015); Killingsworth & Gilbert (2010)        | `attention` selects; this is the self-generated drift away. Engine                               | shipped (#1002)                                              |
| 29  | **analogy**                              | reasoning by relational structure-mapping; transfer                           | Gentner (1983); Gick & Holyoak (1980)                              | `framing/metaphor` is rhetorical; this is the reasoning/transfer mechanism. Engine               | shipped (#1003)                                              |
| 30  | **categorization**                       | graded prototype membership; basic-level; concept formation                   | Rosch (1978); Murphy (2002)                                        | `representativeness` _uses_ categories; this is their formation/structure. Engine                | shipped (#1005)                                              |
| 31  | **honor / dignity / face worth-logics**  | cultural rule for how personal worth is assigned & defended                   | Nisbett & Cohen (1996); Leung & Cohen (2011)                       | `face` is Brown & Levinson politeness, not the culture typology. Needs a distinct stem           | shipped (#1006)                                              |
| 32  | **relative-deprivation**                 | grievance from unfavorable (esp. group) comparison → collective action        | Runciman (1966); Smith/Pettigrew (2012)                            | `comparison` is neutral evaluation; this is the affective-injustice layer. Lean composite        | shipped (#1007)                                              |
| 33  | **resilience**                           | stable functioning maintained across a potentially traumatic event            | Bonanno (2004); Masten (2001); Kobasa (hardiness)                  | Distinct from `grit` (goal stamina) & `hedonic-adaptation` (drift). Lean composite               | shipped (#1008)                                              |
| 34  | **post-traumatic-growth**                | positive transformation _through_ struggle, beyond baseline                   | Tedeschi & Calhoun (1996/2004); Janoff-Bulman                      | Composite over `meaning`+`narrative`+`mortality`+`identity`                                      | shipped (#1009)                                              |
| 35  | **fear-of-failure / achievement-motive** | resting approach-success vs avoid-failure motive                              | Atkinson (1957); McClelland (1961); Elliot & Church (1997); Conroy | The upstream _motive_ vs `goal`'s achievement-goal orientation. Homonym risk with `goal`         | shipped (#1010)                                              |
| 36  | **embodied-metaphor**                    | abstract concepts scaffolded on sensorimotor experience                       | Lakoff & Johnson (1980); Williams & Bargh (2008)                   | Impeccable warrant, poor engine-shape (diffuse mechanism). Maintainer judgment                   | shipped (#1011)                                              |

---

## Naming clarifications surfaced by the research (not gaps — recorded to prevent error)

- **`recognition`** is Honneth/Taylor/Hegel _social_ recognition — **not**
  Aristotelian _anagnorisis_ (dramatic discovery). Do not build "recognition"
  for the discovery-scene; that territory is split across `reversal`, `secret`
  (exposure), and `surprise`.
- **`construal`** is Construal-_Level_ Theory (Trope/Liberman) — **not**
  self-construal (Markus & Kitayama). See #13.
- **`accommodation`** is Communication Accommodation Theory (Giles) — **not**
  Piagetian accommodation (which `knowing`/`confusion` reference for schema
  change).
- **`apprehension`** is a perceptual/attentional baseline engine — **not** the
  affective worry of anxiety (see #1).
- **`grounding`** is conversational common-ground (Clark) — **not** embodied
  grounding (see #36) or mindfulness-as-practice.

## Tier 3 — closed (all 17 shipped)

Tier 3 (#20–#36) is fully built. #20 `hatred` was **reworked** rather than
shipped as a standalone engine: the engine was removed and its domain rebuilt
as the `hate` composite plus a `love-hate` composite (the [love] and [hate]
composites read as opposing forces on a shared brain circuit), so `love` and
`hate` are now balanced composites. #36 `embodied-metaphor` was built as a
**scoped** position engine over five primary-metaphor families
(temperature / verticality / weight / cleanliness / brightness), delegating the
general mapping mechanism to `analogy` — the maintainer's call on the row's
"diffuse mechanism" flag.

Two composite **patterns** were established in the course of Tier 3 and are now
available for reuse:

- **Composite-of-composites** — a composite may declare other composites as its
  atoms; hard links resolve two levels deep. First use: `love-hate` (over the
  `love` and `hate` composites).
- **Four-atom composite** — composites are not limited to 2–3 atoms. First use:
  `post-traumatic-growth` (over `meaning` + `narrative` + `mortality` +
  `identity`), with hard links resolving across all four declared dependencies.

## Freud — shipped (engine completeness, then the composite)

The Freud effort planned here is **built** (2026-08-01). It ran the intended
shape — the constituent engines first, then the integrative composite over them —
and each engine's warrant was credited as a **lineage** (the science built _on_
Freud, not Freud alone) in its Origin table:

- **Engines:** `structural-model` (id / ego / superego), `transference`
  (positive / negative / countertransference), `the-unconscious`
  (dynamic / adaptive / preconscious), `ambivalence` (potential / felt — the
  general co-activation of opposed evaluations, of which `love-hate` is one
  instance). `defense` (mature / immature / neurotic) already existed and was
  reused as an atom rather than rebuilt.
- **Composite:** `freud`, reading the Freudian psyche as a compound over six
  atoms — `structural-model` + `the-unconscious` (apparatus), `anxiety` +
  `defense` (warding), `transference` + `attachment` (relation).
- **Follow-up:** `structural-model`'s Origin table was backfilled with its
  builders-on-top (A. Freud, Hartmann; Solms), bringing it into line with the
  lineage principle applied across the rest of the effort.

## The animal lane — opened by `pet`, charted (not a tier, and no order)

`pet` (#1331) is the first engine in the catalogue whose subject is an animal.
Before it, animals appeared only as **material inside human-subject engines** —
Hardin's herder adding one more beast in `commons`, animal-reminder revulsion in
`disgust`, a carved animal in `totem`. None read the relation itself, which is
distinctive because the other party has interests, cannot be reasoned with,
cannot consent, and cannot reciprocate in the terms the arrangement runs on.

`pet` also set a **shape precedent** the next animal engine inherits: it runs a
living participant through the piece grammar (Place / Load Bearing / Apparent /
Yearbook), and its REFERENCES states that the discomfort is the argument rather
than an oversight — a pet is talked about as kin and kept as a ward, and the form
states the second half. A second animal engine either adopts that reading or
argues its way to a different one; that is the first question its PR answers.

**This is deliberately charted here and not opened as a management order.** An
order names a **tier** and sets an invariant across it — the clinical tier, the
cross-type frontier. The animal lane is two engines. If a third and fourth
candidate appear (the wild animal, the laboratory animal, the animal as food —
none scoped, and `meal` may already own the last), the shape question becomes a
standing decision and earns an order then. Two engines is a chart row.

| #   | Candidate          | Phenomenon                                                                                        | Warrant                                                                                                        | Nearest / boundary                                                                                                                                                                                                                                           | E/C                        | Status          |
| --- | ------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- | --------------- |
| A1  | **pet**            | an animal kept for company at total dependency, and the keeper who arranged that dependency       | Tuan (1984, _Dominance and Affection_); Serpell (1986); Berger (1980); Haraway (2003/2008) as counter-author   | `commons` (the beast as grazing resource); `extended-self`/`heirloom` (an object carrying identity); `caregiving`/`attachment` (the carer's interior); `grief`/`mortality` (the loss after)                                                                  | Engine (piece)             | shipped (#1331) |
| A2  | **working-animal** | an animal kept for its **output**: cooperation trained rather than contracted, and no way to quit | Hribal (2003, _Animals Are Part of the Working Class_; 2010); Swart (2010); Nance (2013); Haraway, labour side | `pet` (kept for company, not output — the direct seam); `employment` (a human contract, with wage, exit and dismissal); `commons` (a resource in a grazing dilemma, not a worker); `agency` (a **designed** delegate that prescribes — an animal is neither) | Engine (piece or position) | candidate       |

**Warrant confidence: medium-high, verify at build.** Hribal and Haraway are
firm; Swart and Nance are named from the historiography of working horses and
circus elephants and should be checked against the actual argument before they
carry a row in an Origin table.

**The open shape question for A2.** `pet` is a piece because the animal is kept;
a working animal is _held to a role_, which is position grammar (Has / Orders /
Loses / Drives). Whichever it takes, the engine must not restate `employment` —
the seam is that the cooperation is trained rather than agreed, and that there is
no quitting, no wage, and no dismissal, only disposal. That asymmetry, not the
labour, is the phenomenon.

## Clinical tier — opened, and charted (Tier C)

A new **clinical-disorder tier** was opened (2026-08-01), distinct from the
"apparatus every persona has" that the rest of the inventory (and the `freud`
composite explicitly) models. It stages disorders as **persona-architecture for
a play — never a diagnosis of a real person**, and its content says so
throughout. Two firsts landed:

- **`ptsd`** (engine) — the trauma-loop, over the four DSM-5 clusters
  (reexperiencing / evasion / estrangement / hyperarousal). The first engine
  built to foreground **mechanics**: the root's Direction/Lever chapters carry a
  self-maintaining loop (cue → re-experiencing → arousal → avoidance → the
  avoidance forecloses updating → repeat), a pattern reusable by any khai-type
  that needs a dynamic rather than a static stance.
- **`cptsd`** (composite) — complex PTSD (ICD-11) over five atoms: core `ptsd`
  plus the three disturbances in self-organization — `regulation`
  (dysregulation), `self-esteem` + `shame` (diminishment), `attachment`
  (severance).

The candidate chart below was produced by a targeted two-agent research pass over
the DSM/ICD families, each candidate verified against the live inventory (member
files, not directory names) so a disorder already owned as a _form_ of an
existing engine is not counted as a gap. It is recorded under the management
order **Open the Clinical Tier**
(`packages/khai-plays/management/orders/order_open_the_clinical_tier.md`), which
sets the tier's standing rules: authored persona-architecture never a diagnosis;
warrant as a lineage; composite-over-existing-atoms first; bound against the
normal-range neighbour; carry the mechanic. Each row builds to the usual standard
on its own lane. Recommended build order: `ocd` → `anhedonia` → `depression`
(strongest single warrant into highest downstream value).

**Two rows the codebase already disclaims by name** — the highest-confidence
clinical gaps, the same signal that found Tier 1's best rows: `superstition`
scopes itself to normal-range magical cognition and names "obsessive-compulsive
ritual" as its clinical extreme → **ocd**; `sadness` footnotes its `despair` form
as "the boundary with clinical depression" → **depression** (via **anhedonia**).

**Ethics note.** Every stigma-adjacent row here (`antisocial`, `borderline`,
`narcissism`) is proposed strictly as persona-architecture — a disposition or
process a fictional character runs, in the register of `aggression` or
`deception` — never a diagnostic instrument or a claim about a real person.
Autism is the one construct deliberately **parked** rather than charted for build:
a DSM-deficit-only frame is wrong for a neurotype, and it needs new
neurodiversity-affirming atoms first (see Parked, below).

### Tier C1 — foundational engines (single phenomena nothing owns; each unblocks composites)

| #   | Candidate          | Phenomenon                                                                       | Warrant                                                                                                                    | Nearest / boundary                                                                                                                           | E/C               | Status          |
| --- | ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- |
| 37  | **ocd**            | intrusive, ego-dystonic obsessions → neutralizing compulsions                    | Rachman (thought–action fusion); Salkovskis (inflated responsibility); Foa & Kozak; Gillan                                 | `superstition` (disclaims "OC ritual" by name); `habit` (automatized ritual); `disgust` (contamination)                                      | Engine (process)  | proposed        |
| 38  | **anhedonia**      | blunted capacity for pleasure/interest — consummatory / anticipatory / social    | Ribot (coinage); Klein; Treadway & Zald; Rizvi et al.; RDoC Positive Valence                                               | `reward` (discount rate — orthogonal); `sadness` (low mood, not blunted responsivity)                                                        | Engine (position) | shipped (#1436) |
| 39  | **mania**          | elevated/expansive/irritable activation episode; grandiosity, reduced sleep need | Depue & Iacono (BFS); S. L. Johnson (BAS dysregulation); Akiskal (hyperthymic temperament)                                 | `joy` (appraisal node); `flow` (absorption); homonym w/ `desire/obsessive`'s Lee love-style label                                            | Engine (process)  | proposed        |
| 40  | **social-anxiety** | fear of negative evaluation — anticipatory / performance / post-event            | Clark & Wells (1995); Rapee & Heimberg (1997); Leary (sociometer); Hofmann                                                 | `fear/phobia` (conditioned object-fear, not evaluation); `embarrassment` (acute, not anticipatory-chronic)                                   | Engine (process)  | shipped (#1530) |
| 41  | **dissociation**   | disconnection from thought/feeling/memory/identity/surroundings under overwhelm  | Putnam (discrete states); van der Hart et al. (structural dissociation); Bernstein & Putnam (DES); Freyd (betrayal trauma) | `the-unconscious` (repression, not structural split); `ptsd/estrangement` (numbing, not splitting); `defense/immature` (category, not depth) | Engine (process)  | proposed        |
| 42  | **body-image**     | perceived-vs-ideal body; appearance-contingent self-worth                        | Thompson et al. (tripartite); Stice (dual-pathway); Fredrickson & Roberts (objectification); Cash                          | `comparison` (general); `self-discrepancy` (general gaps); `body` (interoception — delegates appearance away)                                | Engine (position) | proposed        |

### Tier C2 — composites buildable now (all atoms already exist)

| #   | Candidate                | Phenomenon                                                                    | Atoms (all exist)                                                                      | Warrant / note                                                                                                                                                                                                                                                                                                                                                         | Status          |
| --- | ------------------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 43  | **panic-disorder**       | recurrent panic attacks + fear of the next + behavioural restriction          | `fear`(panic) + `anxiety` + `coping`                                                   | Klein; Clark (catastrophic misinterpretation). `fear/process_panic.md`'s Echo names it                                                                                                                                                                                                                                                                                 | proposed        |
| 44  | **agoraphobia**          | fear/avoidance of situations where escape or help is hard to get              | `fear` + `anxiety` + `coping` + `space`                                                | Goodwin & Guze; DSM-5 and ICD-11 (both decoupled it from panic). **Decided 2026-08-29: SPLIT.** Its feared object is the situation's constraint on exit, not the body's own signals -- so it reads over `space`, which #43 does not                                                                                                                                    | proposed        |
| 45  | **hoarding**             | difficulty discarding + saving urges + clutter/distress                       | `extended-self` + `scarcity` + `decision` + `coping` + `categorization` + `collection` | Frost & Hartl; Frost & Steketee (_Stuff_); Mataix-Cols. **Decided 2026-08-29: COMPOSITE**, over six atoms -- the first four plus `categorization` (the sorting deficit that makes it hoarding rather than untidiness) and `collection` (the acquisition specifier, and the ordinary counterpart to declare a boundary against). Needs no `ocd`, so it is buildable now | shipped (#1434) |
| 46  | **borderline**           | unstable relationships, affect, self, and impulse control                     | `attachment` + `regulation` + `identity` + `self-control` + `self-esteem`              | Linehan (biosocial/DBT); Kernberg (identity diffusion); Gunderson; Zanarini                                                                                                                                                                                                                                                                                            | shipped (#1432) |
| 47  | **avoidant-personality** | social inhibition, felt inadequacy, rejection hypersensitivity (Cluster C)    | `attachment`(fearful) + `self-esteem`(low) + `shame`(withdrawal) + `anxiety`           | Millon; Alden & Taylor; Rettew                                                                                                                                                                                                                                                                                                                                         | proposed        |
| 48  | **antisocial**           | disregard for others' rights, deceit, no remorse, recklessness (Cluster B)    | `dark-triad`(psychopathy) + `aggression` + `deception` + `moral-disengagement`         | Cleckley; Hare (PCL-R); DSM-5. `dark-triad` delegates the acts by name                                                                                                                                                                                                                                                                                                 | proposed        |
| 49  | **adhd** (ADHD)          | executive dysfunction + hot impulsivity + attentional variability + DMN drift | `executive-function` + `self-control` + `attention` + `mind-wandering`                 | Barkley (EF/self-regulation); Sonuga-Barke (dual-pathway); Nigg (hot/cool); Castellanos & Proal                                                                                                                                                                                                                                                                        | shipped (#1428) |

#### The two calls Tier C2 was holding, settled (2026-08-29)

Both rows carried "maintainer call" since the clinical sweep. Both are decided,
and the reasoning is here rather than in the row so it is not re-argued from the
row's four words.

**#44 agoraphobia splits from #43 panic-disorder.** Three lines agree. The
nosology already did it: DSM-5 (2013) decoupled them into two independently
codable diagnoses -- if a persona meets both, both are diagnosed -- and ICD-11
(2018) followed; DSM-IV's "panic disorder with/without agoraphobia" plus a
residual "agoraphobia without history of panic" is precisely the structure they
abandoned. The reason was a selection artifact: agoraphobia without panic looks
rare in clinical samples and is not rare in community ones (Wittchen; Kessler et
al., NCS-R), because panic is what drives treatment-seeking. And the feared
objects differ, which is what khai actually models -- panic disorder is
interoceptive (Clark's catastrophic misinterpretation of a bodily sensation),
while agoraphobia is about a situation's constraint on exit, which is why DSM-5
requires two of five situation clusters. The counter-position, stated fairly, is
the panic-agoraphobic spectrum view: much agoraphobic avoidance is driven by
fear of panic-like incapacitation even absent full attacks, and clinic overlap
is high. That argues they are often comorbid, not that they are one phenomenon,
which is what "diagnose both" already handles. The tell that this file had not
worked it through: rows 43 and 44 carried identical atoms. They should not --
agoraphobia is place-shaped and reads over `space`, which panic does not.

**#45 hoarding is a composite, not an engine.** The DSM evidence is easy to read
backwards here. Hoarding was split out of OCD on strong grounds (Mataix-Cols et
al., 2010): saving is often ego-syntonic rather than an ego-dystonic obsession,
the course is chronic and progressive with age rather than waxing and waning, it
responds poorly to standard OCD protocols, and only a minority of cases have
OCD. But that is evidence that hoarding is not OCD. It is not evidence that
hoarding is atomic, and those are different questions. Frost & Hartl's model --
this row's own warrant -- is explicitly multi-component, and every component is
already an engine: the information-processing deficit is `categorization`, the
attachment to possessions is `extended-self` (Belk), the discarding paralysis is
`decision`, saving against future need is `scarcity`, and the avoidance of
discarding distress is `coping`. Excessive acquisition, carried by the large
majority of cases as a specifier, is `collection`, which also gives the
composite an ordinary counterpart to declare a boundary against rather than a
vague one. Every mechanism belongs to an atom and only the syndrome is new,
which is what a composite is in this house. The row's four atoms missed the two
that matter most: `categorization` is what makes it hoarding rather than
untidiness, and `collection` is the acquisition side. As a composite it needs no
`ocd` at all, so the standing warning not to route it through one stops being a
constraint and it is buildable now.

### Tier C3 — composites blocked on a Tier-C1 engine landing first (the ptsd→cptsd shape)

| #   | Candidate                              | Phenomenon                                                             | Atoms                                                                           | Note                                                                                                   | Blocked on | Status          |
| --- | -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- | --------------- |
| 50  | **depression** (MDE)                   | sad mood + anhedonia + neurovegetative + worthlessness, as a syndrome  | `sadness`(despair) + **anhedonia** + `rumination` + `self-esteem` + `body`      | Beck; Seligman; Nesse. Highest-value composite in the set — MDD is the most-requested clinical persona | #38        | shipped (#1439) |
| 51  | **body-dysmorphic** (BDD)              | preoccupation with a perceived appearance flaw + checking/camouflaging | **ocd** + `self-esteem` + `identity`                                            | Phillips; Veale; Wilhelm. May need thin appearance-schema content even after atoms exist               | #37        | proposed        |
| 52  | **bipolar**                            | cycling between depressive and manic/hypomanic episodes                | **mania** + **depression** (the #50 composite)                                  | Goodwin & Jamison. Two-level composite-of-composites (the `love-hate` precedent)                       | #39, #50   | proposed        |
| 53  | **dissociative-identity** (DID)        | structural fragmentation of the personality with amnesic barriers      | **dissociation** + `identity` + `cptsd` + `memory`                              | Putnam; van der Hart et al.; Freyd. Three-level (over the `cptsd` composite) — verify hard-link depth  | #41        | proposed        |
| 54  | **restrictive-eating** (anorexia-type) | ego-syntonic restriction driven by body-image distortion               | **body-image** + `self-control`(restraint) + `self-discrepancy` + `self-esteem` | Bruch; Fairburn (transdiagnostic); Stice                                                               | #42        | proposed        |
| 55  | **binge-eating** (bulimia/BED-type)    | loss-of-control eating as emotion-focused escape                       | **body-image** + `regulation` + `self-control` + `body`                         | Fairburn; Stice (dual-pathway); Heatherton & Baumeister (escape theory)                                | #42        | proposed        |

### Not gaps — already owned (recorded so they are not re-flagged)

- **narcissistic PD** → the existing `narcissism` engine (grandiose / vulnerable / communal / malignant, plus injury). A separate composite would restate it and fail `member-check`. No build.
- **GAD** → the `anxiety` engine (worry form + intolerance-of-uncertainty trait). No build.
- **specific phobia** → `fear`'s `phobia` form, written generically enough to read as the clinical entity. No build.

### Parked / maintainer's call

- **substance-use-disorder** — a possible composite (`addiction` + `self-control` + `coping` + `reward`) adding DSM's impaired-control layer over the already-thorough `addiction` engine (parallel to cptsd-over-ptsd), but optional since `addiction` is behaviour-agnostic and complete. Gambling/behavioural specifics (variable-ratio schedules, near-miss) are unmodelled — a possible `conditioning` extension, low priority.
- **autism spectrum** — deliberately parked, not charted for build. A DSM-deficit-only frame is an ethics problem for a neurotype; it needs new atoms first (a `sensory-processing` engine — Dunn; a `monotropism`/focused-interest engine — Murray, Lesser & Lawson) and framing against the double-empathy problem (Milton) and mindblindness (Baron-Cohen) as _competing_ warrants. A dedicated pass.
- **Cluster A PDs** (paranoid / schizoid / schizotypal) — thin atom coverage, low narrative payoff; low priority.
- **acute stress disorder / adjustment disorder** — the `ptsd` mechanism, or `stress` + `coping`, read within a duration window; a play-arc timing note, not new content.

## Forces by type — the cross-type map (Tier F)

Everything above chases forces on **one** khai type: the `persona`. This tier
charts the neglected rest. The model: an engine/composite is a **force** that
attaches to a type via `requires: [{on: <type>, section: <H2>, link: expression}]`
— the mechanism is fully type-generic (`khai-tests/src/validate.mjs`:
`if (req.on !== type) continue`), so a force can land on any type's own chapters,
not only a persona's `Projection`. An eight-agent domain-expert pass (one per
type, each verified against member files, not directory names) measured the
imbalance: **`requires.on` today is persona 211, plot 11, play 4, and _zero_ for
place / piece / plan / process / position.**

The types (enumerated from `architecture/`, the authoritative definitions — **not**
from instance frontmatter, which misses any type with zero instances, as
`performance` below shows) sort four ways:

- **Cargo** — things a force acts on: `persona`, `place`, `piece`, `plan`,
  `process`, `position`, `plot`/`play`. The charted frontier.
- **Reading / key** — `pitch`: **re-examined chapter by chapter (Tenor / Undertow
  / Nerve / Echo).** Not a force-_target_ — it is structurally excluded from the
  force graph (`validate.mjs` runs a bespoke `pitchCarryErrors` path _because_ pitch
  does not fit `requires.on`; 0 of 452 `requires` entries target it; `model.md`: "a
  Pitch is not cargo but a key"). But that settles _wiring_, not _content_ — and the
  first pass wrongly stopped there. On content `pitch` is nearly empty: **4
  instances, all issued by one engine (`palimpsest`), all in a single narrow
  sub-genus** (Genette's _hypertextual_ keys — a tale re-pitched by its debt to a
  prior text). The whole genus of **affective / modal keys that are not about a
  prior text** — Frye's mythoi, Fowler's mode, tonal-register criticism — is
  **wholly unbuilt** and is real content work on the type itself, issued as new
  `pitch_*` engines `on: play/Arc` exactly as `palimpsest` is (see F-pitch). Two
  small off-type force questions ride along: **`bathos`** (a clean new build) and a
  **within-plot tonal drift** reading of modulation (`on: plot/Cue`, a loose thread).
- **Record** — `performance`: "what happened," the claim-ticket a run leaves beside
  the play. A coherent force-target _in principle_, but **the type is not yet born**
  (`status: draft`, zero instances, no template). It is not blocked in the deep
  sense the first pass implied: borning it is a **bounded seam** (see F-performance).
  **Correction:** its "result layer" is **`khai-writing` — just another house** (a
  khai-stage house that already exists) where plays' performances are stored, **not**
  a package to mint inside this monorepo. So khai knows about it the way it knows any
  house — **on the bill** (a `khai-plays` registry card) — and Lodged resolves
  cross-house through the repertoire, no new machinery. The type-birth half (template,
  status, a `validate` check, a first instance) is ours on `arch` / governance lanes;
  the only thing still needing the maintainer is the seed for the first instance.
- **Machinery** — `architecture`, `engines`, `instructions`, `order`,
  `repertoire`: khai's own wiring, not force-targets. **Corrected:** the first
  pass listed a `design` type, which does not exist — there is no
  `architecture/design.md` — and omitted `repertoire` (`class: meta`,
  `status: draft`), which does. `model.md` and `reference.md` are companion
  documents with no type frontmatter and are not types either. Re-read from
  `packages/khai-arch/architecture/*.md` frontmatter, 2026-08-24: **fifteen**
  typed specs — 7 `element` (`persona`, `piece`, `pitch`, `place`, `performance`,
  `position`, `process`), 2 `house` (`play`, `plot`), 6 `meta` (`architecture`,
  `engines`, `instructions`, `order`, `plan`, `repertoire`). `plan` is sorted as
  cargo above because forces land on it, whatever its class says.

Each row builds to the usual standard on its own lane, as an ordinary engine or
composite (there is no new library family — a force on a place is just an engine
in `packages/engines/` that declares `on: place`). Recommended first wave, for
cleanliness and payoff: `place/weather`, `place/soundscape`, `plot/anagnorisis`,
`process/drift`, `piece/affordance`. **First-of-kind flag:** no engine yet declares
`on:` a cargo type other than persona/plot/play — the first place/piece/plan/process
force to land sets that wiring precedent and is worth a maintainer eye, the way
`ptsd`'s mechanics-first shape was. The two cleanest proofs, by the disclaimed-by-name
signal that produced Tier 1's best rows, are `process/drift` (`reversal` disclaims
"drift" outright) and `place/weather`; `piece/affordance` (Norman/Gibson, the design
family, not `piece/biography`'s history family) is the design-led third.

**Two corrections surfaced by the pass:**

- **Doc bug:** `dramatic-irony`'s REFERENCES claims anagnorisis is "owned by the
  recognition engine" — but `recognition` is Honneth/Taylor _social_ recognition,
  not Aristotelian discovery. So anagnorisis is genuinely unbuilt (row F-plot #1),
  and the stray delegation should be corrected.
- **`position` is an office, not an attitude.** The `position` type is a
  world-owned **role/office** (mnemonic TO HOLD; `position_director`,
  `position_choregos`), not an attitudinal stance. Attitude-dynamics forces
  (formation / entrenchment / erosion / conversion) are already built persona-side
  (`persuasion`, `dissonance`, `reactance`, `ambivalence`, `bias`) — nothing to
  add there. The real `position` gap is **institutional forces on the office-as-such**
  (see F-position), which wants its own correctly-scoped research pass.

### Tier F-place — forces on a setting (16 engines + 1 composite)

Nine engines already carry `place`-typed members (`crowd`, `total-institution`,
`space`, `restorative-environment`, `third-place`, `backstage`, `commons`,
`liminality`, `psychological-safety`) but all wire `on: persona`; the place's own
`Shown / Holds / Offers / Withheld` chapters are never targeted. Prior coverage to
respect: `space` owns Gibson affordances / Barker behavior-settings / Appleton
prospect-refuge; `restorative-environment` owns Kaplan ART; `place-attachment`
owns Relph rootedness.

| Candidate                                | Force on the place                                           | Warrant                                    | Confidence                                                      | Status          |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- | --------------- |
| **soundscape**                           | the auditory field (keynote / signal / soundmark)            | Schafer; Truax; Augoyard & Torgue          | solid — unclaimed sensory channel                               | shipped (#1129) |
| **weather**                              | the transient atmospheric event bearing down today           | Ingold; Golinski; Harris (_Weatherland_)   | solid                                                           | shipped (#1053) |
| **climate**                              | the standing seasonal regime (vs weather's event)            | Köppen; Lamb; Hulme                        | solid                                                           | shipped (#1123) |
| **geomorphology**                        | the ground's sudden violence — quake / eruption / subsidence | Lyell; McPhee; Winchester                  | solid                                                           | shipped (#1113) |
| **erosion**                              | surfaces worn by wind / water / frost over time              | Hutton/Lyell; Strahler; Macfarlane         | solid                                                           | shipped (#1116) |
| **hydrology**                            | the water regime — flood / drought / water-table             | McPhee; M. Davis; Kelman                   | solid                                                           | shipped (#1119) |
| **fire**                                 | combustibility & burn regime, incl. suppression debt         | Pyne; Christensen; M. Davis                | solid                                                           | shipped (#1121) |
| **succession**                           | the biological reclaiming once human use withdraws           | Cowles; Clements; Gleason; Weisman         | solid                                                           | shipped (#1125) |
| **decay**                                | material entropy — rust / rot / crumble                      | Simmel; Riegl; Trigg; DeSilvey             | solid                                                           | shipped (#1073) |
| **dereliction**                          | the built place an authority stopped maintaining             | Edensor; Ginsberg; Ruskin                  | maintainer-call (merge w/ decay?)                               | shipped (#1077) |
| **gentrification**                       | capital re-entry that displaces prior occupants              | Glass; N. Smith (rent-gap); Zukin          | solid                                                           | shipped (#1082) |
| **reclamation** (charted as restoration) | deliberate intervention arresting decay                      | Ruskin vs Viollet-le-Duc; Riegl; Lowenthal | solid                                                           | shipped (#1084) |
| **street-life**                          | design that generates or kills pedestrian vitality           | Jacobs; Whyte; Gehl                        | solid                                                           | shipped (#1131) |
| **legibility**                           | how readable the layout is — the cognitive map               | Lynch; Passini; Golledge                   | solid                                                           | shipped (#1133) |
| **defensible-space**                     | design cues reading a place as claimed/claimable             | Newman; Jeffery (CPTED); Brantingham       | maintainer-call                                                 | proposed        |
| **landscape-architecture**               | designed terrain engineering a social program                | Olmsted; McHarg; J.B. Jackson              | maintainer-call                                                 | proposed        |
| **ambiance** (Böhme)                     | the felt, quasi-objective atmosphere of the ensemble         | Schmitz; Böhme; Griffero; Pallasmaa        | maintainer-call (stem/concept collides with `space` atmosphere) | proposed        |

- **neighborhood-cycle** (composite, blocked): the churn of decline → capital
  re-entry / displacement → reclamation, over `dereliction` + `gentrification` +
  `reclamation` (the reclamation-phase engine, charted as `restoration`; renamed
  to avoid the `grief` engine's `restoration` stem).

#### The neighborhood-cycle family — charted for build (the second F-place dance)

The place-force template is settled by `weather` (the first F-place engine): a
force on a setting is a `type: process` engine that wires `on: place` at the
place's own chapters (`Shown / Holds / Offers / Withheld`), with `process_*`
members. `weather` wired `on: place/Shown`. This family applies the same wiring
to the built place's lifecycle, and is the second F-place engines-enable-composite
dance (after the design domain closed F-piece with `artifice`).

The composite is the target; the engines are what it needs. The cycle's phases
are three (dereliction → gentrification → reclamation); `decay` is the material
substrate all three act upon, kept a distinct engine (not merged into
dereliction) and built first, so the phase engines have a real engine to
reference. This is a **4-engine + 3-atom-composite** dance. (The reclamation
phase shipped as `reclamation`, not `restoration`: that stem is the `grief`
engine's, and strict Viollet-le-Duc restoration is only one of its stances.)

| Force              | Cycle role                                       | Load-bearing place chapter        | Warrant                                          |
| ------------------ | ------------------------------------------------ | --------------------------------- | ------------------------------------------------ |
| **decay**          | the material substrate under every phase         | `Shown` (the place shows its rot) | Simmel ("The Ruin"); Riegl; Trigg; DeSilvey      |
| **dereliction**    | decline — an authority stops maintaining         | `Offers` (function lapses)        | Edensor; Ginsberg; Ruskin                        |
| **gentrification** | re-entry — capital returns, displacing occupants | `Withheld` (Offers → price-gated) | Glass (coined, 1964); N. Smith (rent-gap); Zukin |
| **reclamation**    | reclamation — intervention arresting decay       | `Shown` (age-value vs renewal)    | Ruskin vs Viollet-le-Duc; Riegl; Lowenthal       |

- **decay vs dereliction** (the flagged maintainer-call, resolved): **kept
  distinct**. `decay` is what matter does (impersonal entropy); `dereliction` is
  what an owner stops doing (the social withdrawal that lets decay run). A
  maintained building still decays but is not derelict. Build decay first as the
  substrate; both `dereliction` ("given over to decay") and `reclamation`
  ("arresting decay") reference it.
- **The chapter seam**: `gentrification` converts `Offers → Withheld` — the place
  that freely offered itself now withholds itself behind a price. The displacement,
  read in the place's own chapters: the type-native proof the force-model fits
  place.
- **neighborhood-cycle** (composite): over the three phase engines
  (`dereliction` + `gentrification` + `reclamation`); `decay` is the referenced
  substrate, not a wired atom (the design precedent: engines reference neighbors
  they do not wire). The discovery loop stays open — if assembling the composite
  needs decay as a fourth atom, that is a finding, as `artifice`'s bridges surfaced
  guile and captology.

The rest of F-place — the atmospheric siblings (`climate`, `erosion`, `fire`,
`hydrology`, `geomorphology`, `succession`) and the place-design forces
(`street-life`, `legibility`) — are standalone engines with no composite, a
separate later wave.

### Tier F-piece — forces on an object (9 engines + 3 composites)

Virgin attach-point: `template_piece.md` has `Place / Load Bearing / Apparent /
Yearbook` chapters, never targeted (mnemonic TO PLAY). Prior coverage (all
`on: persona`): `extended-self` (felt/private), `money`, `debt`, `heirloom`,
`totem`, `document`.

The rows split into **two families**: **history** — what the object _carries_ —
and **design** — what the object _invites_. The design family is Norman's whole
apparatus, not the one-line `signifier` the first pass charted; it is recharted
below as the `usability` engine (the maintainer's correction: "design of everyday
things changes pieces, not just biography").

**History family** (what the object carries, time-accreted):

| Candidate        | Force on / around the piece                               | Warrant                              | Confidence                | Status   |
| ---------------- | --------------------------------------------------------- | ------------------------------------ | ------------------------- | -------- |
| **biography**    | the object's career between commodity and singular status | Kopytoff; Appadurai; D. Miller       | high                      | proposed |
| **patina**       | the trace of time/use read as damage or age-value         | Riegl; Pye; DeSilvey                 | high                      | proposed |
| **sign-value**   | the coded status-meaning, and its fetish mystification    | Baudrillard; Marx; Veblen; McCracken | medium-high               | proposed |
| **obsolescence** | rendered out-of-date by a shifted standard, not decay     | Slade; Packard; Chapman              | medium (merge w/ patina?) | proposed |

**Design family** (what the object invites, form-intrinsic) — **five poles**, one
composite. The domain grew from two poles to five by the discovery loop: building
the `artifice` composite surfaced three missing engines (the physical pole, and the
two "bridges" that turned out to be their own phenomena). Each pole is the
**piece-pole (object side) of a science whose persona-pole is already built** —
deceptive-design ↔ `deception`, captology ↔ `persuasion`/`conditioning`, exactly as
`agency` ↔ personal-agency and `usability` ↔ `space`.

| Pole           | Candidate      | Force on / around the piece                                                                                                            | Warrant                                      | Chapter        | Confidence | Status                |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------- | ---------- | --------------------- |
| **cognitive**  | **usability**  | how the form communicates and governs use: root over `grip`/`signifier`/`feedback`/`constraint`                                        | Gibson; Norman; Gaver; Krippendorff; Nielsen | `Apparent`     | —          | shipped (#1058/#1059) |
| **political**  | **agency**     | the object as social delegate — prescribing/forbidding conduct (the speed bump that polices; the cap that enforces a program)          | Latour; Akrich; Winner; Gell                 | `Load Bearing` | —          | shipped (#1060/#1061) |
| **physical**   | **ergonomics** | the object's physical fit to the body — anthropometric dimensions, reach, force, clearance, the handle sized to the hand               | Dreyfuss; Tilley; Woodson; Pheasant          | `Load Bearing` | —          | shipped (#1063)       |
| **deceptive**  | **guile**      | the object designed to mislead for the maker's benefit — dark patterns; the lie is the intent, not a defect (vs usability's false cue) | Brignull; Gray et al.; Mathur et al.         | `Apparent`     | —          | shipped (#1065)       |
| **behavioral** | **captology**  | the object designed to shape behavior / form habits — the engineered reinforcement loop, conditioning the user over time               | Fogg; Eyal; Thaler & Sunstein                | `Load Bearing` | —          | shipped (#1067)       |

- **fetish** (composite, blocked): `sign-value` + `agency` + `biography`.
- **provenance** (composite, blocked): `biography` + `patina` + `document`.
- **artifice** (design composite, blocked; working name — build #4): the **5-atom**
  capstone over the complete pole-set — `ergonomics` + `usability` + `agency` +
  `guile` + `captology` — reading the full force a designed object exerts on conduct:
  what it **fits**, **communicates**, **enforces**, **deceives**, and **conditions**.
  The integrative warrant reunites the two halves of Verbeek's mediation the atoms
  split (`What Things Do` → usability, `Moralizing Technology` → agency). `concord`
  (constraint + prescription) stays a **seam inside** it, not an atom. Waits until all
  five poles land, per the cross-type order's composite rule. Name tentative — the
  `design` stem is taken by the machinery type. First composite to attach `on: piece`
  (chapter `Load Bearing`, `audit` level) — a first-of-kind for the maintainer's eye.

**Naming resolution (design family).** The object-design engine is `usability`,
**not** `affordance`: the `affordance` stem is `space`'s (`place_affordance.md` —
Gibson's affordance _of the setting_), and object- vs setting-affordance is the same
word in the _same science_ at different scale, so it fails the homonym bar rather
than earning a whitelist. `usability` is the field's own umbrella term (Norman →
Nielsen) and names the force at the right altitude; Gibson's affordance is carried
as the member `grip`. This is the sharp line: `space` owns affordance-of-the-place,
`usability` owns affordance-of-the-object; the collision _is_ the boundary.

**Naming the three new poles.** The persona-pole stems are taken (`deception`,
`habit`, `persuasion` are persona-side engines, and `member-check` rejects a root
that restates their domain), so each design engine takes its own object-side stem,
all verified free: **`ergonomics`** (Dreyfuss's field name; members
`anthropometry`/`reach`/`clearance`/`fit`/`tolerance`), **`guile`** (the object's
guile — not `deception`; Gray's taxonomy `sneaking`/`obstruction`/`nagging`/
`forced-action`/`interface-interference`), **`captology`** (Fogg's coined umbrella —
not `persuasion`/`habit`; members from Fogg trigger/motivation/ability, Eyal
variable-reward/investment, Thaler default/choice-architecture). Boundaries to
arbitrate at each build: `guile` vs `agency` (both conceal — agency conceals a
_social-order program_, guile deceives the user into a _transaction against their
own interest_); `captology` vs `agency/enlistment` (enlistment drafts you
_structurally, once_; captology _conditions_ you _over time_) and vs the persona-side
`conditioning`/`addiction` (which model the person, not the object).

#### The object-restoration engine, and the object-lifecycle (a third family, charted for build)

Surfaced by the place-family rename: `reclamation` handles restoration of a
**place** (architectural conservation — Ruskin/Viollet/Riegl on buildings), but
"restoration" in its home sense is a **piece** phenomenon — mending a painting, a
vessel, a clock, an heirloom — which no piece engine owns. A two-agent research
pass (object-conservation theory; philosophy of repair and object identity)
returned a clear verdict: **one engine, not a composite.**

**`restoration` (object mending) — engine, `on: piece`.** One core arbitration
(Brandi's _aesthetic instance_ vs _historical instance_), operationalised by the
modern codes (ICOM-CC's preventive/remedial/restoration split; AIC ethics of
minimal-intervention, reversibility, **distinguishability**). It is an engine, not
a composite, because its two defining questions are **emergent** — present in no
composition of existing atoms: the **ship-of-Theseus / constitution** problem (how
much can be replaced before it is no longer _that_ thing — Plutarch→Hobbes→Locke→
Wiggins/Sider) and the **visible-vs-invisible fork** (kintsugi's celebrated seam
vs the Western seamless ideal; Benjamin's aura; Ruskin's "restoration is a lie").

Root = the mended object + the constitution question. Five stances (stems verified
free), wiring on **`Apparent`** (paralleling the place family's `Shown`; `Yearbook`
is the alternative given the biography dimension):

| Facet             | The stance a mend takes                                                 | Warrant                                                                    |
| ----------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **reversion**     | erase the break, restore to original, invisible repair                  | Viollet-le-Duc; Western seamless restoration; Spelman's conservative pole  |
| **testimony**     | honour the break, make the mend visible, add a stratum to the life      | kintsugi / boro; Benjamin (aura); Ruskin ("don't lie") — the twist facet   |
| **stabilization** | arrest the decay, do the minimum, conserve-as-found                     | ICOM-CC _remedial_; Morris/SPAB "anti-scrape"; Brandi minimal-intervention |
| **continuation**  | keep it alive and _working_ through part-turnover, function over fabric | Locke (organism); Ingold; the running clock; ship-of-Theseus continuity    |
| **fidelity**      | serve the maker's achievement; restrain from forgery/over-restoration   | Goodman (autographic); Dutton (forgery); Brandi (distinguishability)       |

**Naming.** Named **`restoration`** — freed by renaming the `grief` engine's
`restoration` member to `rebuilding` (Stroebe & Schut's _restoration orientation_,
a breaking `bump:minor` change — the maintainer's call; PR #1088). Fallback if that
is declined: **`mending`** (also free, more universal). Distinct from the existing
**`repair`** engine (relational rupture→restitution→integration — same English word,
different science, different type; the reason for the distinct stem).

**Boundaries.** vs `decay` (the breaking; restoration is the response); vs
`reclamation` (the _place_ parallel — restoration adds the Theseus/provenance/
function-to-working problems buildings dodge); vs `authenticity` (self-congruence,
persona-side); vs `heirloom`/`extended-self` (keeping/possessing, not mending); vs
`palimpsest` (textual re-telling); vs `nostalgia` (the feeling, not the act).

**The object-lifecycle composite (future — build the elements first, then compose).**
An object turns through a life the way a place does: it is **made → used/worn →
aged → decayed → mended**, and a composite could read that whole arc as a
piece-parallel to `neighborhood-cycle`. The elements are "available on plain sight
if we build them":

- **wear / use** — objects worn out by use; the depleted, the consumed (consumables).
  A distinct force from age-value; partly overlaps the history-family `patina` row and
  is adjacent to `obsolescence` (standard-shift, not physical wear).
- **time / aging** — "time works them"; possibly a force of its own, and possibly not
  piece-specific at all — **`time` may warrant its own engine** (aging as a universal
  force, or a piece-scoped `aging`). Needs its own scoping pass before it is charted
  as an atom.
- **object-decay** — our `decay` engine is **place**-typed; objects decay too, so this
  wants either a piece-typed decay or a generalisation. **Stem note:** `decay` already
  claimed the `patina` stem for its place facet, so the charted history-family
  `patina` **piece** engine now collides — to resolve by **rename or merge** when
  the object-lifecycle work begins, not by whitelisting: the place facet holds
  the word, so the piece engine takes a different one, or the two are one engine.
- **restoration** — the mending engine above, the object's reclamation phase.

Then a composite over them (the object's life and, as with the place-cycle, the
question its mending forces: reverted, testified, or let go). Charted, not queued —
the `restoration` engine is the one build confirmed now.

**Shipped (2026-08-04) — the whole object-lifecycle family landed.** The dance ran
as charted: `restoration` (object mending, `on: piece/Apparent`, #1090), then the
two degradation forces — `wear` (`on: piece/Load Bearing`, #1092, "worn by use") and
a **generalized `decay`** (#1094) rather than a new object-entropy engine, resolving
the flagged `patina` collision: `decay` became khai's first **multi-cargo** engine,
wiring `on: place/Shown` **and** `on: piece/Apparent` at once (the honest model —
material entropy is use-independent, so one engine reads both cargo), keeping `patina`
for both. The closer is the **`object-cycle`** composite (#1095, `on: piece/Apparent`,
`audit`), over `wear` + `decay` + `restoration`, with `decay` a wired atom (not merely
referenced) — its three bridges are what the keeper's care makes of the life: **upkeep**
(mended, kept in service), **discard** (spent and let go), **treasure** (the marks
prized as worth — the family's ambivalence-twist, gathering wear's seasoning and decay's
patina into one reading). Tests followed each source per rule 3 (#1091, #1096, #1097,
#1098). The one open thread that the charting deferred — **time / aging, "needs its own
scoping pass before it is charted as an atom"** — is now resolved below.

#### The time family — scoped, charted for build (chronos / kairos + passage)

The scoping pass the object-lifecycle deferred ("`time` may warrant its own engine …
needs its own scoping pass"). Two research passes returned a clear shape: **time is
neither one engine nor a persona-only phenomenon — it is a small _family_ of two force
engines that attach type-generically, closed by a composite, with a value-twist facet.**

**Why not one engine.** Time is the medium every dynamic runs in; a single `time`
engine would restate half the inventory. The disciplined cut is the classical two:
**chronos** (measured, sequential, flowing duration — the clock running, the lifespan
elapsing) and **kairos** (the qualitative _opportune_ moment — the right time, the
window that opens and shuts). These are genuinely distinct forces, not two forms of one.

**Why not persona-only.** `time-perception` (Zimbardo time-perspective; subjective
duration) already owns the persona's _experience_ of time. Chronos and kairos are the
force **time exerts on cargo** — a place, a piece, a plan, a process — not a persona's
read of it. That is exactly the frontier the persona axis misses.

**The multi-cargo hinge.** `decay` just proved a force can wire on more than one type
(place + piece). The time family is where that becomes the _default_, not the exception:
chronos passes over anything with a lifespan; kairos can strike any cargo that has a
right-moment. This is the type-generic attach the cross-type order anticipated —
`decay`'s generalization was its first demonstration, and chronos is its natural home.

| Force       | What time does to the cargo                                                                   | Type-generic attach (multi-cargo)                         | Warrant                                                                                                                                           | Boundary                                                                                                                                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **chronos** | the measured, sequential passage — duration flowing, the clock running, the age accruing      | `on:` piece / place / plan / process (per `decay`)        | Newton (absolute time); Bergson (_durée_, as the lived counter); Elias (_Time: An Essay_); Kermode (_The Sense of an Ending_ — chronos vs kairos) | vs `decay`/`wear` (time's _material effect_ — chronos is the passage itself, decay is what it does to matter); vs `time-perception` (the persona's experience); vs F-process `momentum`/`punctuation`/`oscillation` (a _dynamic's_ tempo, not time); vs F-plot `narrative-discourse` (the _telling's_ time) |
| **kairos**  | the opportune moment — the right time, the critical juncture, the window that opens and shuts | `on:` plot / plan / process / persona (the moment seized) | Sipiora & Baumlin (_Rhetoric and Kairos_); Kinneavy; Tillich ("the fullness of time"); Kermode                                                    | vs F-plot `ticking-clock` (a _suspense device_ — a depleting window as stakes; kairos is the qualitative _rightness_ of the moment, not the countdown); vs F-plan `deadline` (an _imposed_ clock; kairos is the _opportune_, not the compelled)                                                             |

- **ripening** (value-twist facet, **not** a standalone engine): time as ally — the
  thing _made better_ by passage (the aged wine, the matured judgment, the ripened
  plan, the moment come to fullness). This is the family's **ambivalence-twist**, the
  same law that surfaced as `decay`→patina, `dereliction`→ruin, `wear`→seasoning,
  `object-cycle`→treasure: time's twist is ripening — passage read as gain, not only
  loss. Carried as a facet of `chronos` (or a `passage` bridge), never its own engine.
- **passage** (composite, blocked): the whole working of time read as an arc over
  `chronos` + `kairos`, closed the way `object-cycle` and `neighborhood-cycle` close
  their families — the measured passing and the seized moment together, and the question
  it forces (endured, seized, or ripened). Blocked until both atoms land.

**Two branches parked for the maintainer** (surfaced by the pass, each wants its own
scoping):

- **life-course / senescence** (persona-side): the human aging arc — Erikson (stages);
  Levinson (_Seasons_); Baltes (life-span development); Carstensen (socioemotional
  selectivity); biological senescence. Heavy adjacency to `mortality`, `possible-selves`,
  the charted `life-review` composite (F-persona), and `nostalgia` — a maintainer's call
  whether a distinct engine survives the boundary, and a dedicated pass if so.
- **social / collective time**: clock-discipline, calendars, the tempo of institutions,
  social acceleration — Zerubavel (_Hidden Rhythms_; _The Seven Day Circle_); Rosa
  (_Social Acceleration_); E. P. Thompson ("Time, Work-Discipline and Industrial
  Capitalism"). Where it wires (`position`/office? `place`? its own cluster) and whether
  it is one engine or several is unsettled — a dedicated organizational-sociology pass,
  as F-position got.

**Not gaps — already owned (recorded so they are not re-flagged as "time"):**
`time-perception` (the persona's experience — do **not** rebuild it as chronos);
`ticking-clock` (F-plot) and `deadline` (F-plan) (the narrative / plan time-pressure
devices — kairos is the qualitative-moment force, not those); `circadian-rhythm`
(F-persona, the biological daily clock); `narrative-discourse` (F-plot, story-time vs
discourse-time); the F-process tempo engines (`momentum` / `punctuation` / `oscillation`
own a _dynamic's_ shape-in-time, not time itself).

**Build order:** `chronos` first — the root passage all else presupposes, and the
`on:`-many multi-cargo precedent at family scale, worth a maintainer eye the way `decay`'s
generalization got — then `kairos`, then the `passage` composite; `ripening` rides in as
the twist facet, never queued alone. The two branches stay parked pending their own passes.
All rows `proposed` pending a per-item go.

#### The two time branches — scoped (the passes the family deferred)

A dedicated scoping pass on the two branches the time family parked, audited against the
live catalog. The verdict: **neither broad framing survives; each reduces to one clean cut.**
The family engines (`chronos`, `kairos`, the `time` composite, `ripening`) are built; this
resolves what was left parked.

**Branch 1 — life-course / senescence -> the broad arc does NOT survive; the core is
`time-horizon`.** The neighbours each own a slice and together crowd out a monolithic
"aging" engine: `mortality` (the death-salience _stance_), `possible-selves` (the future
self-images), `nostalgia` (longing for one's past), `heritage` (the pre-choice formation
arrived-carrying), `hedonic-adaptation` (return to baseline), `identity` / `liminality`. A
single `life-course` engine would restate them and drag in culture-bound developmental-stage
content — an umbrella, not one phenomenon. The one genuinely-unowned single phenomenon is:

| Candidate        | Phenomenon                                                                                                                                              | Warrant                                                                                                                | Nearest / boundary                                                                                                                                                                                                                                                                                                                                                                                            | E/C                                                | Status                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------ |
| **time-horizon** | as the _perceived_ time one has left shrinks, priorities reorient — from expansive / future / knowledge-seeking toward emotionally-meaningful / present | Carstensen (socioemotional selectivity); Carstensen, Isaacowitz & Charles; Fung & Carstensen; Fredrickson & Carstensen | `mortality` (death-salience stance / TMT — time-horizon is the motivational _reweighting_ by time-left, not the posture toward death); `possible-selves` (the future selves themselves — time-horizon is which get pursued); `savoring` (present relishing — time-horizon is _why_ a short horizon turns toward it). NOT only aging: a diagnosis, a graduation, a move, a last summer shrinks the horizon too | Engine (persona; position-vs-process a build call) | proposed — the survivable core |

The rest of the aging arc is a **separate parked cluster, not this pass**: `generativity`
(Erikson's care / legacy vs stagnation — vs `caregiving` / `altruism`), `wisdom` (vs
`metacognition` / `insight`), `ego-integrity` (Erikson's final stage vs despair), and the
charted-but-unbuilt `life-review` composite (F-persona). A coherent late-life cluster of its
own, gated on whether each survives its own boundary — a distinct future pass.

**Branch 2 — social / collective time -> genuinely unowned; one engine, wiring the open
question.** No engine owns collective/institutional time: `ritual` is threshold-crossing,
`habit` the personal automatized response, `org` organizational culture, `socialization`
world-internalization, `tightness-looseness` norm-strength. The sociotemporal order — the
shared calendar, the schedule, the institutional tempo, clock-discipline — is unbuilt.

| Candidate       | Phenomenon                                                                                                             | Warrant                                                                                                                                        | Provisional facets (3 + twist)                                                                                                                                                                                                                                                                                                                                        | E/C                                                                                                                           | Status                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **social-time** | the collective structuring of time a group or institution runs on — the shared cycle, the imposed timetable, the tempo | Zerubavel (_Hidden Rhythms_; _The Seven Day Circle_); E. P. Thompson ("Time, Work-Discipline"); Rosa (_Social Acceleration_); Sorokin & Merton | `calendar` (the shared cycle that synchronizes — the week, the holiday, the season; Zerubavel); `schedule` (clock-discipline, the imposed timetable that orders labour; Thompson); `tempo` (the pace / acceleration a collective runs at; Rosa); twist `synchrony` (shared time as belonging — the festival, the collective rhythm read as gift, not only constraint) | Engine — **wiring a maintainer call: place (the sociotemporal order a setting runs on) vs position (an institution's tempo)** | proposed — needs the wiring decision |

**Verdict:** the two parked branches resolve to **two clean single-engine builds** —
`time-horizon` (persona-side, the survivable core of life-course) and `social-time`
(collective-side, wiring TBD) — plus a separately-parked late-life cluster (generativity /
wisdom / ego-integrity / life-review). Neither the broad "life-course" nor a "collective-time
cluster" framing survives; the narrow cuts do. **Build order (if pursued):** `time-horizon`
first (cleanest, no wiring question), then a short place-vs-position decision and `social-time`.
Stems checked free. Rows `proposed` pending a per-item go.

### Tier F-plan — forces on a plan-as-contested-object (6 engines)

Boundary held hard against the persona-side planning psychology already built
(`bias`'s planning-fallacy/sunk-cost/escalation, `decision`'s satisficing).

| Candidate        | Force on the plan                                   | Warrant                                    | Confidence                             | Status   |
| ---------------- | --------------------------------------------------- | ------------------------------------------ | -------------------------------------- | -------- |
| **counter-move** | an adversary's interdependent best-response         | Schelling; von Neumann & Morgenstern; Nash | high                                   | proposed |
| **fog-of-war**   | chance + incomplete info degrading execution        | Clausewitz (friction); Moltke; Boyd; Weick | high                                   | proposed |
| **deadline**     | an external clock compressing execution as it nears | Parkinson; Ariely & Wertenbroch            | high                                   | proposed |
| **logistics**    | the resource/supply base and its depletion rate     | van Creveld; Jomini; Goldratt              | high                                   | proposed |
| **obsolescence** | the plan overtaken by events (premises stale)       | Boyd (OODA); Clausewitz; Weick             | high                                   | proposed |
| **disruption**   | a discrete shock invalidating a named assumption    | Perrow; Chapman & Ward                     | maintainer-call (merge w/ fog-of-war?) | proposed |

### Tier F-process — forces on an unfolding dynamic (9 engines)

The "physics of unfolding": what speeds a dynamic, stalls it, locks it in, breaks
it, couples it to another, tips it into a new regime, or governs the _shape_ of its
run — independent of who runs it (that would be `on: persona`, saturated) or what
story it sits in (`on: plot`, near-saturated). Attach-chapters are `process`'s own
(mnemonic **TO IDLE**): **Initiated by** (the threshold that makes it start),
**Direction** (the vector once started), **Lever** (carry meeting resistance),
**Echo** (what the next process inherits). `on: process` is genuinely unbuilt —
first-of-kind cargo wiring per the cross-type order.

The first pass charted 3 and called it "conservative"; a full sweep (Van de Ven &
Poole, systems dynamics, critical-transitions, entrainment, punctuated-equilibrium,
drift literatures — each verified against live member files) found **six more**, and
three boundary calls the stub got wrong. The reason it under-counted: it kept
flinching at the boundary, because so many dynamics are _already_ engines (128
process-typed), and folded real forces-on-a-dynamic into the nearest neighbour.

**The 3 stub rows survive** (refined — what's left after the neighbours):

| Candidate        | Force on the dynamic                                 | Chapter          | Warrant / residue                                                                                                                     | Confidence  | Status   |
| ---------------- | ---------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| **momentum**     | resistance to changing state — lock-in or dead-start | Echo             | David; Arthur; Pierson. Residue after `scarcity/trap` + `escalation` (both domain-scoped spirals): the domain-neutral inertia itself. | high        | proposed |
| **interruption** | broken off mid-run, suspended with a resumption cost | Direction / Echo | Zeigarnik; Mark; Trafton & Monk. Residue: the general suspend-and-resume tax on a dynamic, whoever is interrupted.                    | high        | proposed |
| **phase-shift**  | crossing a threshold into a new regime (ignition)    | Initiated by     | Scheffer; Granovetter; Watts. Residue after `adoption` (diffusion S-curve) + `bias` (availability-cascade): the single regime-cross.  | medium-high | proposed |

**Six new, each verified against live members:**

| Candidate       | Force on the dynamic                                                                                            | Chapter          | Warrant (lineage)                                                                  | Boundary                                                                                                                           | Confidence  | Status          |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------- |
| **drift**       | the baseline slides step by unremarked step until the process is somewhere no one chose — no decision, no event | Direction        | Vaughan (normalization of deviance) → Snook (practical drift) → Dekker → Rasmussen | `reversal/process_turn.md` **disclaims "a general deterioration or drift" by name**; not momentum (inertia) or phase-shift (event) | high        | shipped (#1055) |
| **entrainment** | two dynamics couple until their rhythms phase-lock — content-neutral                                            | Lever            | Huygens → Kuramoto → Strogatz (_Sync_); McNeill (_Keeping Together in Time_)       | `contagion` owns affect-spread, `ritual/effervescence` collective energy; rhythm-locking is unclaimed                              | high        | proposed        |
| **bottleneck**  | the whole pace set by the single slowest step; relieving anything else changes nothing                          | Lever            | Liebig (law of the minimum) → Goldratt (_The Goal_, ToC) → queueing theory         | `scarcity` is a persona's bandwidth tax, not a dynamic's throughput ceiling; the rigorous form of "tempo"                          | high        | proposed        |
| **ratchet**     | a one-way catch — advances but cannot slip back; each gain locked before the next                               | Echo             | Duesenberry → Tomasello (cultural ratchet) → Scheffer (irreversibility)            | stem `hysteresis` is **taken** (`heritage`, Bourdieu); vs `momentum` = why it stays, ratchet = why it can't reverse                | medium-high | proposed        |
| **punctuation** | long stasis alternating with brief bursts of change — the tempo of a whole run                                  | Echo / Direction | Eldredge & Gould → Tushman & Romanelli → Gersick (deep structure)                  | `phase-shift` is a _single_ crossing; this is the _alternation_ across the whole span                                              | medium-high | proposed        |
| **oscillation** | a delayed balancing feedback makes it overshoot and swing back, cycling not settling                            | Direction / Echo | Forrester → Meadows (overshoot) → Minsky; Lotka–Volterra                           | `momentum` is one-way inertia; this is the cyclical correction with delay (absorbs the lag/delay question)                         | medium      | proposed        |

(`dissipation` — a dynamic losing its ordering energy and winding down (Prigogine) —
is real in principle but overlaps `momentum`'s dead-start and F-place `decay`;
**parked** unless a maintainer wants it. `tempo` is dropped — its sharp parts went to
`bottleneck` and `momentum`.)

**Strongest first-of-kind `on: process` proof: `drift`.** Free stem, single-chapter
attach (Direction), and — the deciding factor — a boundary an existing engine
(`reversal`) **disclaims by name**, the same highest-confidence signal that produced
Tier 1's best rows (fear→anxiety, virtue→moral-identity). It sets the `on: process`
precedent on a boundary no one can dispute. `bottleneck` and `entrainment` are the
strongest seconds — each proves the wiring generalises to a _different_ chapter (Lever).

**Rejects (documented so they need not be re-checked):** `catalysis` (a threshold/Lever
parameter, not a force); `derailment` (folds into `interruption` or `reversal`);
`autocatalysis` / general reinforcing feedback / Van de Ven's four motors (owned in
domain forms — `scarcity/trap`, `escalation`, `group` Tuckman life-cycle, `goal`
teleological — a general engine would restate them and fail `member-check`);
`hysteresis` as a stem (taken by `heritage`; the residue is built as `ratchet`);
`cascade` (split across `phase-shift` + `adoption` + `bias/availability-cascade`);
`lag`/`delay` (a parameter; its consequential form is `oscillation`); `tempo` (weak
shape). **Composites are all blocked** — F-process carries no force-atoms yet, so an
`instability` / `regime-cycle` reading over oscillation → phase-shift → punctuation
has nothing to read over until these engines land, exactly as the cross-type order
anticipates.

### Tier F-plot / play — narrative forces (~12 engines; the axis is near-saturated)

Existing narrative engines already own the structural core; these are the verified
remainders. `anagnorisis` is strongest (fixes the doc bug above).

| Candidate                            | Force on the plot/play                                         | Warrant                                       | Confidence  | Status   |
| ------------------------------------ | -------------------------------------------------------------- | --------------------------------------------- | ----------- | -------- |
| **anagnorisis**                      | the discovery-scene — false belief → evidence → the turn       | Aristotle; Cave (_Recognitions_)              | high        | proposed |
| **narrative-discourse**              | story-time vs discourse-time (order/duration/frequency)        | Genette (_Narrative Discourse_); Bal; Chatman | high        | proposed |
| **ticking-clock**                    | a depleting external time-window raising stakes                | Carroll; Zillmann (excitation-transfer)       | high        | proposed |
| **deus-ex-machina**                  | an external resolution the arc did not earn                    | Aristotle; Horace                             | high        | proposed |
| **double-plot**                      | a parallel strand mirroring/crossing the main one              | Empson; Bordwell & Thompson                   | high        | proposed |
| **chekhov-gun**                      | a planted element that becomes a later trigger                 | Chekhov; Barthes (_S/Z_); Sternberg           | medium-high | proposed |
| **hamartia**                         | the protagonist's own error that turns the action              | Aristotle                                     | medium      | proposed |
| **red-herring**                      | a planted false inference that misdirects                      | (mystery poetics)                             | medium      | proposed |
| **frame-narrative**                  | a telling nested inside another (diegetic levels)              | Genette; Bal                                  | medium      | proposed |
| **metatheatre**                      | the play acknowledging its own frame (stem: not "fourth-wall") | Abel; Hornby                                  | medium      | proposed |
| **macguffin** / **genre-convention** | (lower confidence / maintainer-call)                           | Hitchcock/Truffaut; genre theory              | low         | proposed |

### Tier F-persona — residual gaps (3; persona is otherwise saturated)

The persona audit confirmed extreme saturation (whole classes closed by design).
Only three narrow residues survived verification.

| Candidate                   | Phenomenon                                                                                    | Warrant                                            | Confidence                                            | Status   |
| --------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- | -------- |
| **disinhibition**           | holding power itself shifts cognition (approach, less perspective-taking, objectification)    | Keltner, Gruenfeld & Anderson; Galinsky; Guinote   | high                                                  | proposed |
| **circadian-rhythm**        | daily clock oscillation in alertness (chronotype + desync), distinct from fatigue's depletion | Borbély (two-process); Horne & Östberg; Roenneberg | medium                                                | proposed |
| **life-review** (composite) | late-life reappraisal of the whole life story into integrity/despair                          | Butler; Erikson; Wong & Watt                       | medium — over `mortality` + `narrative` + `nostalgia` | proposed |

### Tier F-position — forces on the office (6 engines + 1 composite)

Not attitude-forces (those are persona-side, done). The `position` type is a
world-owned **office / role** (mnemonic TO HOLD; chapters Has / Orders / Loses /
Drives), and the unbuilt space is **institutional forces on the office-as-such**,
independent of any incumbent. A dedicated organizational-sociology pass charted
these. Boundary held throughout against the persona-side `role` / `hierarchy` /
`status` / `power` engines (all `on: persona` — how holding/losing registers on
the _incumbent_); these force the office itself. Each would declare `on: position`
against one of the office's own chapters — the **first-of-kind non-persona cargo
wiring**, so the first to land (`institutionalization`) wants a maintainer eye on
the precedent, as `ptsd`'s mechanics-first shape got.

| Candidate                | Force on the office                                                              | Attaches        | Warrant                                                                | Confidence                                                                                                                                                         | Status   |
| ------------------------ | -------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **institutionalization** | an ad-hoc task/function hardening into a standing office with its own mandate    | Has / Drives    | Selznick; Berger & Luckmann; Meyer & Rowan; Zucker                     | high                                                                                                                                                               | proposed |
| **routinization**        | a charismatic/founder role congealing into bureaucratic office, fiat → procedure | Orders / Has    | Weber (routinization of charisma); Eisenstadt; Trice & Beyer           | high                                                                                                                                                               | proposed |
| **hollowing**            | a live office decaying into a sinecure or figurehead — title kept, mandate gone  | Loses / Orders  | Bagehot (dignified vs efficient); Weber; Merton (ritualism)            | high — members `sinecure` / `figurehead`                                                                                                                           | proposed |
| **oligarchization**      | the office self-perpetuating — holding it displaces the mandate as the end       | Drives / Loses  | Michels (iron law); Merton (goal displacement); Selznick (co-optation) | high                                                                                                                                                               | proposed |
| **interregnum**          | the office destabilized at the transfer of incumbency — the vacancy crisis       | Loses / Has     | Gouldner (succession crisis); Grusky; Guest                            | medium-high — **name is `interregnum`, not `succession`** (that stem is F-place's ecological succession)                                                           | proposed |
| **capture**              | the office turned to serve a constituency other than its mandate                 | Orders / Drives | Stigler; Bernstein; Laffont & Tirole; Carpenter & Moss                 | medium-high — office-scoped stems (`process_office_capture`, not bare `captured` — collides with `attention`/`scarcity`); keep in-world, not real-world commentary | proposed |

- **office-lifecycle** (composite, blocked): the whole institutional life read as an
  arc over `institutionalization` → `routinization` → `oligarchization` →
  `hollowing`, with `interregnum` and `capture` as **discrete bridge events** that
  can interrupt any stage (not sequence-bound). Mirrors `neighborhood-cycle`
  (F-place). Blocked until its four atoms land.

**Build order:** `institutionalization` (the root all others presuppose, and the
first-of-kind precedent) → `routinization` → `hollowing` → `oligarchization` →
`office-lifecycle` composite → `interregnum` + `capture` (last; their naming/stem
flags above want a maintainer call before a PR opens).

### Tier F-pitch — not a force-target, but its own content genus is nearly empty

Two separate questions were collapsed into one "no" the first time, and only the
first deserved it.

**Wiring (settled no).** `pitch` is a cast element (`model.md`'s cast group) but "a
key, not cargo": a reading applied from outside the events. It is structurally
outside the `requires.on` force graph — `validate.mjs` runs a bespoke
`pitchCarryErrors` path _because_ pitch does not fit `requires.on`. No force ever
wires `on: pitch`; that holds.

**Content (open, and large).** But `pitch` is a _type with its own instances_, and
on that axis it is nearly empty: **4 instances, all issued by one engine
(`palimpsest`), all in a single narrow sub-genus** — Genette's _hypertextual_ keys
(parody / travesty / transposition: a tale re-pitched by its debt to a prior text).
The much larger genus that criticism describes — **affective / modal keys that are
not about a prior text at all**, just the register a production is tuned to (Frye's
mythoi, Fowler's mode-vs-genre, tonal-register theory) — is **wholly unbuilt**.
These are new `pitch_*` engines, each with its own Tenor / Undertow / Nerve / Echo,
wired `on: play/Arc` exactly as `palimpsest` is. This is the buildable frontier the
first pass wrongly waved off.

**A. Keys worth issuing (new `pitch`-typed content, `on: play/Arc`).**

| Key                   | Register                                                     | Warrant                                              | Boundary                                                                                                         | Confidence  |
| --------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- |
| **elegiac**           | mourning played as register, loss held at aesthetic distance | Sacks (_The English Elegy_); Fowler (mode)           | vs `grief` (persona emotion) / `nostalgia` — this is the _production's_ stance                                   | high        |
| **melodramatic**      | moral legibility at heightened pitch, stakes worn openly     | Brooks (_The Melodramatic Imagination_); L. Williams | vs `tragic` composite — legibility/excess, not pity-and-fear; no stem collision                                  | high        |
| **pastoral**          | the simple set against the complex to comment on the complex | Empson (_Some Versions of Pastoral_); Fowler         | Fowler's own paradigm case for mode ≠ genre — strong fit for pitch's cross-genre design                          | high        |
| **absurdist**         | cosmic incongruity played deadpan-straight, meaning withheld | Camus (_Sisyphus_); Esslin (_Theatre of the Absurd_) | vs `comic` composite — no play-frame promise of benignness; distinct mechanism                                   | high        |
| **epic / heroic**     | elevated high-mimetic register, hero superior in degree      | Frye (_Anatomy_); Bakhtin ("Epic and Novel"); Lukács | vs `monomyth`/`dramatic-arc` (structure) and `virtue` (trait) — clean separation                                 | high        |
| **grotesque**         | horror and comedy fused in one image, unresolved into either | Bakhtin (_Rabelais_); Kayser (_The Grotesque_)       | vs `uncanny` — fusion, not familiar-turned-strange; related, not identical                                       | medium-high |
| **ironic / satiric**  | Frye's fourth mythos: diminished hero, detachment as stance  | Frye (four mythoi); Fowler (mode)                    | **contested** — `dramatic-irony` (device) and `tone`'s `attitude` already name "ironic"; wants a maintainer read | medium      |
| **noir / hardboiled** | fatalism and moral compromise played as atmosphere           | Schrader ("Notes on Film Noir")                      | Fowler's line cuts against it — historically situated, arguably a _genre_ not a mode                             | medium      |
| **gothic**            | dread mixed with the past's unresolved return                | Botting (_Gothic_); Sedgwick                         | crowded neighborhood — `uncanny` (mechanism) and `awe`'s threat form; register, not either                       | medium      |
| **sentimental**       | pathos cultivated deliberately, the response is the point    | Douglas; Todd (_Sensibility_)                        | thin — risks collapsing into `bittersweet` / `nostalgia`; bar not clearly cleared                                | low         |

**The sharpest finding — hard rejects, not homonyms.** `pitch_tragic`,
`pitch_comic`, `pitch_uncanny`, `pitch_sublime` must **not** be built. Not "collides
loosely": each is _literally the same named phenomenon_ already owned at the
persona / catharsis / audience level by `tragic`, `comic`, `uncanny`, `awe`.
`member-check`'s one-phenomenon-one-engine rule should and would reject them. If a
production-level tragic _key_ is ever wanted, that is a maintainer call on whether
`tragic`'s wiring extends — never a new `pitch_*` engine.

**B. Tonal-force engines living on other types.**

| Candidate                        | Force                                                                           | Wires on                 | Warrant                                           | Verdict                                                                                                                                                                                                        | Status   |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **bathos**                       | a solemn register collapsing unintentionally into the trivial                   | `on: persona/Projection` | Pope (_Peri Bathous_, 1727)                       | **cleanest new build in the pass** — zero stem collision, clean warrant, holds against `comic`/`tragic` failure-states without touching them                                                                   | proposed |
| **modulation** (whole-key)       | the arc turning over from one named pitch to another                            | (`on: plot`)             | Genette (reaccentuation)                          | **no build** — already handled: a plot relinking _which_ pitch is cast, via `pitchCarryErrors`; do not re-litigate                                                                                             | proposed |
| **modulation** (within-plot)     | one plot's atmospheric baseline drifting scene-to-scene short of a whole recast | `on: plot/Cue`           | key-affect theory; Zillmann (excitation-transfer) | **loose thread** — a first-of-kind `plot/Cue` wiring (existing `on: plot` engines all target Action/Tension); reopens at a finer grain a question F-pitch had closed only at the coarse grain; maintainer call | proposed |
| **tonal-contract / -dissonance** | audience genre/register expectation met or broken                               | `on: persona/Projection` | Frow (_Genre_); Neale                             | **mostly no build** — `dramatic-irony` and `comic`/`tragic` flatness cover the enumerated cases; `dissonance` stem is taken (Festinger); a distinct general form is thin vs `surprise`                         | proposed |

**Build-order note (if pursued).** `bathos` first — the one candidate with zero
stem collision and a boundary that holds cleanly. Then the strongest mode-tier four
— `elegiac`, `pastoral`, `absurdist`, `epic/heroic` — as a new pitch-issuing engine
(or a small family) beside `palimpsest`, with `grotesque` close behind. The
`ironic/satiric` / `noir` / `gothic` / `sentimental` tier is maintainer-adjudicated
(each leans on a named neighbor). The `plot/Cue` modulation thread is the one item
worth flagging to a maintainer explicitly, since it reopens a question this doc had
treated as closed. All rows stay `proposed` pending a per-item go.

### Tier F-performance — forces on a captured run (7 engines) — gated on a bounded born-the-type seam

`performance` (`architecture/performance.md`, mnemonic TO LOAN, chapters Lodged /
Occasion / Aftermath / Note) is _"what happened"_ — the claim-ticket a run leaves
beside the play, that _"ages into history the way a plot already is one"_ and is
cast by later productions (a sequel borrows the premiere). Its afterlife is a
clean, well-warranted force-space (performance studies / reception history /
memory studies), with no collisions against any live engine.

**The corrected model.** A **play** (a run) **produces** a **performance**; that
performance's canonical written record is **stored on `khai-writing` — which is
just another house** (a khai-stage house that already exists), _outside this
monorepo_. The in-monorepo performance instance is the claim-ticket "on loan" from
that external record (`repertoire.md`: "lodged with khai-writing and the in-band file
permanently on loan from it"). This corrects an earlier reading twice over: it is not
a package to mint _inside_ this repo (no `writing/*` lane, no `packages/khai-writing`),
and it needs no bespoke cross-repo resolver either. It is a house, so **khai knows
about it the way khai knows about any house: on the bill** — a card in the `khai-plays`
registry (`npx @chbrain/khai-plays register`). A performance's **Lodged** link then
resolves **cross-house through the repertoire**, exactly the path
`order_the_repertoire.md` already built ("cross-house links resolve through
`node_modules` per the composite ruling"). The result layer is external, but its
resolution is a solved problem, not an open one.

| Candidate            | Force on the performance                                               | Attaches           | Warrant                                                        | Confidence                                                      | Status                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **canonization**     | a run becomes the definitive version later productions measure against | Note / Aftermath   | J. Assmann (cultural memory); Guillory; Kermode                | high                                                            | proposed                                                                                                                                                                                                                                               |
| **reinterpretation** | a later age re-reads a fixed record against new values                 | Aftermath          | Jauss (reception); Hayden White; E. H. Carr                    | high                                                            | proposed                                                                                                                                                                                                                                               |
| **revival**          | a dormant performance re-cast into a living production                 | Occasion           | Schechner (restored behavior); Taylor (_Archive & Repertoire_) | high                                                            | proposed                                                                                                                                                                                                                                               |
| **supersession**     | a later run overtakes and demotes an earlier one                       | Aftermath / Note   | Carlson (_The Haunted Stage_, ghosting)                        | medium-high                                                     | proposed                                                                                                                                                                                                                                               |
| **mythologization**  | a run accrues legend beyond what the ticket records                    | Note               | J. Assmann (mnemohistory); Halbwachs; Hobsbawm & Ranger        | medium-high                                                     | proposed                                                                                                                                                                                                                                               |
| **decay**            | the record thins into history, its Note going unheard                  | Note / Lodged      | Phelan (_Unmarked_, disappearance); Nora (lieux de mémoire)    | medium                                                          | proposed — **build as `disappearance`**. `decay` (#1073) is the place engine (the material substrate of decline); this is the record thinning, a different phenomenon on a different type. Phelan's own word for it is free as a stem, and is the name |
| **contestation**     | rival records of the same evening — whose Aftermath is authoritative   | Aftermath / Lodged | Taylor; historiographical contestation                         | medium (or thin composite over reinterpretation + supersession) | proposed                                                                                                                                                                                                                                               |

**The seam (bounded, not a rabbit hole).** Unlike `place`/`piece`/`plan`
(populated, only lacking force-engines), `performance` is unpopulated: **the type
must be _born_ first.** But that is a small, sequenceable seam that copies patterns
this repo already runs — the type-birth after `play`/`plan`/`order`, the house
registration after every house already on the bill.

_Register the house on the bill (`plays/` lane, `khai-plays` registry):_

0. **a card for `khai-writing`** — `npx @chbrain/khai-plays register writing --repo
… --package …`, the same one-command registration every other house on the bill
   used. This is what "khai knows about it" means concretely; once the card is on
   the bill, `khai-writing` is a declared house and Lodged links resolve to it
   cross-house through the repertoire, no new machinery.

_The type-birth half — ours, in this monorepo (`arch` / governance lanes):_

1. **`template_performance.md`** added — it is the _only_ element type missing its
   template. Copy the generic `TO `-mnemonic skeleton (`template_process.md` is the
   closest sibling); `templates.test.mjs` picks it up automatically. (arch lane)
2. **a `validate.mjs` `on: performance` check** — a block parallel to the existing
   `type === "play"/"plan"/"order"` paths, asserting the **Lodged** link resolves
   ("it must resolve, or this is not yet a performance") through the same cross-house
   repertoire resolution. Source and its dormant test are **separate PRs** per rule 3. (governance lane)
3. **at least one real `khai: performance` instance** authored from an actual
   Director capture and cast, round-tripping through `validate.mjs`.
4. **status promoted `draft` → `published`** once 0–3 prove the chapters, the same
   criterion `repertoire.md`'s own order used for itself — not before.

**The resolution question is closed.** `khai-writing` is a house; Lodged resolves
cross-house through the repertoire, the path `order_the_repertoire.md` already built
— no `writing/*` lane, no `packages/khai-writing`, no out-of-band resolver. The one
thing the seam still needs from the maintainer is the seed for step 3: whether a real
Director run is ready to be lodged, or step 3 is synthetic bootstrap content.
`order_the_repertoire.md` deferred this mint _deliberately_ ("Minted … when the
Director's first capture wants writing down; not before") — so this chart is a
**proposal to the maintainer**, not a unilateral build.

**The seven forces unblock together, not in stages.** Once instance #3 populates
Lodged / Occasion / Aftermath / Note, all seven can attach `requires: { on:
"performance", section: <Chapter> }` — there is no internal stagger among them; the
gate is the type being born. Homonym note: `goal` already has a
`position_performance.md` member (Dweck/Elliot achievement goals) — a different
type/namespace, but a future `performance`-root member should avoid the bare stem.

## Separate track — the reflected self (persona self-concept; NOT the cross-type frontier)

Recorded here to remember, kept **cleanly apart** from the cross-type frontier above:
this is ordinary `on: persona` psychology, not a forces-on-neglected-nouns track. It
came from a maintainer research pass on an essay whose science the corpus half-covers.
The gap: the set handles what people _do_ under social pressure (`conformity`,
`self-monitoring`, `emotional-labor`, `face`, `role`) but has no engine for how the
self-concept is _built from reflected social appraisals_, no unifying dramaturgical
frame, and no biological warrant for change without betrayal of self. Three engines
are absent (`self-efficacy`, Bandura, is the already-built fourth anchor):

| Candidate                    | Phenomenon                                                                                    | Warrant                         | Note                                                                                            | Status   |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- | -------- |
| **reflected-appraisal**      | the looking-glass self — other people's gaze becoming a person's own inner voice              | Cooley (1902); Mearns; Sullivan | the distinct Cooley contribution the set is missing; `on: persona`                              | proposed |
| **impression-management**    | the dramaturgical front/back — why people stay on stage even at cost to themselves            | Goffman (1959)                  | consolidates the fragments `backstage` / `role` / `emotional-labor` hold; the unifying frame    | proposed |
| **developmental-plasticity** | the self as a phenotypically plastic system — change without betrayal of a stable disposition | West-Eberhard (2003); Bateson   | no foothold at all today; the biological warrant for change; stem to be checked vs `plasticity` | proposed |

No composite is proposed for this track (the essay reads them as a _movement_, but the
research proposed three engines plus the `self-efficacy` anchor, not a compound). This
is a **later, separate** effort — not queued behind the frontier, just not lost.

## Separate track — the creativity cluster (persona cognition; a gap the analysis missed)

Recorded because a challenge surfaced it and the ten-domain gap analysis did not: khai
has no `creativity` engine, and that is **correct** — creativity is the paradigm
multi-component construct (Amabile's componential theory; Csikszentmihalyi's systems
model; Wallas's four stages), and a monolithic engine would restate its parts and fail
`member-check`. But the analysis read it as covered because the components largely are —
and the generative _core_ slipped through. This track records the real gap: not a
"creativity" engine, but the missing generative engine, two adjacent trait/capacity
engines, and the composite that integrates them.

**Already built (creativity's components) — recorded so they are not re-flagged:**
`insight` (the illumination / aha; already cites Mednick's "associative basis of the
creative process"), `analogy` (creative transfer, Gentner's structure-mapping),
`mind-wandering` (the incubation substrate), `curiosity` + `interest` (the drive),
`flow` (the generative state), `play-mode` (Winnicott's creative posture). Most of
Wallas's stages and Amabile's components are already on the board.

**The genuine unbuilt core:**

| Candidate              | Phenomenon                                                                                                                              | Warrant                                       | Nearest / boundary                                                                                                                                                      | E/C               | Status                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------- |
| **divergent-thinking** | the deliberate generation of many novel, varied, useful ideas -- the generative act itself                                              | Guilford (1950, 1967); Torrance (TTCT); Runco | `insight` (sudden restructuring of _one_ stuck problem, not deliberate generation); `analogy` (structure-mapping, not generation); convergent selection is `decision`'s | Engine (process)  | proposed -- the strong build          |
| **openness**           | openness to experience -- aesthetic sensitivity, ideational fluency, tolerance of ambiguity, the Big-Five trait most tied to creativity | McCrae & Costa; DeYoung (openness/intellect)  | **`temperament` exists** -- verify openness is not already a form there before building; a trait, `on: persona`                                                         | Engine (position) | proposed -- **verify vs temperament** |
| **imagination**        | forming and manipulating mental representations of what is not present                                                                  | Currie & Ravenscroft; Kind; Byrne             | `mind-wandering` (spontaneous drift, not deliberate construction); `possible-selves` (future self-images specifically); the general capacity is unbuilt                 | Engine (process)  | proposed -- boundary work needed      |

**The composite:**

- **creativity** (composite, blocked): the whole in the integrative sense, over
  `divergent-thinking` + `insight` + `analogy` + `mind-wandering` (incubation), with
  intrinsic-motivation (`motivation`) as a referenced driver. Warrant: Amabile
  (componential), Wallas (preparation → incubation → illumination → verification),
  Csikszentmihalyi (systems model), Sawyer. Blocked until `divergent-thinking` lands;
  `insight` / `analogy` / `mind-wandering` already exist as atoms.

**Naming / boundary flags to arbitrate at build:**

- **`fluency` stem is taken** -- _the flag was wrong, and `divergent-thinking`
  (#1136) shipped `process_fluency.md` under no whitelist at all._ `bias` holds
  `position_ease_fluency.md` and `position_fluency_heuristic.md`, which are
  compound stems; the bare `fluency` was free the whole time. Recorded because
  the flag would have cost the engine Guilford's own word for nothing: check the
  stem itself with `member-check`, not the substring by eye.
- **Not gaps:** brainstorming and other ideation techniques are **methods** (a khai-method,
  not an engine); convergent thinking / idea-selection is `decision`'s and `evaluation`'s; the
  creative product's _reception_ is audience-side (`transportation` / `allegiance`).

**Build order (if pursued):** `divergent-thinking` first -- the missing core and the
composite's keystone -- then verify `openness` against `temperament` and `imagination`
against `mind-wandering`, then the `creativity` composite. This is a **later, separate**
effort, recorded so it is not lost, not queued ahead of the cross-type frontier.

## Separate track -- the family-systems cluster (relational structure; a challenge audited against the catalog)

Recorded because a challenge (2026-08-09) proposed twelve additions across somatics,
relational dynamics, cognition, and environment, and the audit found the large majority
**already owned** -- the expected result once the catalog passed 220 engines. The value of
the pass was not the misses but the one real seam it exposed: khai has no
**family-systems** content. The tradition (Bowen, Minuchin, Haley) names relational
_structures_ -- the triangle, the boundary continuum -- that are neither an emotion, a
dyadic bond, nor a group's development, and nothing in the inventory owns them.
`structural-model` looks like it might, but it is **Freud's** id/ego/superego (a `position`),
not Minuchin's structural family therapy; `double-bind` is Bateson's communicational trap
staged as a **plot**, not the standing structure. The seam is genuinely open.

**Already owned -- the challenge's other ten, recorded so they are not re-flagged:**

| Proposed                         | Already lives in                                                                                                                                                                        | Verdict                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **apophenia**                    | `bias` -- owns members `apophenia`, `pareidolia`, `clustering_illusion`, `illusory_correlation`                                                                                         | build restates a `bias` member -> fails `member-check`. No build.                    |
| **sunk-cost**                    | `bias` -- owns `sunk_cost` + `escalation_of_commitment`; the conflict-spiral sense is the `escalation` engine                                                                           | owned twice. No build.                                                               |
| **spotlight-effect**             | `bias` -- owns `spotlight_effect` + `illusion_of_transparency`                                                                                                                          | the exact pair, owned. No build.                                                     |
| **mirroring**                    | `contagion` engine (automatic unconscious mimicry + afferent affect-spread) **and** `rapport` composite (the `meshing` bridge over contagion = "two personas in unconscious synchrony") | textbook-covered, twice. No build.                                                   |
| **interoception**                | `body` engine -- "hunger, fatigue, pain, arousal, sickness pulling on attention until met" (the demand side)                                                                            | the felt-body-pulls-you half is owned; a pure sensing-side split is thin (see flag). |
| **proprioception / kinesthesia** | `ergonomics` (the object's fit to the body) + `proxemics` (distance regulation)                                                                                                         | the spatial/fit half is owned; body-position-sense alone is low narrative payoff.    |
| **ennui**                        | `boredom` ("the aversive state of an unengaged mind whose attention seeks a target the situation will not supply")                                                                      | an existential _register_ of an owned phenomenon, not a new force. No build.         |
| **anticipatory grief**           | between `grief` (adaptation to irreversible loss) + `suspense` (anticipated negative outcome) + `mortality`                                                                             | a `grief` facet at most. No engine.                                                  |
| **surveillance**                 | `social-facilitation` (presence-of-others changes performance) + `total-institution` (Goffman: all life under one authority) + the new `watch` facet (place-side eyes on the street)    | the Panopticon is already assembled from parts. No build.                            |
| **confinement**                  | `total-institution` (the all-encompassing controlled place) + `reactance` (the response to restriction) + `space`                                                                       | owned across a place-engine and a persona-engine. No build.                          |

**The genuine unbuilt core (both stems free; a named, rigorous tradition):**

| Candidate           | Phenomenon                                                                                                                                                                        | Warrant                                                                                                                                                                                             | Nearest / boundary                                                                                                                                                                                                                      | E/C                                         | Status                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------- |
| **triangulation**   | a two-person tension recruits or displaces onto a third to stabilize itself -- the triangle as the basic molecule of a relational system                                          | Bowen (_Family Therapy in Clinical Practice_, 1978; triangles); Minuchin (_Families and Family Therapy_, 1974; detouring, coalitions); Haley (the perverse triangle / cross-generational coalition) | `jealousy` (a rival threatens a held bond -- narrower, affect-first); `group` (Tuckman development, not the three-party structure); `escalation` (dyadic spiral); `double-bind` is Bateson-as-**plot**                                  | Engine -- **process vs plot, a build call** | proposed -- the strong build             |
| **differentiation** | the degree a persona holds a self under a relationship's emotional pressure -- the enmeshed/fused pole (we-ness, no boundary) against the cutoff/disengaged pole (the rigid wall) | Bowen (differentiation of self; fusion; emotional cutoff); Minuchin (the enmeshed <-> disengaged boundary continuum); Kerr & Bowen                                                                  | `self-construal` (independent/interdependent is Markus & Kitayama's cultural self-location, a different lineage -- **bound carefully**); `attachment` (bond security, not boundary regulation); `extended-self` (identity into objects) | Engine (position)                           | proposed -- **verify vs self-construal** |

**On enmeshment specifically:** it is not its own engine -- it is the low-differentiation
**pole** of `differentiation` (Minuchin's enmeshed end), paired with cutoff/disengagement
at the other. Building it standalone would split one axis into two half-engines. One
`differentiation` engine with `fusion` (enmeshment) and `cutoff` (disengagement) as facets
holds the whole continuum.

**Possible composite (blocked until the two engines land):**

- **family-system** (composite, blocked): the household read as a single organism -- over
  `triangulation` + `differentiation` + `double-bind` (Bateson's trap as a member structure)
  - `socialization` (the ready-made world handed down) + `attachment` (the bonds), with a
    boundary/hierarchy reading. Warrant: Bowen; Minuchin; Haley; Satir. Blocked until
    `triangulation` and `differentiation` exist; the other atoms are built. **E-vs-C and the
    wiring target are a maintainer call** -- a family is arguably a `group`-adjacent standing
    structure, so this may want a new cargo read rather than a persona-side composite.

**Naming / boundary flags to arbitrate at build:**

- **Type of `triangulation` is the first decision.** The `double-bind` precedent stages a
  relational structure as a **plot** (the type for an inescapable multi-party bind); a triangle
  is likewise a structure more than a persona-internal process. But Bowen's triangle is also a
  thing a single persona _does_ (recruits a third under stress), which reads as `on: persona`
  process. Decide before writing; it changes the wiring and the member voice.
- **`differentiation` must be bound hard against `self-construal`.** Both are a resting sense
  of where the self stops -- but `self-construal` is the cultural independent/interdependent
  frame (a stable trait of _construal_), while `differentiation` is the Bowenian _capacity_ to
  stay a self inside family emotional fusion. Related, not the same; the REFERENCES Restrictions
  must draw the line explicitly or `member-check`/review will read one as the other.
- **Facet stems checked free:** `triangle`, `detour`, `scapegoat`, `coalition`, `stabilizer`
  (triangulation); `fusion`, `cutoff`, `disengagement`, `individuation` (differentiation).
  `displacement` is taken (`moral-disengagement`) and `closeness` is taken (`addiction`) -- avoid both.
- **A twist is available but not forced** (the `geomorphology`/`legibility` precedent lets an
  engine carry none): triangulation's honest loss-read-as-value is the **stabilizer** -- the
  triangled-in third (often the scapegoated child) is doing load-bearing work, holding the
  system intact, read not only as dysfunction but as the structure's way of surviving its own
  tension. Offer it if it earns its place; do not force it.

**Build order (if pursued):** `triangulation` first (the keystone and the higher narrative
payoff -- every love triangle, every scapegoat, every "go tell your father"), then
`differentiation` (verified against `self-construal`), then the `family-system` composite if
the maintainer wants it. A **later, separate** effort, recorded so the one real seam the
challenge found is not lost -- not queued ahead of standing work.

## Fresh gap sweep -- seven clusters audited against the 264-engine catalog

A whole-catalog discovery pass (the method that found family-systems), run as six parallel
domain-expert audits plus one cross-cutting phenomenon a challenge surfaced. Each candidate
below was checked against the live inventory (taglines + member files, not directory names),
named against its nearest existing owner, and kept only if it clears the one-phenomenon bar.
Everything is `proposed` pending a per-item go; the `tipping-point` row is greenlit for build.
Confidence is marked (**A** strong / **B** solid / **C** borderline).

### The standout -- `tipping-point` (a cross-cutting dynamic-shape force)

The catastrophe/critical-threshold dynamic: a system absorbs load while looking stable
(sub-critical), crosses a hidden threshold, and jumps **discontinuously** to a state it cannot
smoothly return from. The trivial trigger is only the last increment, never the cause. khai
owns the pieces but not the shape: `drift` is the silent creep (explicitly "no event", not the
snap); `escalation` is the loud mutual spiral; `reversal` is the abstract turn without the
loading, threshold, or hysteresis; `grief` is the aftermath. The F-process "dynamic-shape" tier
(`momentum` / `punctuation` / `oscillation`) was charted but never built, so nothing owns the
nonlinear collapse. **Type-generic** -- the same force stalls a marriage, tips a neighborhood,
crashes a market, topples a regime. Warrant: Thom (catastrophe theory, the cusp); Zeeman (the
cusp applied to aggression, riots, panics, with hysteresis); Schelling (tipping / critical
mass); Gladwell (_The Tipping Point_); Gottman (the relational instance -- negative-sentiment
override, the roll-off) and the relationship-dissolution "last straw" literature. Shape: root +
**loading** (sub-critical strain absorbed, the system looking safe) + **criticality** (the
edge, the disproportionate trigger) + **snap** (the discontinuous jump) + twist **hysteresis**
(no smooth path back -- the same irreversibility that dooms a broken thing makes a healed thing
durable). Process, type-generic (F-process). Stems free (`catastrophe` is only Freytag's fifth
act in `dramatic-arc`; `threshold` is `liminality`'s -- different senses). **Confidence A. Greenlit -- build first.**
**Status: shipped (#1158)** -- built as the `tipping-point` engine, the catastrophe /
critical transition.

### Sensory & embodied -- the unfilled senses

| Candidate        | Phenomenon                                                                                                   | Nearest / why distinct                                                                                                                               | Warrant                                                                                       | Type / wiring              | Conf | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **smellscape**   | the olfactory field of a place -- ground odor, scent-signals, the signature smell, the direct hook to memory | exact `soundscape` sibling but no place-side smell engine exists; `body` is the persona's internal demands; `disgust` is rejection, not ambient odor | Porteous ("Smellscape", 1985); Henshaw (_Urban Smellscapes_); Classen/Howes/Synnott (_Aroma_) | process, `place`/Shown     | A    | shipped (#1160)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **touch**        | affective/interpersonal contact as a communicative force -- the hand, embrace, shove at zero distance        | `proxemics` regulates distance _before_ contact and hands off at zero; `contagion` is mimicry not touch; `ergonomics` is object-fit                  | Hertenstein (tactile emotion, 2006/09); McGlone (CT-afferents, 2014); Field (_Touch_)         | process, persona<->persona | A    | **still open — build as `social-touch`**. `touch` (#1162) shipped as the _place_ force (the haptic field a setting has against the body) and **disclaims person-to-person contact by name**: "nor touch between persons, the handshake and the embrace and the blow, which is theirs." `contact` is not the alternative — `intergroup/process_contact.md` holds it for Allport. `social-touch` is free and matches the house pattern (`social-time`, `social-identity`, `social-facilitation`) |
| **intoxication** | the acute altered state -- disinhibition and perceptual narrowing of an active intoxicant, now               | `addiction` is the compulsion across time, not the acute state; `body`/sickness is illness                                                           | Steele & Josephs (alcohol myopia, 1990); Siegel (_Intoxication_)                              | process, `persona`         | B    | proposed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| taste            | flavor as a felt force, the fifth-sense symmetry                                                             | risks being distributed across `body`/hunger + `savoring` + `disgust`                                                                                | Shepherd (_Neurogastronomy_); Korsmeyer (_Making Sense of Taste_)                             | process, persona/piece     | C    | proposed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Rejected (already owned): pain / arousal / hunger / fatigue / sickness -> all `body` members; interoception -> `body`; proprioception -> `ergonomics`/`proxemics`.

### Power, politics & coercion -- the thin political axis

The catalog is emotion/self/cognition-heavy and light on the political; this is the richest
cluster.

| Candidate      | Phenomenon                                                                                                    | Nearest / why distinct                                                                                                                                                                                  | Warrant                                                                  | Type / wiring                    | Conf | Status          |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------- | ---- | --------------- |
| **legitimacy** | what makes domination accepted as rightful -- traditional / charismatic / legal-rational, and its crisis      | `power`'s "legitimate power" is one static resource base; `obedience` presupposes a legitimate authority without modeling it; `hierarchy` is assigned rank                                              | Weber (_Economy and Society_); Beetham; Habermas (_Legitimation Crisis_) | position, on `power`/`hierarchy` | A    | proposed        |
| **coercion**   | compliance by credible threat of harm -- deterrence vs compellence, brinkmanship, the threat never executed   | `power`'s coercive base is static; `aggression` is harm _delivered_; coercion is harm _withheld and held over_ to shape a choice                                                                        | Schelling (_Arms and Influence_); Wrong (_Power_)                        | process, on `power`/`fear`       | A    | proposed        |
| **discipline** | power through internalized visibility -- surveillance, normalization, self-policing subjects (the panopticon) | `total-institution` is Goffman's _place_; `street-life`/`watch` is Jacobs's _protective_ eyes (opposite valence); `obedience` needs a command, discipline needs none                                    | Foucault (_Discipline and Punish_); Bentham (Panopticon)                 | process/place                    | A    | shipped (#1164) |
| **resistance** | the disguised dissent of the dominated -- public vs hidden transcript, foot-dragging, infrapolitics           | `reactance` is individual/apolitical freedom-pushback; resistance is collective, political, concealed, aimed at domination                                                                              | Scott (_Domination and the Arts of Resistance_); Sharp                   | process, on `power`              | B    | proposed        |
| propaganda     | mass, institutional manufacture of consent -- one-to-many, repetition-driven belief-shaping                   | **CONTESTED**: the power audit reads it distinct from dyadic `persuasion`; the communication audit reads it an umbrella over `persuasion`+`framing`+`adoption`+`social-identity`. Resolve before build. | Ellul (_Propaganda_); Herman & Chomsky (_Manufacturing Consent_)         | process                          | C    | proposed        |
| corruption     | abuse of _entrusted_ power for private gain                                                                   | leans on `debt`/`gift`/`betrayal`/`role` but no owner                                                                                                                                                   | Klitgaard (C = M + D - A); Rose-Ackerman                                 | process                          | C    | proposed        |

Rejected: deference -> `status`; scapegoating -> `triangulation` (owns the detoured scapegoat); bureaucracy / mobilization -> umbrellas (`org`/`hierarchy`/`role`; `commons`/`adoption`/`altruistic-punishment`).

### Sacred, spiritual & existential

| Candidate          | Phenomenon                                                                                   | Nearest / why distinct                                                                                                                                                                     | Warrant                                                                                          | Type / wiring       | Conf | Status   |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------- | ---- | -------- |
| **mysticism**      | the unitive/ego-dissolution state -- subject-object boundary collapses into felt unity       | `awe` is _dualistic_ (small self before a vast other); mysticism is _no self and no other_; `flow` keeps agency; `faith` is the standing orientation                                       | James (_Varieties_); Stace (_Mysticism and Philosophy_); Griffiths (psilocybin, ego-dissolution) | process, `persona`  | A    | proposed |
| **calling**        | the felt summons toward a specific path experienced as originating _beyond the self_         | `faith` is orientation to a sacred order in general (no directional summons); `meaning` is _whether_ a life matters; `goal`/`grit` are self-authored aims -- calling is the aim _received_ | Weber (Beruf); Dik & Duffy (2009); Bunderson & Thompson                                          | position, `persona` | B    | proposed |
| **hierophany**     | the qualitative rupture by which a place/time becomes _set apart_ -- sacred vs profane space | `totem` is a group-emblem object; `liminality` is the individual threshold; `place-attachment` is bond to any meaningful place, not the sacred/profane break                               | Eliade (_The Sacred and the Profane_)                                                            | process, `place`    | B    | proposed |
| self-transcendence | the standing trait of locating identity/meaning beyond the self                              | risks distribution across `awe` + `meaning` + `mysticism`                                                                                                                                  | Frankl; Reed (Self-Transcendence Theory); Cloninger (TCI)                                        | position            | C    | proposed |

Rejected: the numinous / the sublime -> `awe` (its sacred and threat colours, Otto/Burke/Kant cited); purity-pollution / consecration / blasphemy / taboo -> `totem` (Douglas, `desecration` member) + `condemnation`; surrender/devotion -> `faith` (`surrender` member); pilgrimage/communitas -> `ritual`+`liminality`+`journey-roles`.

### Economic & exchange

| Candidate                   | Phenomenon                                                                                                                                                           | Nearest / why distinct                                                                                                                                                                  | Warrant                                                                                          | Type / wiring                   | Conf | Status   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- | ---- | -------- |
| **exchange-mode**           | the relational _register_ a transaction runs under -- communal / equality-matching / market-pricing -- and the rupture of applying the wrong one (cash for a favour) | `money` owns the token + `earmarking`, not the relational frame; `gift` owns the gift cycle; none owns the mode or the taboo-tradeoff violation                                         | Alan P. Fiske (_Structures of Social Life_); Fiske & Tetlock (taboo trade-offs); Heyman & Ariely | position, sib to `worth-logic`  | A    | proposed |
| **psychological-ownership** | the felt _mine_-ness of a target (object, idea, role) -- control, self-investment, territoriality                                                                    | `extended-self` is object-as-_identity_ (disclaims valuation); `bias`/endowment is over-_valuation_; ownership is the possessive/territorial control relation, incl. immaterial targets | Pierce, Kostova & Dirks (2001/03); G. Brown (territoriality)                                     | position, `persona`             | B    | proposed |
| conspicuous-consumption     | visible wasteful spending to signal rank; positional goods (worth depends on others lacking)                                                                         | `status` is the rank; `status-move` a tactic; `capital` the holdings -- distinct is the display-through-spend mechanism. **`member-check` risk vs `status-move`**                       | Veblen (_Leisure Class_); Hirsch (positional goods)                                              | process (or status-move member) | C    | proposed |
| moral-economy               | a community's shared normative claim on the economy -- the just price, subsistence right, and the outrage at profiteering                                            | `commons` is Ostrom's governed CPR (place); none owns the collective moral legitimacy of exchange                                                                                       | E. P. Thompson (_Moral Economy_); Scott (_Moral Economy of the Peasant_)                         | position/process                | C    | proposed |

Note: **costly-signaling** (Spence/Zahavi) is the _abstraction over_ conspicuous-consumption -- land one or the other, not both (one-phenomenon). Rejected: bargaining -> `negotiation`; reciprocity -> `gift`; sunk-cost/endowment/windfall -> `bias`; tragedy-of-the-commons -> `commons`+`altruistic-punishment`.

### Communication & discourse

| Candidate            | Phenomenon                                                                                                                     | Nearest / why distinct                                                                                                                                            | Warrant                                                                           | Type / wiring                         | Conf | Status                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **gossip**           | evaluative talk about an absent third -- reputation policed and traded, the dyad bonded by the shared verdict                  | irreducibly triadic and about the absent; no `reputation` engine; `stigma` is a carried attribute, `status-move` a tactic in-scene                                | Dunbar (_Grooming, Gossip_); Gluckman; Feinberg & Willer                          | process, speaker/hearer/absent-target | A    | shipped (#1166)                                                                                                                                                                             |
| **rumor**            | an unverified proposition circulated to make collective sense of an ambiguous, anxious situation -- distorted as it travels    | `adoption` diffuses a _defined_ innovation; `deception` is deliberate/dyadic; rumor is improvised, not necessarily false, spreading where verified info is absent | Allport & Postman (1947, R = importance x ambiguity); Shibutani; DiFonzo & Bordia | process/composite                     | A    | shipped (#1168)                                                                                                                                                                             |
| **phatic-communion** | talk whose payload is the _channel_, not information -- greetings, small talk, the contentless upkeep of the social tie        | `grounding` builds shared understanding of _content_; phatic talk carries none -- it maintains the relational channel                                             | Malinowski (1923); Jakobson (phatic function); Laver                              | process                               | B    | proposed                                                                                                                                                                                    |
| information-cascade  | sequential observational herding -- each actor discards their private signal to copy predecessors, locking a fragile consensus | `conformity` is the individual felt pull; the cascade is the emergent collective mechanism and its fragility                                                      | Bikhchandani, Hirshleifer & Welch (1992); Banerjee (1992)                         | composite/process, near `crowd`       | B    | proposed — check against the `uptake` composite (#1248, `adoption` + `social-identity`), which owns Rogers-style diffusion through a population but not the observational herding mechanism |
| taboo-language       | the forbidden word as hazard, veiled by euphemism -- and the veil wears out (the euphemism treadmill)                          | the _lexical_ force none of `face`/`register`/`framing` own                                                                                                       | Allan & Burridge (_Forbidden Words_); Pinker (euphemism treadmill)                | process                               | C    | proposed                                                                                                                                                                                    |

Rejected: propaganda / misinformation -> `deception`+`persuasion`+`framing`+`adoption` (umbrella; and see the CONTESTED power row); code-switching -> `accommodation`+`register`; naming/labeling -> `categorization`+`stigma`+`speech-act`; storytelling-as-influence -> `narrative`+`transportation`.

### Aesthetic & appreciation

Note: the catalog's `wow` is "Way of Working" (job families), so the aesthetic-wonder space is genuinely unclaimed beyond `awe`.

| Candidate     | Phenomenon                                                                                                                        | Nearest / why distinct                                                                                                                                                  | Warrant                                                                                    | Type / wiring             | Conf | Status   |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------- | ---- | -------- |
| **beauty**    | the disinterested pleasure a persona takes in an object's/place's form -- the felt "this is beautiful"                            | `awe` needs vastness/frame-break; `admiration` attaches to a person's excellence; `interest` is about comprehension; `savoring` prolongs an already-positive experience | Kant (_Critique of Judgment_); Fechner; Berlyne; Reber/Schwarz/Winkielman (fluency)        | process, on piece/place   | A    | proposed |
| **cute**      | the appraisal released by infantile morphology (baby-schema) -- tenderness, approach, gentleness, cute-aggression                 | `caregiving` fires on a vulnerable other's _need_; cuteness fires on morphology alone (even objects/cartoons) yielding aesthetic affect                                 | Lorenz (Kindchenschema, 1943); Sherman & Haidt; Nittono (kawaii); Aragon (cute aggression) | process, on piece/persona | B    | proposed |
| **coolness**  | the social-aesthetic judgment of a person/object as cool -- attributed autonomy, approved rebellious deviation                    | `status` is rank (a subordinate can be cool); `admiration` rewards excellence; `adoption` is the spread not the quality                                                 | Warren & Campbell (JCR 2014); Pountain & Robins (_Cool Rules_); Frank                      | process, on persona/piece | B    | proposed |
| **kama-muta** | being _moved_ / touched -- chest-warmth, tears, chills, from a sudden intensification of communal sharing                         | `elevation` needs witnessed moral excellence; `awe` needs vastness; one construct with its own appraisal. Frame as the single being-moved emotion, not an umbrella      | Fiske, Seibt, Schubert, Zickfeld ("kama muta")                                             | process, `persona`        | B    | proposed |
| camp / kitsch | the sensibility that values artifice, exaggeration, failed seriousness (camp); pre-digested sentiment consumed earnestly (kitsch) | `humor` aims at mirth; `nostalgia` longs; `disgust` rejects -- camp reclaims the tasteless as delight                                                                   | Sontag ("Notes on Camp"); Greenberg; Kulka                                                 | position/process          | C    | proposed |

Rejected: the sublime -> `awe`; taste-as-class-marker (Bourdieu) -> `capital`+`heritage`+`status`; cringe -> `embarrassment`; aesthetic disgust -> `disgust`; picturesque / frisson -> nodes of `beauty`/`awe`, not standalone.

### Verdict and build order

Roughly two dozen candidates survive across seven clusters -- a deep, genuine frontier, densest in **power/politics** (the catalog's thinnest axis) and the **unfilled senses**. Recommended order, by confidence and value:

1. **`tipping-point`** -- greenlit, cross-cutting, the strongest single find; build first.
2. The **A-tier singles**: `smellscape`, `touch`, `legitimacy`, `coercion`, `discipline`, `mysticism`, `exchange-mode`, `gossip`, `rumor`, `beauty`.
3. A possible **power/political cluster** (legitimacy + coercion + discipline + resistance, maybe a `domination` composite) and a **sensory-fill** (smellscape + touch + intoxication, siblings to soundscape) -- each its own family pass if the maintainer wants the composite.

Contested/flagged before any build: `propaganda` (umbrella dispute), `conspicuous-consumption` (member-check vs `status-move`), `costly-signaling` vs `conspicuous-consumption` (pick one), `self-transcendence` (distribution risk).

**What has since landed (audited 2026-08-24).** The standout and half the A-tier
built, and both suggested clusters built as composites rather than being left as
"if the maintainer wants":

- Engines: `tipping-point` (#1158), `smellscape` (#1160), `discipline` (#1164),
  `gossip` (#1166), `rumor` (#1168).
- The **sensory-fill** landed as the `sensorium` composite (#1192) over
  `smellscape` + `soundscape` + `touch` — note the third atom is the _place_
  `touch` engine (#1162), not the interpersonal-contact row, which is still open.
- The **power/political cluster** landed as the `subjection` composite (#1188)
  over `socialization` + `discipline` + `obedience` + `total-institution` — the
  `domination` composite under a different name, and built from a different set
  of atoms than the one proposed here (`legitimacy`, `coercion` and `resistance`
  are still unbuilt, so it composes what existed instead).
- The communication cluster's pair landed as the `grapevine` composite (#1170)
  over `gossip` + `rumor`.

Still open from this sweep: `legitimacy`, `coercion`, `resistance`, `corruption`,
`propaganda`, `mysticism`, `hierophany`, `calling`, `self-transcendence`,
`exchange-mode`, `moral-economy`, `psychological-ownership`,
`conspicuous-consumption`, `beauty`, `taste`, `camp`, `cute`, `coolness`,
`kama-muta`, `intoxication`, `phatic-communion`, `taboo-language`,
`information-cascade`, and the interpersonal-contact row whose stem `touch` now
takes.

## Rejected on inspection (documented so they need not be re-checked)

SDT basic-needs (homonym with `needs` + owned by `motivation`); HEXACO
Honesty-Humility (an axis of `temperament`); ego-depletion _state_ (replication
crisis — build only the trait side under #3); Gray's dyadic morality (a rival
theory inside `moral-judgment`, not a phenomenon); Kohlberg stages
(developmental trajectory); working memory architecture (owned by
`executive-function` + `memory`); theory-of-mind (owned by `empathy/cognitive`);
counterfactual thinking (owned by `regret`); terror management (owned by
`mortality`); Rusbult investment (owned by `loyalty`); Cialdini's six (owned by
`persuasion`); groupthink / polarization / system-justification and ~all named
biases (owned by the 238-member `bias` catalog); privacy regulation & Zimbardo
time-perspective (owned by `space` / `time-perception`); occupational burnout
(blocked by the `caregiving/burnout` member — now a **form** question only: either
Maslach's occupational syndrome is a form under `caregiving`, or it is its own
engine under its own stem. Not a whitelist).

## Separate track -- the fire-adjacent cluster (combustion's declared edge)

The combustion engine (62 members across five domains as of #1226) declares five
refusals in its REFERENCES Restrictions, several of them explicitly "a future
engine's." By management order they have a right to exist in khai as their own
engines; this section is the pickup plan. Mechanics for whoever builds them: each
engine is its own `engine/<name>` lane; per the source/tests rule each lands as two
PRs -- the engine first, its tests second, dormant until the source merges (the
`rumor`-engine pattern); new packages start at 0.1.0 with an **empty** changeset (the
first-release rule); pre-check every proposed member stem with `khai-guard
member-check` before writing. Suggested build order: hearth, then detonation, then
celestial; incendiary and metabolism are the maintainer's call.

| #   | Candidate      | Phenomenon                                                                                                                                                                                                                                                                                              | Warrant                                                                                                                                                                              | Nearest / boundary                                                                                                                                                                                                   | E/C                              | Status                       |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------- |
| 1   | **hearth**     | the kept flame as institution -- fire that must not die: tending, banking (the fire put to sleep in its ash), rekindling (the carried ember; borrowing from a neighbour's hearth), going-cold (the social event -- eviction, death, defeat), the perpetual flame (Vesta, the fire temple, the memorial) | Fustel de Coulanges (_La Cite antique_, the sacred hearth); Goudsblom (fire-keeping as the first regime); Bachelard (_The Psychoanalysis of Fire_); Boyce (Zoroastrian fire temples) | `combustion` (candle/flare/burner own the mechanics); `fire` (the regime); `ritual` (rite structure); the flame-as-symbol stays the play's pitch. Wire: process on place/Shown, like fire                            | Engine (process)                 | shipped (#1228)              |
| 2   | **detonation** | the blast proper, designed or inherited: initiation (the controlled shot -- quarry, demolition), sympathetic (the neighbour that goes because the first did), misfire (the shot that did not go, and must now be approached), uxo (the unexploded that waits decades in a field), breach                | Cooper (_Explosives Engineering_); the GICHD mine-action/UXO literature; the investigation record                                                                                    | `combustion` keeps every explosion that grows out of burning (vce, bleve, dust, pyrotechnics, oxidizer); detonation owns the blast as such. Doctrine/history altitude only -- never formulation or device detail     | Engine (process)                 | shipped (#1229)              |
| 3   | **incendiary** | fire turned against someone: siege (Greek fire to the fire arrow), raid (the incendiary bombing -- the deed and its doctrine), scorched-earth (the army burning its own land in retreat), arson (the set fire and its investigation, motive typology)                                                   | Pyne (fire and war); NFPA 921 (origin-and-cause discipline); the siege-warfare histories                                                                                             | `combustion` firestorm keeps the outcome; this engine owns the deed, the doctrine, and the investigation -- lean hardest on the investigation/consequence reading                                                    | Engine (process)                 | proposed (maintainer's call) |
| 4   | **celestial**  | the sky's bodies as a place's Shown: sun, eclipse, comet, meteor, aurora, starfield -- plasma and light, not oxidation                                                                                                                                                                                  | Krupp (_Echoes of the Ancient Skies_); Aveni (cultural astronomy); the eclipse-in-history record                                                                                     | `weather` (the sky's conditions); `superstition`/the pitch (the omen's meaning); not combustion at all -- a sibling place-force. Wire: process on place/Shown                                                        | Engine (process)                 | shipped (#1230)              |
| 5   | **metabolism** | Lavoisier's respiration-as-slow-combustion -- the body's energy economy: burn rate, reserve, deficit, refeeding                                                                                                                                                                                         | Lavoisier; modern metabolic science                                                                                                                                                  | **Recommended NOT an engine**: `body` already owns hunger and fatigue, and the `margin` composite owns resource-before-no-return. Build as one member `process_metabolism.md` in `engine/body`, or a REFERENCES note | Member of `body` (not an engine) | proposed                     |

Stem collision notes (checked against the inventory at proposal time, 2026-08-19; re-run
`member-check` before building): `hearth`, `detonation`, `incendiary`, `celestial`,
`metabolism` are unclaimed as engine names; watch generic member stems (`tending`,
`banking`, `perpetual`, `initiation`, `breach`, `raid`, `sun`) for collisions and take
the specific form where one collides — `hearth_banking` over `banking` — rather than
asking for a whitelist.

Member-level leftovers inside combustion (not engines; recorded so they are not lost):
the cigarette/upholstery smoulder -- historically the leading fire killer (Babrauskas);
the natural-gas seep fire (Darvaza, Chimaera -- coal-seam's sibling); the
graphite/reactor fire (Windscale, Chernobyl). A later composite once hearth and
celestial exist: the vigil/night-watch reading.

## Fresh sweep (2026-08-24) -- seven gaps the chart never carried

A pass run the other way round from the ones above: instead of enumerating a
field's canonical constructs, it walked the **catalogue's own edges** -- the
places where an engine hands territory away in prose, and the human conditions
a 276-engine catalogue can be checked against by name. Every row below was
verified against member files and REFERENCES, and every stem was checked against
the inventory; three further candidates were rejected on inspection and are
recorded under **Rejected** rather than proposed.

| Candidate      | Phenomenon                                                                                                                           | Nearest / why distinct                                                                                                                                                                                                                                                                                                                                                                                                                          | Warrant                                                                                                                                                                                                          | Type / wiring                                                        | Conf                                                     | Status                                                                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **disability** | a persona disabled by the arrangements rather than by the body -- the misfit between a body and a world built for a different one    | `illness` **hands this away by name**: its `playwright_instructions.md` tells the human the engine "is built on a frame the social model of disability rejects -- read the references before writing a play about disability," and its REFERENCES lists Oliver and Shakespeare as "the engine's bounds, **not settled here**". `stigma` is the discrediting mark carried; `ergonomics` is object-fit to a body; `space` is the setting as mover | UPIAS (1976); Oliver (_The Politics of Disablement_, 1990); Shakespeare (_Disability Rights and Wrongs_, 2006); Garland-Thomson (misfitting, 2011)                                                               | position (persona), with a place-side reading on `Offers`/`Withheld` | **A** -- disclaimed by name, the highest-confidence kind | shipped (#1378)                                                                                                                                                                            |
| **exile**      | being moved off the ground one belongs to, and the standing condition that follows when return is refused                            | `place-attachment` models the bond and its severing as a felt standing (`homesick`, `placeless`) -- not the removal, nor the condition; `ostracism` is exclusion by peers, an event on four needs; `role-exit` is leaving a role                                                                                                                                                                                                                | Said ("Reflections on Exile"); Malkki (_Purity and Exile_, 1995); Sayad (_The Suffering of the Immigrant_); Fullilove (_Root Shock_, 2004)                                                                       | position, reading on place                                           | A-                                                       | proposed -- **stem note**: `displacement` is taken twice (`moral-disengagement/process_displacement.md`, `aggression/process_displaced.md`); `exile` is free                               |
| **dying**      | the terminal phase as a social arrangement -- who knows, who may say so, and what the room is allowed to be                          | `mortality` is the standing posture toward one's own finitude and disclaims both the felt moment and the loss of another; `illness` is the sick role and biographical disruption, and its bargain assumes recovery; `grief` is the aftermath                                                                                                                                                                                                    | Glaser & Strauss (_Awareness of Dying_, 1965 -- the four awareness contexts); Sudnow (_Passing On_, 1967); Saunders (hospice); Kübler-Ross (contested -- name it as such at build)                               | process                                                              | A-                                                       | proposed                                                                                                                                                                                   |
| **scapegoat**  | a collective discharging its own crisis onto one member, whose expulsion restores a peace it could not otherwise reach               | `ostracism` is the excluded persona's side of it; `stigma` the mark; `condemnation` the moral emotion; `family-system/process_identified-patient.md` and `intergroup` carry the family and out-group **instances** but not the mechanism. Zero hits for Girard across the catalogue                                                                                                                                                             | Girard (_Violence and the Sacred_, 1972; _The Scapegoat_, 1982); Douglas (_Purity and Danger_); Frazer                                                                                                           | process, group                                                       | B+                                                       | proposed -- flag the warrant at build: the mechanism is dramaturgically exact, the universal-origin claim is not evidence                                                                  |
| **calamity**   | the sudden collective emergency as a social fact -- the order that forms inside it, and the order that is imagined to have collapsed | `crowd` is the massed environment (Canetti/Le Bon); `total-institution` the closed one; `ptsd`/`cptsd` the individual aftermath; `fire`, `geomorphology`, `weather` and `detonation` supply particular agents -- none models the event itself                                                                                                                                                                                                   | Fritz (the therapeutic-community finding, 1961); Quarantelli & Dynes (the disaster-research tradition); Erikson (_Everything in Its Path_, 1976 -- collective trauma); Solnit (_A Paradise Built in Hell_, 2009) | process on place                                                     | B+                                                       | proposed -- **stem note**: `disaster` is taken by `dramatic-situations/plot_disaster.md` (Polti's situation -- same word, different science), so the name is `calamity` and stays that way |
| **border**     | the place whose whole function is to sort the people who reach it, by a document written elsewhere                                   | `non-place` (Augé) is the space of passage occupied in common with strangers, entered by contract; `liminality` the threshold state; `total-institution` the closed world; `vouching`, `credibility` and `interview` the person-side of being judged. None models the sorting place itself                                                                                                                                                      | Anzaldúa (_Borderlands/La Frontera_, 1987); Van Houtum (b/ordering); Salter (the checkpoint and the airport); Weizman (_Hollow Land_, 2007)                                                                      | place                                                                | B+                                                       | proposed                                                                                                                                                                                   |
| **contention** | how a grievance becomes an organised movement -- and why most never do                                                               | the `relative-deprivation` composite supplies the grievance and states that fraternal deprivation predicts collective action, but models the **appraisal**, not the organising; `politics` is getting an outcome from a body that decides collectively with the rule in play; `crowd` is the mass as environment; `power` is the base held                                                                                                      | McAdam (political process, 1982); Tilly (_From Mobilization to Revolution_, 1978); Tarrow (_Power in Movement_); Snow & Benford (framing)                                                                        | process                                                              | B+                                                       | proposed -- **stem note**: `mobilization` is taken by `moral-conviction/position_mobilization.md`; `contention` is free                                                                    |

**Rejected on inspection (this pass).**

- **State legibility (Scott)** -- looked like a clean homonym gap beside the
  shipped Lynch-sense `legibility` (#1133), and is not one. The `measure` engine
  already owns _Seeing Like a State_ whole -- the simplification, the imposed
  grid that rebuilds the ground to agree with the map, and metis -- and disclaims
  the collision by name: "the readable image of a place is legibility's, which is
  Lynch's sense of the word and not Scott's."
- **Apprenticeship / legitimate peripheral participation** -- owned as a member,
  `expertise/process_apprenticeship.md` (#1265). A directory-name check would
  have missed this; a member check does not.
- **Night / darkness as a place-force** -- looked like the next sibling to
  `soundscape` / `smellscape` / `touch`, and is mostly claimed: `celestial`
  (#1230) reads the starfield "that the place's darkness allows or hides" and the
  light pollution that takes it away, `weather` the sky's conditions, and
  `social-time` the collective clock (`process_calendar`, `process_tempo`). What
  is left -- night as a social institution, Ekirch's segmented sleep -- is a
  member question for those engines, not an engine.

## Shipped off-chart -- what landed without a row (recorded so it is not re-flagged)

**108 packages exist in the catalogue and are named nowhere else in this file.**
`pet` (#1331) was the case that made the point, and it was charted afterwards
(#1343); this is the rest of it. It matters for one mechanical reason: a gap
analysis that diffs a field's constructs against _this file_ rather than against
the tree will re-propose things that already exist, and the check that catches
that is the member-file check, which nobody runs against a name they never think
to look up.

Several of these close proposals made above, which is why they are recorded
rather than left out: `spectating` (#1237) closed the reception cluster;
`subjection` (#1188) is the power/political composite this file asked for, built
over `socialization` + `discipline` + `obedience` + `total-institution` rather
than over the atoms proposed (`legitimacy`, `coercion` and `resistance` are still
unbuilt, so it composed what existed); `sensorium` (#1192) is the sensory-fill,
over `smellscape` + `soundscape` + the place-side `touch`; `grapevine` (#1170) is
the `gossip` + `rumor` pair; and `expertise` (#1265) quietly closed
apprenticeship as a member.

**The rule this file needs, since the guard cannot see it:** a build that starts
off-chart still adds its row here, in the same PR, with status `shipped (#PR)`.
The branch guard computes lanes from the diff and knows nothing about whether a
planning artifact was updated, so this is on the author. Nothing else keeps the
chase list honest.

**And it cannot be gated, which was checked rather than assumed.** The obvious
follow-up to the science-index gate (#1387) is the same move here: fail CI when
a package in the tree is named nowhere in this file. It does not work, for two
measured reasons.

_This file is not a catalogue._ Of 376 packages, **215 carry no structured
record here at all** -- neither an off-chart entry (`` `name` (#N) ``) nor a
table row marked shipped. That is not decay; it is what the file is. It records
what was _proposed_, and most of the tree landed without ever being a proposal.
A coverage gate would demand roughly two hundred rows of bookkeeping for a
planning artifact, which is a worse trade than the staleness it prevents.

_And a prose-mention check is unreliable in both directions._ Searching for the
name instead of a record reports `nerve` and `undertow` as present: both are
chapter names of the `pitch` type (Tenor / Undertow / Nerve / Echo) and have
nothing to do with the composites of those names. Same trap as counting inbound
links by bare filename.

So the rule above stays a rule for authors. What is computable, and what the 12
entries added in this pass came from, is the narrow question: which packages
appear **nowhere** in the file, in any form. That is worth re-running by hand
after a batch of builds; it is not worth a wall.

**Engines (46).**

`advice` (#1286), `anchoring` (#906), `archetypes` (#774),
`asking` (#1273), `bystander-effect` (#921), `collection` (#1274),
`commute` (#1291), `compassion` (#958), `complaint` (#1287),
`confession` (#1270), `courage` (#899), `credibility` (#1279),
`envy` (#678), `expertise` (#1265), `fermentation` (#1289),
`forgiveness` (#670), `gender` (#18), `germination` (#1292),
`gratitude` (#880), `grave` (#1284), `guilt` (#762), `hospitality` (#1269),
`implementation-intention` (#622), `implicature` (#927),
`interpreting` (#1297), `interview` (#1283), `locus-of-control` (#764),
`lottery` (#1282), `mindset` (#763), `non-place` (#1293),
`photograph` (#1277), `pitch-mode` (#620), `pride` (#757),
`role-exit` (#1272), `search-space` (#1093), `self-compassion` (#965),
`self-disclosure` (#888), `spine` (#362), `tourism` (#1278),
`uniform` (#1288), `vouching` (#1294), `waiting` (#1264),
`warning` (#1276), `bell` (#1296), `bidding` (#1281), `language` (#176)

**Composites (62).**

`airing` (#1208), `anomaly` (#1243), `appetite` (#1201), `assent` (#1200),
`befalling` (#1238), `blaze` (#1177), `capability` (#1186),
`clime` (#1217), `conscience` (#1183), `crosstalk` (#893),
`dealing` (#1218), `dwelling` (#1182), `estimation` (#1191),
`exploration` (#830), `forgoing` (#1275), `freehand` (#1247),
`glide` (#1244), `grapevine` (#1170), `heeding` (#1259),
`inconsistency` (#1299), `ingraining` (#1195), `interval` (#1295),
`investiture` (#1198), `jeopardy` (#894), `lasting` (#1197),
`meridian` (#1251), `midst` (#1189), `moral-account` (#803),
`opacity` (#1179), `outdone` (#957), `overriding` (#1267),
`peopling` (#1216), `picking` (#1239), `praise` (#956),
`prospection` (#1180), `reprisal` (#1262), `self-conscious` (#811),
`self-relation` (#967), `selfhood` (#1187), `sensorium` (#1192),
`slack` (#1219), `smarting` (#1240), `spacing` (#1249),
`spectating` (#1237), `squaring` (#1199), `striving` (#1184),
`subjection` (#1188), `swaying` (#1224), `unbecoming` (#1241),
`unmoored` (#1235), `uptake` (#1248), `utterance` (#1190),
`wildland` (#1127), `accent` (#1250), `deserving` (#1211), `nerve` (#1222),
`owing` (#1196), `presentation` (#1185), `regard` (#1214),
`remainder` (#1252), `undertow` (#1210), `writ` (#1246)

## The homonym backlog -- 49 whitelisted stems, chased for a distinct name

The ruling that a distinct stem beats a whitelist reads forward, so the 49
entries already in `memberPolicy.homonyms` were left alone when it landed. This
chases them. Every entry is live -- `member-check` reports no dead exemptions --
so each one is holding a real collision open.

**The finding is that the whitelist has mostly been protecting a bare word the
literature does not use bare.** Eighteen of the renames below are the field's
own compound term, already sitting in the source the member cites: Bandura's
_verbal persuasion_ and _mastery experience_, French & Raven's _reward power_
(the file's title is already "Reward Power"), Tversky & Kahneman's
_representativeness heuristic_, Tajfel's _social creativity_, Back's
_narcissistic admiration_ and _narcissistic rivalry_, Gebauer's _communal
narcissism_, _trust repair_, _self-forgiveness_, _emotional forgiveness_,
Deci & Ryan's _extrinsic_, Hutt's _exploratory play_, Elliot's _approach goal_
and _mastery goal_, Gollwitzer's _if-then planning_, Ainsworth's _caregiver
sensitivity_, Frankl's _search for meaning_. The rename is a **precision gain**
in those rows, not a compromise made to satisfy a gate.

**All 58 proposed stems were checked against the full 2,515-member inventory:
every one is free, and none restates an engine slug.**

**The names below are also in the gate.** `memberPolicy.homonyms` carries them
as `stem -> { proposed }`, so `member-check` names the replacement when a change
touches an engine that still holds an entry, instead of sending the author to
this file at the one moment they are least likely to open it. Twenty of the 25
live entries have a single name; the five that still need more than one engine
to move carry a `note` recording each, and fall back to the generic offer. This document stays
the reasoning; the config is the operative copy, and the two are expected to
agree — if they drift, this one is the record of why, and the config is what
fires.

**Status** is the column this file's own audit says every candidate table needs,
and it was missing here for one revision: `morphology` shipped (#1352) and its
three rows still read as pending until this was added. The rule the audit set
applies to a rename exactly as it does to a build — **the row is updated in the
same PR that lands it**, and the whitelist entry it kills is deleted in the
governance PR that follows.

**Links** counts files that link the member across a package boundary, the way a
composite hard-links an atom: `@chbrain/khai-engine-<engine>/<file>.md`. Those
are the pointers a rename breaks, and they land on the linking package's own
lane, not the engine's. Counting bare filenames instead **overstates it badly**
-- every collision here has two files with the same name, so a filename grep
scores the other claimant's package as an inbound link. Read the qualified
count; it is between 0 and 3 for every row, and zero for 23 of them.

Two rules produce every row.

- **The root keeps the word.** Where one claimant's engine slug _is_ the stem
  (28 of 49), that engine keeps it and the other yields. `anger` belongs to the
  `anger` engine; `emotion`'s reading of it is something else and can say so.
- **The yielding member takes the name its own Owner line already gives it.**
  Every yielding member opens with a link to its parent and a clause naming what
  it is -- `[Emotion](process_emotion.md), the appraisal this feeling is one
reading of`. The family word is already written down in the file; the filename
  just has not caught up.

Where no engine owns the stem (21 of 49), the more generic side yields, or both
do where both have a term of their own.

### The 28 with a root owner

| Stem                 | Root keeps           | Yields                                   | Rename to                      | Why that name                                                                  | Links | Status          |
| -------------------- | -------------------- | ---------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------ | ----- | --------------- |
| `admiration`         | `admiration`         | `narcissism/process_admiration.md`       | `narcissistic_admiration`      | Back et al.'s own term — the admiration route of the ARC model                 | 1     | shipped (#1366) |
| `anchoring`          | `anchoring`          | `bias/position_anchoring.md`             | `anchoring_bias`               | bias's own `_bias` suffix (`action_bias`, `authority_bias`)                    | 0     | shipped (#1360) |
| `anger`              | `anger`              | `emotion/process_anger.md`               | `appraisal_anger`              | its Owner line already says it: "the appraisal this feeling is one reading of" | 1     | shipped (#1364) |
| `contagion`          | `contagion`          | `superstition/position_contagion.md`     | `law_of_contagion`             | Frazer's own name for the sympathetic-magic law                                | 1     | proposed        |
| `creativity`         | `creativity`         | `social-identity/position_creativity.md` | `social_creativity`            | Tajfel & Turner's own term for the identity strategy                           | 1     | proposed        |
| `disgust`            | `disgust`            | `emotion/process_disgust.md`             | `appraisal_disgust`            | the appraisal family, as above                                                 | 0     | shipped (#1364) |
| `embarrassment`      | `embarrassment`      | `shame/process_embarrassment.md`         | `shame_embarrassment`          | the shame family it sits in beside `humiliation`                               | 0     | proposed        |
| `envy`               | `envy`               | `virtue/position_envy.md`                | `vice_envy`                    | virtue holds both registers and already chose `wrath` over `anger`             | 0     | shipped (#1355) |
| `exploration`        | `exploration`        | `negotiation/process_exploration.md`     | `negotiation_exploration`      | one of negotiation's four phases                                               | 1     | shipped (#1368) |
| `fear`               | `fear`               | `emotion/process_fear.md`                | `appraisal_fear`               | the appraisal family                                                           | 0     | shipped (#1364) |
| `framing`            | `framing`            | `pitch-mode/position_framing.md`         | `pitch_framing`                | the pitch's own opening move                                                   | 0     | proposed        |
| `gratitude`          | `gratitude`          | `virtue/position_gratitude.md`           | `virtue_gratitude`             | the virtue register                                                            | 0     | shipped (#1355) |
| `joy`                | `joy`                | `emotion/process_joy.md`                 | `appraisal_joy`                | the appraisal family                                                           | 1     | shipped (#1364) |
| `liminality`         | `liminality`         | `ritual/process_liminality.md`           | `transition`                   | van Gennep's own middle term, beside `separation` and `incorporation`          | 0     | proposed        |
| `loyalty`            | `loyalty`            | `moral-judgment/position_loyalty.md`     | `loyalty_foundation`           | Haidt's foundations are named as foundations                                   | 1     | proposed        |
| `narcissism`         | `narcissism`         | `dark-triad/position_narcissism.md`      | `triad_narcissism`             | the triad's own reading of the trait                                           | 1     | proposed        |
| `obedience`          | `obedience`          | `conformity/process_obedience.md`        | `conformity_obedience`         | the pull conformity models, not Milgram's engine                               | 0     | proposed        |
| `persuasion`         | `persuasion`         | `self-efficacy/position_persuasion.md`   | `verbal_persuasion`            | Bandura's own term for the efficacy source                                     | 1     | proposed        |
| `pride`              | `pride`              | `virtue/position_pride.md`               | `vice_pride`                   | the vice register                                                              | 0     | shipped (#1355) |
| `reactance`          | `reactance`          | `bias/position_reactance.md`             | `reactance_bias`               | the `_bias` suffix                                                             | 0     | shipped (#1360) |
| `recognition`        | `recognition`        | `morphology/plot_recognition.md`         | `folktale_recognition`         | its Owner is `[The Folktale]`; Propp's function, not Honneth's                 | 0     | shipped (#1352) |
| `regime`             | `regime`             | `climate/process_regime.md`              | `climate_regime`               | the standing weather type, not the polity                                      | 1     | proposed        |
| `repair`             | `repair`             | `trust/process_repair.md`                | `trust_repair`                 | the literature's own term                                                      | 2     | proposed        |
| `representativeness` | `representativeness` | `bias/position_representativeness.md`    | `representativeness_heuristic` | matches `availability_heuristic` next to it                                    | 0     | shipped (#1360) |
| `reward`             | `reward`             | `power/position_reward.md`               | `reward_power`                 | French & Raven's own term — the file's title is already "Reward Power"         | 0     | shipped (#1358) |
| `sadness`            | `sadness`            | `emotion/process_sadness.md`             | `appraisal_sadness`            | the appraisal family                                                           | 0     | shipped (#1364) |
| `standing`           | `standing`           | `recognition/process_standing.md`        | `recognition_standing`         | the post-recognition phase, not the composite                                  | 3     | proposed        |
| `trust`              | `trust`              | `faith/position_trust.md`                | `faith_trust`                  | the faith triad's middle term, beside `surrender`                              | 1     | proposed        |

### The 21 with no root owner

| Stem              | Who keeps the bare stem                               | Yields                                         | Rename to                | Why that name                                                                                                                                        | Links | Status          |
| ----------------- | ----------------------------------------------------- | ---------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------- |
| `approach`        | `reversal` keeps it                                   | `goal/position_approach.md`                    | `approach_goal`          | Elliot's own term                                                                                                                                    | 2     | proposed        |
| `bearer`          | `document` keeps it                                   | `stigma/position_bearer.md`                    | `stigmatized`            | Goffman's own word for the one who carries the mark                                                                                                  | 3     | proposed        |
| `communal`        | `narrative` keeps it                                  | `narcissism/position_communal.md`              | `communal_narcissism`    | Gebauer et al.'s own term                                                                                                                            | 0     | shipped (#1366) |
| `emotional`       | neither — both qualify                                | `forgiveness/process_emotional.md`             | `emotional_forgiveness`  | Worthington's own term                                                                                                                               | 1     | shipped (#1397) |
| ↳                 |                                                       | `memory/process_emotional.md`                  | `emotional_memory`       | the field's own term                                                                                                                                 | 1     | proposed        |
| `exploratory`     | `curiosity` keeps it                                  | `play-mode/position_exploratory.md`            | `exploratory_play`       | Hutt's own term                                                                                                                                      | 3     | proposed        |
| `external`        | neither — both qualify                                | `locus-of-control/position_external.md`        | `external_locus`         | Rotter's own phrase                                                                                                                                  | 1     | proposed        |
| ↳                 |                                                       | `motivation/process_external.md`               | `extrinsic`              | Deci & Ryan's own word for it                                                                                                                        | 1     | proposed        |
| `high`            | nobody — a bare `high` names no phenomenon            | `psychological-safety/place_high.md`           | `high_safety`            | the title already reads "High Psychological Safety"                                                                                                  | 1     | shipped (#1392) |
| ↳                 |                                                       | `status/position_high.md`                      | `high_status`            | the title already reads "High Status"                                                                                                                | 2     | shipped (#1394) |
| ↳                 |                                                       | `self-esteem/position_high.md`                 | `high_esteem`            | the one whose title is still bare                                                                                                                    | 1     | shipped (#1393) |
| `internalization` | `conformity` keeps it (Kelman's three)                | `socialization/process_internalization.md`     | `norm_internalization`   | what socialization actually internalises                                                                                                             | 1     | proposed        |
| `low`             | nobody — as `high`                                    | `psychological-safety/place_low.md`            | `low_safety`             | as above                                                                                                                                             | 1     | shipped (#1392) |
| ↳                 |                                                       | `status/position_low.md`                       | `low_status`             | as above                                                                                                                                             | 2     | shipped (#1394) |
| ↳                 |                                                       | `self-esteem/position_low.md`                  | `low_esteem`             | as above                                                                                                                                             | 3     | shipped (#1393) |
| `mastery`         | neither — both qualify                                | `goal/position_mastery.md`                     | `mastery_goal`           | Dweck/Elliot's own term                                                                                                                              | 0     | proposed        |
| ↳                 |                                                       | `self-efficacy/position_mastery.md`            | `mastery_experience`     | Bandura's own term                                                                                                                                   | 1     | proposed        |
| `planning`        | `executive-function` keeps it                         | `implementation-intention/process_planning.md` | `if_then_planning`       | Gollwitzer's own term                                                                                                                                | 2     | proposed        |
| `preparation`     | `negotiation` keeps it                                | `morphology/plot_preparation.md`               | `folktale_preparation`   | the folktale family                                                                                                                                  | 0     | shipped (#1352) |
| `relief`          | `joy` keeps it                                        | `addiction/process_relief.md`                  | `relief_craving`         | the negative-reinforcement term the addiction literature uses                                                                                        | 1     | proposed        |
| `resolution`      | `betrayal` keeps it                                   | `negotiation/process_resolution.md`            | `negotiation_resolution` | the closing phase                                                                                                                                    | 1     | shipped (#1368) |
| `return`          | `monomyth` keeps it                                   | `morphology/plot_return.md`                    | `folktale_return`        | the folktale family                                                                                                                                  | 0     | shipped (#1352) |
| `rivalry`         | `dramatic-situations` keeps it                        | `narcissism/process_rivalry.md`                | `narcissistic_rivalry`   | Back et al.'s own term                                                                                                                               | 1     | shipped (#1366) |
| `searching`       | `boredom` keeps it                                    | `meaning/position_searching.md`                | `search_for_meaning`     | Frankl's, and Steger's scale's, own phrase                                                                                                           | 1     | proposed        |
| `self`            | `bias` keeps it — its family roots are bare by design | `forgiveness/process_self.md`                  | `self_forgiveness`       | the field's own term                                                                                                                                 | 0     | shipped (#1397) |
| ↳                 |                                                       | `archetypes/persona_self.md`                   | `self_archetype`         | **decided**: the persona moves, not the bias family root. "The Self archetype" is Jung's own phrase, and nothing outside `archetypes` links the file | 0     | proposed        |
| `sensitivity`     | neither — both qualify                                | `caregiving/process_sensitivity.md`            | `caregiver_sensitivity`  | Ainsworth's own term                                                                                                                                 | 1     | proposed        |
| ↳                 |                                                       | `disgust/position_sensitivity.md`              | `disgust_sensitivity`    | the field's own term                                                                                                                                 | 1     | proposed        |
| `shadow`          | `archetypes` keeps it (Jung's)                        | `journey-roles/persona_shadow.md`              | `shadow_role`            | matches `journey_role` beside it                                                                                                                     | 0     | shipped (#1369) |
| `trickster`       | `archetypes` keeps it                                 | `journey-roles/persona_trickster.md`           | `trickster_role`         | as above                                                                                                                                             | 0     | shipped (#1369) |

### Mechanics, and why this is a backlog rather than a PR

- **A rename is breaking.** `AGENTS.md` rule 7: composites hard-link member
  files by name, so renaming one is at least `bump:minor` -- the maintainer's
  label, never a silent patch.
- **One engine lane per rename.** `engine/<name>/<topic>` owns
  `packages/engines/<name>/**` and nothing else, so a rename cannot travel with
  the fixes to the packages that link it: the engine PR lands first, each
  linking package's update follows on its own lane. Forty engines are touched
  here in total.
- **The ratchet closes each one, and enforces the order.** Once a rename lands,
  its whitelist entry is dead and `member-check`'s `deadExemptions` warns on
  every run until a governance PR deletes it. That PR **cannot be prepared
  ahead of the rename**: delete the entry while the collision is still live and
  `member-check` hard-fails, so the pre-push hook rejects the branch. #1352 and
  #1353 proved it. Every rename is therefore strictly two PRs in strict order —
  engine first, config second — and never staged in parallel.

**Build order, by cost.** **23 of the 58 renames have zero cross-package links**
and are a single PR each with no follow-on. `morphology` was the first and is
done (#1352, ratchet closed in #1353): three entries cleared in one lane, which
is why it went first. **Twenty remain at zero cost**:
`archetypes/persona_self`, `bias/position_anchoring`, `bias/position_reactance`,
`bias/position_representativeness`, `conformity/process_obedience`,
`emotion/process_disgust`, `emotion/process_fear`, `emotion/process_sadness`,
`forgiveness/process_self`, `goal/position_mastery`,
`journey-roles/persona_shadow`, `journey-roles/persona_trickster`,
`narcissism/position_communal`, `pitch-mode/position_framing`,
`power/position_reward`, `ritual/process_liminality`,
`shame/process_embarrassment`, `virtue/position_envy`,
`virtue/position_gratitude`, `virtue/position_pride`.

`virtue` was the second lane and is done (#1355, ratchet closed alongside):
three entries (`envy`, `gratitude`, `pride`) taking the moral register the
engine had already chosen for itself when it named the sin `wrath` rather than
`anger`. At the maintainer's call the whole set followed the register rather
than only the three — all seven sins as `position_vice_*` and all seven
answering virtues as `position_virtue_*` — so the names carry the
classification the engine's REFERENCES already documents, and no future pole has
to decide the question again. Only the three cleared a whitelist entry; the
other eleven were symmetry, and cost nothing because nothing outside the engine
links any of them. `power/position_reward` was the third lane and is done
(#1358, ratchet closed alongside): a fourth entry cleared on its own, taking
French & Raven's own term, which the file's title had carried all along.
`bias` was the fourth lane and is done (#1360, ratchet closed alongside):
`anchoring`, `reactance` and `representativeness` took the suffix the engine's
own 238-member catalogue already runs on — `_bias` for a bias, `_heuristic` for
a heuristic, as `action_bias`, `authority_bias`, `availability_heuristic` and
`fluency_heuristic` already do. The three were the catalogue's own exceptions,
not a convention imposed on it; the bare stems that survive there (`ease`,
`coherence`, `belonging`, `stake`, `self`) are family roots, which is a
different thing and stays as it is. `emotion` was the fifth lane and is done (#1364, ratchet closed alongside),
the first taken **with** a link cost rather than around one: at
the maintainer's call all five appraisal readings move together, not only the
three that are free. `disgust`, `fear` and `sadness` are unlinked; `anger` and
`joy` are each linked by the `comic` composite, and a stale link there is a hard
failure, not a dangling pointer — `comic`'s suite fails on it. The first attempt
put the rename on `engine/emotion/*` and deadlocked: its CI could not pass until
`comic` was relinked, and the relink could not be committed until the rename
landed. That is what produced the **`rename/<name>/<topic>` lane** (#1363), the
one lane that may carry an engine and the composites that link it — so the
family moves as one thing, in one green PR, rather than three renamed and two
left holding words other engines own.

**A limit the `power` lane found, which `virtue` had hidden.** Every one of
`power`'s six bases is titled "_X_ Power", so the whole-set symmetry that
`virtue` took would apply here too — but it is **not** available at the same
price. `composites/standing` links `position_legitimate.md` and
`position_expert.md` by qualified path, and a rename breaks those links hard:
with the manifest correctly moved, `standing`'s own suite still fails
(1 failed, 8 passed) on the stale pointer alone. Because the engine lane and the
composite lane cannot share a branch, taking all six would leave `main` red
between the two PRs. `reward` is the only base nothing links, which is why it
travels alone. Whole-set symmetry is available for free only where a lane has no
inbound links at all — as `virtue` and `morphology` did — and is a maintainer's
call with a red window anywhere else.

**The count is 34, not 49** — `preparation`, `recognition` and `return` left
`memberPolicy.homonyms` in #1353, `envy`, `gratitude` and `pride` with the
virtue rename, `reward` with the power rename, `anchoring`, `reactance` and
`representativeness` with the bias rename, and `anger`, `disgust`, `fear`,
`joy` and `sadness` with the emotion rename. **Twenty-two cleared across eight
lanes; 36 renames remain — 7 with no inbound link, 29 with one, all of them
landable in a single PR on the `rename` lane.**

With the deadlock gone the order is value, not availability, and the measure is
**entries cleared per lane**. `narcissism` led it at three (`admiration`,
`communal`, `rivalry`) and is done (#1366, ratchet closed alongside), all three
taking the field's own compound terms — Back et al.'s admiration–rivalry concept
and Gebauer's communal narcissism. `negotiation` (#1368) and `journey-roles` (#1369) took the last two of them.
`negotiation` moved only its two contested phases — its four keep `preparation`,
freed when `morphology` took the folktale word, and `invention`, never claimed —
so the engine gave back two words rather than being made uniform.
`journey-roles` settled the question left open above: **`journey-roles` yields,
`archetypes` keeps the bare `shadow` and `trickster`**, where the Jungian Self
also stayed when `self` went the other way. The two engines split on principle
rather than uniformly — Jung's figures keep the words, Vogler's functions say
they are roles.

**From here every remaining lane clears one entry apiece**, so the ordering
stops paying and the work is simply the list -- and the list is shorter than
this section has ever said.

**An entry dies after ONE lane, not two.** Five stems (`emotional`, `external`,
`mastery`, `self`, `sensitivity`) carry a `note` reading "needs both to move",
and for four of them that is simply false as a statement about the gate. A stem
collides while two engines hold it; move either one and the survivor is the sole
owner, so the collision is gone and the exemption protects nothing.
`member-check` says so out loud -- moving only `goal/position_mastery.md` and
leaving `self-efficacy` alone is enough to make it report `mastery` dead. That
was measured, not reasoned: the file was renamed, the gate run, the file put
back.

Only **`self`** genuinely needs two, and for a reason the note does not give:
three engines hold it (`archetypes`, `bias`, `forgiveness`), and `bias` keeps
the bare word by design. So `self` is the one entry on the list that survives
its first lane.

Counted from the tree rather than from the notes:

| entries | holders | lanes to kill each |
| ------: | ------: | -----------------: |
|      24 |       2 |                  1 |
|       1 |       3 |                  2 |

**What the notes are actually recording is a naming intent, not a gate
requirement**, and the two come apart. The Root-owner column is where the
intent lives: "neither -- both qualify" means neither engine has a claim to the
bare word, so both _should_ move even though only one _must_. Where the column
names an owner, the second engine keeping the word is the intended end state.
That distinction is the maintainer's to apply per stem, and it is now visible
instead of buried in a note that overstated the cost.

`high` and `low` were the mirror image: each was held by **three** engines, so
neither died until the third lane. They are gone -- `psychological-safety`
(#1392), `self-esteem` (#1393) and `status` (#1394), the entries deleted in
#1396 -- taking the list from 27 entries and 36 renames to **25 and 30**, and
they were the only three-engine stem pair the list ever carried.
Every heading and total above that says 49 is the count at the time of the
sweep.

Nothing here costs more than three links, so the rest is ordinary work rather
than a tail to be deferred: the heaviest rows are `stigma/position_bearer` (3),
`recognition/process_standing` (3), `self-esteem/position_low` (3) and
`play-mode/position_exploratory` (3).

**Decided (2026-08-24): the persona moves.** `self` had three claimants. With
`forgiveness/process_self` → `self_forgiveness`, two remain, and the maintainer's
call is that `bias` keeps the bare stem -- its family roots are bare by design
(`ease`, `coherence`, `belonging`, `stake`) and renaming one to fix a collision
elsewhere would break a pattern that is doing its own work. `archetypes` yields
instead, to `self_archetype`: Jung's own phrase, nothing outside the engine links
the file, and the whole entry dies in two zero-cost PRs.

**Still open, and it follows from that call.** `shadow` and `trickster` are the
same pair of engines, and the table has `journey-roles` yielding
(`shadow_role` / `trickster_role`, matching `journey_role` beside them) while
`archetypes` keeps the bare stem. If `archetypes` is the side that moves for
`self`, the consistent reading is that it moves for all three --
`shadow_archetype` / `trickster_archetype`, also the field's own phrasing, also
zero-cost. Both readings are defensible: one keeps each engine's internal
pattern, the other keeps one engine's answer the same across three rows. Not
decided here.

## Provenance

Method: ten parallel domain-expert gap analyses (emotion & affect; self,
identity & personality; motivation & volition; social & interpersonal; group,
intergroup & cultural; cognition, memory & metacognition; moral & prosocial;
wellbeing & coping; narrative, dramaturgy & aesthetics; environment, embodiment,
place & time), each verifying candidates against member files and REFERENCES
before counting a gap. Inventory snapshot at analysis time: 163 engines, 20
composites (2026-07-30); Tier 3 (#20–#36) shipped 2026-07-31, adding 12 engines
and 5 composites (comic, love-hate, relative-deprivation, resilience,
post-traumatic-growth).

**Inventory at 2026-08-01: 199 engines, 28 composites.** Since the
analysis snapshot, the tiers above shipped and two further efforts landed: the
**Freud** effort (engines `structural-model`, `transference`, `the-unconscious`,
`ambivalence`, then the `freud` composite) and the opening of the **clinical
tier** (`ptsd` engine, `cptsd` composite). The clinical tier's full candidate
chart is pending a dedicated research pass and a management order (see the
"Clinical tier — opened" section above).

**Current inventory (2026-08-24): 276 engines, 99 composites.**

**Audit pass, 2026-08-24 (this revision).** The list was diffed against the tree
rather than against a field, which is the check it had never had run on itself.
Four findings, all repaired above:

1. **24 rows had shipped and still read as unbuilt**, because nineteen of the
   later tables were written without a Status column. Every candidate table now
   has one, filled with the PR that landed the row.
2. **Two further rows match a shipped name and are not that engine.** The
   F-performance `decay` row
   and the fresh-sweep interpersonal `touch` row share stems with shipped engines
   that model different phenomena on different types — and the shipped `touch`
   (#1162) disclaims person-to-person contact by name. Both rows are still open,
   and both now say so along with the stem problem they inherited.
3. **96 packages had shipped with no row at all** — the `pet` (#1331) case,
   ninety-six times over. Recorded under "Shipped off-chart", with the rule that
   should stop it recurring.
4. **Three factual errors:** a `design` type that does not exist and a missing
   `repertoire` in the cross-type map's Machinery bullet, and inventory counts
   three efforts out of date in the intro and here.

**Homonym pass, 2026-08-24.** The 49 live entries in `memberPolicy.homonyms`
were chased for distinct names; all 49 have one, and 18 of them are the field's
own compound term rather than the bare word the whitelist was holding. Charted
in "The homonym backlog", with the inbound-link cost per rename and the reason
it is 40 engine lanes rather than one PR.

The seven new candidates in "Fresh sweep (2026-08-24)" came out of the same pass,
run the other way round: from the catalogue's own disclaimers outward, rather
than from a field's canon inward. `disability` is the strongest row in the file
by the signal that produced Tier 1's best rows — an existing engine handing the
territory away in its own prose.

## Tier 4 — The 2026-08 Extension (New Candidates)

A supplemental research pass (August 2026) surfaced candidates across group
dynamics, narrative reception, and clinical architecture. Reviewed 2026-08-31
against the shipped engine list and this file's own earlier adjudications; see
the review-pass note after Tier 7 for what the review changed.

| #   | Candidate             | Phenomenon                                                                                   | Warrant                                                                                        | Nearest / boundary                                                                                                                                                                                                                       | E/C               | Status   |
| --- | --------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------- |
| 56  | **parasocial**        | the illusion of a reciprocal relationship with a media persona or public figure              | Horton & Wohl (1956); Giles (2002); Rubin                                                      | `attachment` / `empathy` (both expect or require two-way interaction); `allegiance` (rooting for a character, not a simulated friendship)                                                                                                | Engine (position) | proposed |
| 57  | **deindividuation**   | loss of self-awareness and evaluation apprehension in group settings → disinhibited behavior | Festinger/Pepitone/Newcomb (1952); Zimbardo (1969); Reicher (SIDE model)                       | `crowd` (the massed environment that presses before anyone speaks; deindividuation is the persona-level loss of self-evaluation inside it); `conformity` (yielding to norms); `social-identity` (categorization)                         | Engine (process)  | proposed |
| 58  | **delusion**          | fixed, false beliefs resistant to contradictory evidence (persecutory, grandiose, somatic)   | Jaspers (primary vs secondary); Freeman & Garety (cognitive model of persecutory delusions)    | `belief` (belief as such, formed and revisable); `belief-in-a-just-world` (a specific worldview); `superstition` (magical thinking, not a fixed break from reality)                                                                      | Engine (position) | proposed |
| 59  | **illness-anxiety**   | preoccupation with having or acquiring a serious undiagnosed medical illness                 | Warwick & Salkovskis (cognitive-behavioral model of hypochondriasis); DSM-5                    | `illness` (the social and biographical career of a named condition: Parsons, Bury, Frank; illness-anxiety runs before or without the diagnosis); `anxiety` (general threat anticipation); `body` (interoception, here misread as threat) | Engine (process)  | proposed |
| 60  | **imposter-syndrome** | persistent inability to internalize success and fear of being exposed as a fraud             | Clance & Imes (1978); Harvey & Katz                                                            | `self-esteem` (general self-worth); `anxiety` (general). Imposter phenomenon is specifically tied to _competence and achievement_ despite contradictory evidence                                                                         | Engine (position) | proposed |
| 61  | **schizophrenia**     | syndrome of positive (psychotic) and negative (deficit) symptoms                             | Bleuler; DSM-5. **Blocked on:** `delusion` + `hallucination` (unbuilt) + `anhedonia` (shipped) | _Clinical composite._ A foundational missing disorder in the clinical tier                                                                                                                                                               | Composite         | proposed |

## Tier 5 — The Engineering / Systems Extension (New Candidates)

A supplemental pass (August 2026) surfacing forces from engineering, systems theory, and cybernetics that act on processes, plans, and pieces.

| #   | Candidate             | Phenomenon                                                                                  | Warrant                                    | Nearest / boundary                                                                                                                                                                                              | E/C              | Status          |
| --- | --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------- |
| 62  | **technical-debt**    | the compounded future cost of choosing a fast, easy solution over a better, longer approach | Cunningham (1992)                          | `debt` (financial obligation); `decay` (material entropy). Technical debt is an _intentional design trade-off_ that incurs ongoing maintenance friction                                                         | Engine (plan)    | proposed        |
| 63  | **bottleneck**        | the slowest or most constrained stage dictates the throughput of the entire process         | Goldratt (Theory of Constraints, 1984)     | already charted: the dynamics pass above holds `bottleneck` with a deeper warrant (Liebig, law of the minimum -> Goldratt -> queueing theory) and the boundary against `scarcity` drawn; one candidate, one row | Engine (process) | struck (review) |
| 64  | **normal-accident**   | complex, tightly-coupled systems inevitably experience unpredictable, cascading failures    | Perrow (1984); Dekker (drift into failure) | `drift` (the unnoticed baseline slide; Dekker reads failure through it); `bias` (human error). The normal-accident is a property of the architecture, interactive complexity times tight coupling               | Engine (process) | proposed        |
| 65  | **path-dependence**   | historical choices constrain future possibilities (lock-in), even when suboptimal           | David (1985, QWERTY); Arthur (1989)        | `habit` (individual automaticity); `tipping-point` (the discontinuous, irreversible snap; path-dependence forecloses alternatives with no snap at all). The structural switching cost in a system               | Engine (process) | proposed        |
| 66  | **leverage-point**    | specific places in a complex system where a small shift produces large systemic changes     | Meadows (1999)                             | `tipping-point` (where a system snaps under its own accumulating load; a leverage-point is where a designer intervenes on purpose). Specific systemic interventions: feedback loops, information flows          | Engine (process) | proposed        |
| 67  | **cascading-failure** | the failure of one node triggers successive failures down the line                          | Watts (2002); Barabási (Network Science)   | `contagion` (spread through susceptible hosts); `tipping-point` (one system's threshold). Cascading failure propagates through load redistribution: each failed node raises the stress on the survivors         | Engine (process) | proposed        |

## Tier 6 — The Multidisciplinary Extension (New Candidates)

A supplemental pass (August 2026) surfacing forces from political science, game theory, ecology, and organizational theory.

| #   | Candidate                   | Phenomenon                                                                                  | Warrant                                                          | Nearest / boundary                                                                                                                                                                                                                         | E/C               | Status          |
| --- | --------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | --------------- |
| 68  | **bureaucracy**             | the structuring of power through impersonal rules, hierarchy, and specialized jurisdiction  | Weber (1922)                                                     | already rejected: the power audit reads bureaucracy as an umbrella over `org` / `hierarchy` / `role` (see the Rejected line under that pass); nothing here overturns that reading                                                          | Engine (process)  | struck (review) |
| 69  | **tragedy-of-the-commons**  | individual rational behavior over-consumes a shared resource, leading to collective ruin    | Hardin (1968); Ostrom (1990)                                     | held by the shipped `commons` engine, which cites Hardin (1968) as the baseline problem its Ostrom institutions answer and stages the unregulated pool in its own content; the tragedy is that engine's founding contrast, not a gap       | Engine (process)  | struck (review) |
| 70  | **principal-agent-problem** | the conflict in priorities between a person or group and the representative acting for them | Ross (1973); Jensen & Meckling (1976)                            | `trust` (interpersonal); `betrayal`. The shipped `agency` engine is Latour's artifact-as-delegate, a different phenomenon on a safely distinct stem. This is a structural misalignment of incentives when agency is delegated              | Engine (position) | proposed        |
| 71  | **symbiosis**               | a persistent, close biological or structural interaction between two different organisms    | De Bary (1879); Margulis (Endosymbiosis)                         | `attachment` (a bond formed by interaction); `caregiving` (one-directional provision). Symbiosis is an obligate or mutually shaping structural reliance, no intention required                                                             | Engine (process)  | proposed        |
| 72  | **precedent**               | a past decision serving as an authoritative rule or pattern for future, similar cases       | Schauer (_Precedent_, 1987); Duxbury (2008); Hart (adjudication) | `law` (legality as the standing condition, Hart's secondary rules; verify against `position_law.md` before build, precedent may be law's member territory); `habit` (individual). An explicitly cited, binding rule from a past decision   | Engine (plan)     | proposed        |
| 73  | **hyperreality**            | the inability to distinguish reality from a simulation of reality                           | Baudrillard (1981); Eco                                          | `authenticity` (the real-against-staged judgement); `uncanny` (the almost-real that unsettles); **delusion** (#58, unbuilt, clinical). A cultural, media condition where the copy replaces the original and the judgement itself dissolves | Engine (process)  | proposed        |
| 74  | **framing**                 | the presentation of information that influences how people process and interpret it         | Goffman (1974); Tversky & Kahneman (1981)                        | shipped: `packages/engines/framing` already stages exactly this (the valence, emphasis, metaphor, and exemplar operations), and this file marks it shipped (#1003) in the communication pass                                               | Engine (process)  | struck (review) |

## Tier 7 — Strategy, Networks, and Memory (New Candidates)

A final supplemental pass (August 2026) surfacing deep structural forces from military strategy, linguistics, network science, and historiography.

| #   | Candidate                   | Phenomenon                                                                                   | Warrant                                                                                            | Nearest / boundary                                                                                                                                                                                                                 | E/C               | Status          |
| --- | --------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------- |
| 75  | **friction**                | the degradation of a plan when executed in reality due to accumulated, unpredictable factors | Clausewitz (_On War_)                                                                              | `decay` (material entropy); `drift` (the baseline slide with no event). Friction is the resistance of reality to a theoretical plan, accumulating from countless small unpredictables                                              | Engine (plan)     | proposed        |
| 76  | **deterrence**              | the prevention of an action by the credible threat of unacceptable counter-action            | Schelling (MAD / Game Theory)                                                                      | inside **coercion**'s charted span: the power pass already proposes coercion covering deterrence against compellence and brinkmanship, on the same Schelling warrant; if coercion builds, deterrence is its withheld-harm mode     | Engine (position) | struck (review) |
| 77  | **attrition**               | winning a conflict by gradually wearing down the opponent's capacity and will to fight       | Delbrück (Ermattungsstrategie vs Niederwerfungsstrategie); Clausewitz                              | `wear` (object decay); `erosion` (slow material loss); `stress` (psychological). A strategic posture choosing endurance over decisive maneuver                                                                                     | Engine (process)  | proposed        |
| 78  | **shibboleth**              | a linguistic or cultural marker that unconsciously reveals in-group/out-group status         | Judges 12:5-6 (the source episode); Labov (1966, the sociolinguistic variable); McNamara (2005)    | `register` (the commanded insider code, badge and closure modes; a shibboleth is the involuntary tell, revealing precisely because it cannot be performed); `stigma` (a visible mark); `secret` (hidden knowledge)                 | Engine (piece)    | proposed        |
| 79  | **preferential-attachment** | new connections or resources disproportionately flow to nodes that already have them         | Barabási (Network Science); Merton (Matthew Effect)                                                | `capital` (accumulated value); `status` (social standing). Preferential attachment is the _network mechanic_ ("the rich get richer") driving inequality                                                                            | Engine (process)  | proposed        |
| 80  | **collective-memory**       | how a society actively constructs, forgets, and enforces a shared version of its past        | Halbwachs (1925)                                                                                   | `memory` (individual recall); `heritage` (the formation one persona arrives carrying); `nostalgia` (the longing register). Collective memory is socially negotiated historiography serving present needs                           | Engine (process)  | proposed        |
| 81  | **orthodoxy**               | the systemic definition and enforcement of ideological boundaries to protect a core system   | Weber (routinization of charisma); Douglas (_Purity and Danger_, 1966); Kurtz (heresy, _AJS_ 1983) | `tightness-looseness` (Gelfand: how strongly norms are enforced; orthodoxy is the machinery that does the enforcing); `conformity` (the yielding); `faith` (the held commitment). The boundary-policing, heresy-hunting mechanisms | Engine (process)  | proposed        |

### The review pass (2026-08-31)

Five rows above are struck rather than deleted, so the sweep stays on the
record: `framing` is a shipped engine; `bureaucracy` re-proposed what the power
audit had already rejected as an umbrella; `bottleneck` re-derived a row the
dynamics pass already holds with a deeper warrant; `tragedy-of-the-commons` is
the shipped `commons` engine's own founding contrast, cited in its REFERENCES;
`deterrence` sits inside coercion's charted span. The repair made to every
surviving row: a backticked name in the Nearest column is a shipped engine,
checked against `packages/engines/`, never a guess -- the earlier tiers keep
that convention, and it is the whole value of the column. Four warrants that
named a field rather than a scholar (precedent, attrition, shibboleth,
orthodoxy) were given their scholars. That leaves **21 live candidates** in
Tiers 4-7.
