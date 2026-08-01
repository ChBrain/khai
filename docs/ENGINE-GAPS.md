---
updated: "2026-08-01"
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

| #   | Candidate          | Phenomenon                                                                       | Warrant                                                                                                                    | Nearest / boundary                                                                                                                           | E/C               | Status   |
| --- | ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------- |
| 37  | **ocd**            | intrusive, ego-dystonic obsessions → neutralizing compulsions                    | Rachman (thought–action fusion); Salkovskis (inflated responsibility); Foa & Kozak; Gillan                                 | `superstition` (disclaims "OC ritual" by name); `habit` (automatized ritual); `disgust` (contamination)                                      | Engine (process)  | proposed |
| 38  | **anhedonia**      | blunted capacity for pleasure/interest — consummatory / anticipatory / social    | Ribot (coinage); Klein; Treadway & Zald; Rizvi et al.; RDoC Positive Valence                                               | `reward` (discount rate — orthogonal); `sadness` (low mood, not blunted responsivity)                                                        | Engine (position) | proposed |
| 39  | **mania**          | elevated/expansive/irritable activation episode; grandiosity, reduced sleep need | Depue & Iacono (BFS); S. L. Johnson (BAS dysregulation); Akiskal (hyperthymic temperament)                                 | `joy` (appraisal node); `flow` (absorption); homonym w/ `desire/obsessive`'s Lee love-style label                                            | Engine (process)  | proposed |
| 40  | **social-anxiety** | fear of negative evaluation — anticipatory / performance / post-event            | Clark & Wells (1995); Rapee & Heimberg (1997); Leary (sociometer); Hofmann                                                 | `fear/phobia` (conditioned object-fear, not evaluation); `embarrassment` (acute, not anticipatory-chronic)                                   | Engine (process)  | proposed |
| 41  | **dissociation**   | disconnection from thought/feeling/memory/identity/surroundings under overwhelm  | Putnam (discrete states); van der Hart et al. (structural dissociation); Bernstein & Putnam (DES); Freyd (betrayal trauma) | `the-unconscious` (repression, not structural split); `ptsd/estrangement` (numbing, not splitting); `defense/immature` (category, not depth) | Engine (process)  | proposed |
| 42  | **body-image**     | perceived-vs-ideal body; appearance-contingent self-worth                        | Thompson et al. (tripartite); Stice (dual-pathway); Fredrickson & Roberts (objectification); Cash                          | `comparison` (general); `self-discrepancy` (general gaps); `body` (interoception — delegates appearance away)                                | Engine (position) | proposed |

### Tier C2 — composites buildable now (all atoms already exist)

| #   | Candidate                    | Phenomenon                                                                    | Atoms (all exist)                                                              | Warrant / note                                                                                                                    | Status   |
| --- | ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 43  | **panic-disorder**           | recurrent panic attacks + fear of the next + behavioural restriction          | `fear`(panic) + `anxiety` + `coping`                                           | Klein; Clark (catastrophic misinterpretation). `fear/process_panic.md`'s Echo names it                                            | proposed |
| 44  | **agoraphobia**              | fear/avoidance of situations where escape or help is hard to get              | `fear` + `anxiety` + `coping`                                                  | Goodwin & Guze; DSM-5 (decoupled from panic). **Merge-vs-split with #43 is a maintainer call**                                    | proposed |
| 45  | **hoarding**                 | difficulty discarding + saving urges + clutter/distress                       | `extended-self` + `scarcity` + `decision` + `coping`                           | Frost & Hartl; Frost & Steketee (_Stuff_); Mataix-Cols. **E-vs-C maintainer call**; do NOT route through `ocd` (DSM-5 split them) | proposed |
| 46  | **borderline**               | unstable relationships, affect, self, and impulse control                     | `attachment` + `regulation` + `identity` + `self-control` + `self-esteem`      | Linehan (biosocial/DBT); Kernberg (identity diffusion); Gunderson; Zanarini                                                       | proposed |
| 47  | **avoidant-personality**     | social inhibition, felt inadequacy, rejection hypersensitivity (Cluster C)    | `attachment`(fearful) + `self-esteem`(low) + `shame`(withdrawal) + `anxiety`   | Millon; Alden & Taylor; Rettew                                                                                                    | proposed |
| 48  | **antisocial**               | disregard for others' rights, deceit, no remorse, recklessness (Cluster B)    | `dark-triad`(psychopathy) + `aggression` + `deception` + `moral-disengagement` | Cleckley; Hare (PCL-R); DSM-5. `dark-triad` delegates the acts by name                                                            | proposed |
| 49  | **attention-deficit** (ADHD) | executive dysfunction + hot impulsivity + attentional variability + DMN drift | `executive-function` + `self-control` + `attention` + `mind-wandering`         | Barkley (EF/self-regulation); Sonuga-Barke (dual-pathway); Nigg (hot/cool); Castellanos & Proal                                   | proposed |

