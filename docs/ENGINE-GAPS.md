---
updated: "2026-07-30"
---

# Engine & composite gaps — a chase list

A structured backlog of **genuinely-missing, well-warranted** engines and
composites, produced by a systematic gap analysis: ten domain-expert passes,
each enumerating its field's canonical constructs and diffing them against the
full inventory (163 engines, 20 composites at time of writing), verifying each
candidate against actual member files — not directory names — so that a
construct already owned as a _form_ of an existing engine is not counted as a
gap.

This is a **planning artifact**, not canon. Nothing here is committed content;
each row is a proposal to be built to the usual standard (LORE warrant, one
phenomenon / one engine, clean boundaries, member-check clean or a maintainer
whitelist) on its own lane and PR. Update **Status** as items land.

**Status legend:** `proposed` · `approved` · `building` · `shipped` · `parked`
(deferred) · `rejected` (with reason).

## How to read a row

Each candidate carries: the **phenomenon** (one line), the **warrant** (key
citations), the **nearest existing engine** and the **boundary** that keeps it
distinct, whether it is an **engine or composite** (composites name the atoms
they read over — all must already exist), and the **collision risk** on its
likely member stem (whether it clashes with the inventory and would need a
`memberPolicy.homonyms` whitelist).

---

## Cross-cutting findings

Two whole **clusters** are systematically absent, not just stray atoms:

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

| #   | Candidate                                       | Phenomenon                                                                                      | Warrant                                                      | Boundary / friction                                                                                                                                                                                                  | Status   |
| --- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 13  | **individualism–collectivism** / self-construal | independent vs interdependent self-construal; cultural default weighting of self-vs-group       | Markus & Kitayama (1991); Triandis (1995); Hofstede          | **Homonym**: the `construal` engine is Construal-_Level_ Theory (Trope/Liberman). Name it `collectivism` / `interdependence`, or whitelist `self-construal`. _(2-pass convergence: self + group)_                    | proposed |
| 14  | **tightness–looseness**                         | strength of a culture's norms and its tolerance for deviance                                    | Gelfand et al. (2011, _Science_); Gelfand (2018)             | `conformity` (a person yielding) vs the _system property_ upstream of yielding. Clean stems (`tight`/`loose`). Pairs with #13 as a `culture` cluster                                                                 | proposed |
| 15  | **defense**                                     | unconscious, anxiety-driven reality-distortion; mature→immature maturity hierarchy              | A. Freud (1936); Vaillant (1977); Cramer (2006)              | Distinct from `regulation` (_conscious_ strategy) & `moral-disengagement`. **Homonym load**: `denial` (mortality), `suppression` (regulation), `displacement` (moral-disengagement), `projection` → whitelist needed | proposed |
| 16  | **self-verification**                           | drive to seek feedback that _confirms_ the self-concept, even when negative                     | Swann (1983, 2012); Swann/Rentfrow/Guinn (2003)              | Opposing motive to self-enhancement (`bias/self_serving`, `dissonance`). Slight adjacency to `bias/self_consistency`; stem `verification` free                                                                       | proposed |
| 17  | **coping**                                      | effortful, appraisal-driven repertoire vs a stressor (problem/emotion/avoidant/meaning-focused) | Lazarus & Folkman (1984); Carver COPE (1989); Folkman (2008) | `stress` owns the involuntary autonomic routing; `regulation` owns emotion-timeline moves. Must hand emotion-focused coping to `regulation` explicitly                                                               | proposed |
| 18  | **self-handicapping**                           | erecting obstacles pre-outcome so failure is externally attributable                            | Berglas & Jones (1978); Rhodewalt                            | Behavioral, anticipatory self-protection — not a post-hoc attribution bias (`bias/self_serving`). Keep stem `handicap` distinct                                                                                      | proposed |
| 19  | **self-affirmation**                            | restoring self-integrity by affirming an _unrelated_ valued domain to reduce defensiveness      | Steele (1988); Sherman & Cohen (2006)                        | Currently a prose footnote in `dissonance`; operates far beyond it (health, stereotype threat). Coupled to `dissonance`/`self-esteem` but not reducible                                                              | proposed |

---

## Tier 3 — moderate / lean-composite (worth filing; not top priority)