### Tier C3 — composites blocked on a Tier-C1 engine landing first (the ptsd→cptsd shape)

| #   | Candidate                              | Phenomenon                                                             | Atoms                                                                           | Note                                                                                                   | Blocked on |
| --- | -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| 50  | **depression** (MDE)                   | sad mood + anhedonia + neurovegetative + worthlessness, as a syndrome  | `sadness`(despair) + **anhedonia** + `rumination` + `self-esteem` + `body`      | Beck; Seligman; Nesse. Highest-value composite in the set — MDD is the most-requested clinical persona | #38        |
| 51  | **body-dysmorphic** (BDD)              | preoccupation with a perceived appearance flaw + checking/camouflaging | **ocd** + `self-esteem` + `identity`                                            | Phillips; Veale; Wilhelm. May need thin appearance-schema content even after atoms exist               | #37        |
| 52  | **bipolar**                            | cycling between depressive and manic/hypomanic episodes                | **mania** + **depression** (the #50 composite)                                  | Goodwin & Jamison. Two-level composite-of-composites (the `love-hate` precedent)                       | #39, #50   |
| 53  | **dissociative-identity** (DID)        | structural fragmentation of the personality with amnesic barriers      | **dissociation** + `identity` + `cptsd` + `memory`                              | Putnam; van der Hart et al.; Freyd. Three-level (over the `cptsd` composite) — verify hard-link depth  | #41        |
| 54  | **restrictive-eating** (anorexia-type) | ego-syntonic restriction driven by body-image distortion               | **body-image** + `self-control`(restraint) + `self-discrepancy` + `self-esteem` | Bruch; Fairburn (transdiagnostic); Stice                                                               | #42        |
| 55  | **binge-eating** (bulimia/BED-type)    | loss-of-control eating as emotion-focused escape                       | **body-image** + `regulation` + `self-control` + `body`                         | Fairburn; Stice (dual-pathway); Heatherton & Baumeister (escape theory)                                | #42        |

### Not gaps — already owned (recorded so they are not re-flagged)

- **narcissistic PD** → the existing `narcissism` engine (grandiose / vulnerable / communal / malignant, plus injury). A separate composite would restate it and fail `member-check`. No build.
- **GAD** → the `anxiety` engine (worry form + intolerance-of-uncertainty trait). No build.
- **specific phobia** → `fear`'s `phobia` form, written generically enough to read as the clinical entity. No build.

### Parked / maintainer's call

- **substance-use-disorder** — a possible composite (`addiction` + `self-control` + `coping` + `reward`) adding DSM's impaired-control layer over the already-thorough `addiction` engine (parallel to cptsd-over-ptsd), but optional since `addiction` is behaviour-agnostic and complete. Gambling/behavioural specifics (variable-ratio schedules, near-miss) are unmodelled — a possible `conditioning` extension, low priority.
- **autism spectrum** — deliberately parked, not charted for build. A DSM-deficit-only frame is an ethics problem for a neurotype; it needs new atoms first (a `sensory-processing` engine — Dunn; a `monotropism`/focused-interest engine — Murray, Lesser & Lawson) and framing against the double-empathy problem (Milton) and mindblindness (Baron-Cohen) as _competing_ warrants. A dedicated pass.
- **Cluster A PDs** (paranoid / schizoid / schizotypal) — thin atom coverage, low narrative payoff; low priority.
- **acute stress disorder / adjustment disorder** — the `ptsd` mechanism, or `stress` + `coping`, read within a duration window; a play-arc timing note, not new content.

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
before counting a gap. Inventory snapshot at analysis time: 163 engines, 20
composites (2026-07-30); Tier 3 (#20–#36) shipped 2026-07-31, adding 12 engines
and 5 composites (comic, love-hate, relative-deprivation, resilience,
post-traumatic-growth).

**Current inventory (2026-08-01): 199 engines, 28 composites.** Since the
analysis snapshot, the tiers above shipped and two further efforts landed: the
**Freud** effort (engines `structural-model`, `transference`, `the-unconscious`,
`ambivalence`, then the `freud` composite) and the opening of the **clinical
tier** (`ptsd` engine, `cptsd` composite). The clinical tier's full candidate
chart is pending a dedicated research pass and a management order (see the
"Clinical tier — opened" section above).