| #   | Candidate                                | Phenomenon                                                                    | Warrant                                                            | Note                                                                                             | Status   |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------- |
| 20  | **hatred**                               | durable eliminatory sentiment toward a devalued other                         | Sternberg (duplex theory); Fischer et al. (2018)                   | Sustained sentiment vs `anger` (incident) / `contempt` (disengaged dismissal). Engine-leaning    | proposed |
| 21  | **belief-in-a-just-world**               | standing conviction the world is fair → victim derogation                     | Lerner (1980); Hafer & Bègue (2005)                                | `schadenfreude` cedes the deservingness judgment; distinct standing worldview. Engine (position) | proposed |
| 22  | **moral-conviction**                     | the metacognitive stamp that an attitude is a moral imperative                | Skitka et al. (2005); Skitka (2010)                                | Orthogonal to _which_ foundation fires (`moral-judgment`) — the mandate _status_ on an attitude  | proposed |
| 23  | **altruistic-punishment**                | paying a personal cost to sanction a norm violator (incl. third-party)        | Fehr & Gächter (2002); Fehr & Fischbacher (2004)                   | The behavioral act vs `condemnation`'s emotion. Overlaps `aggression`; discount for that         | proposed |
| 24  | **capitalization**                       | sharing good news; the partner's active-constructive response builds the bond | Gable/Reis/Impett/Asher (2004); Langston (1994)                    | `savoring` owns only the intrapersonal "sharing"; this is the _responder_ fork                   | proposed |
| 25  | **dramatic-irony**                       | audience knows what a character does not                                      | Pfister (1988); Sternberg (1978)                                   | `secret` is character↔character; this is audience↔character asymmetry. Small engine              | proposed |
| 26  | **comic** (composite)                    | the mirth response comedy is built to produce — the twin of `tragic`          | McGraw & Warren (benign violation); Frye; Morreall                 | Composite over `humor` + `surprise` + `emotion`. `tragic` exists; comedy has no counterpart      | proposed |
| 27  | **insight**                              | sudden "aha" restructuring, no feeling-of-warmth ramp                         | Metcalfe & Wiebe (1987); Ohlsson (1992)                            | Distinct from `confusion`'s effortful resolve; joins the knowledge-emotion family. Engine        | proposed |
| 28  | **mind-wandering**                       | spontaneous, task-unrelated thought; perceptual decoupling                    | Smallwood & Schooler (2015); Killingsworth & Gilbert (2010)        | `attention` selects; this is the self-generated drift away. Engine                               | proposed |
| 29  | **analogy**                              | reasoning by relational structure-mapping; transfer                           | Gentner (1983); Gick & Holyoak (1980)                              | `framing/metaphor` is rhetorical; this is the reasoning/transfer mechanism. Engine               | proposed |
| 30  | **categorization**                       | graded prototype membership; basic-level; concept formation                   | Rosch (1978); Murphy (2002)                                        | `representativeness` _uses_ categories; this is their formation/structure. Engine                | proposed |
| 31  | **honor / dignity / face worth-logics**  | cultural rule for how personal worth is assigned & defended                   | Nisbett & Cohen (1996); Leung & Cohen (2011)                       | `face` is Brown & Levinson politeness, not the culture typology. Needs a distinct stem           | proposed |
| 32  | **relative-deprivation**                 | grievance from unfavorable (esp. group) comparison → collective action        | Runciman (1966); Smith/Pettigrew (2012)                            | `comparison` is neutral evaluation; this is the affective-injustice layer. Lean composite        | proposed |
| 33  | **resilience**                           | stable functioning maintained across a potentially traumatic event            | Bonanno (2004); Masten (2001); Kobasa (hardiness)                  | Distinct from `grit` (goal stamina) & `hedonic-adaptation` (drift). Lean composite               | proposed |
| 34  | **post-traumatic-growth**                | positive transformation _through_ struggle, beyond baseline                   | Tedeschi & Calhoun (1996/2004); Janoff-Bulman                      | Composite over `meaning`+`narrative`+`mortality`+`identity`                                      | proposed |
| 35  | **fear-of-failure / achievement-motive** | resting approach-success vs avoid-failure motive                              | Atkinson (1957); McClelland (1961); Elliot & Church (1997); Conroy | The upstream _motive_ vs `goal`'s achievement-goal orientation. Homonym risk with `goal`         | proposed |
| 36  | **embodied-metaphor**                    | abstract concepts scaffolded on sensorimotor experience                       | Lakoff & Johnson (1980); Williams & Bargh (2008)                   | Impeccable warrant, poor engine-shape (diffuse mechanism). Maintainer judgment                   | proposed |

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
(blocked by the `caregiving/burnout` member — a whitelist/form question).

## Provenance

Method: ten parallel domain-expert gap analyses (emotion & affect; self,
identity & personality; motivation & volition; social & interpersonal; group,
intergroup & cultural; cognition, memory & metacognition; moral & prosocial;
wellbeing & coping; narrative, dramaturgy & aesthetics; environment, embodiment,
place & time), each verifying candidates against member files and REFERENCES
before counting a gap. Inventory snapshot: 163 engines, 20 composites (2026-07-30).
