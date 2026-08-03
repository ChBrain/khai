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
- **Machinery** — `instructions`, `order`, `architecture`, `design`, `engines`:
  khai's own wiring, not force-targets.

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

| Candidate                  | Force on the place                                           | Warrant                                    | Confidence                                                      |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------- |
| **soundscape**             | the auditory field (keynote / signal / soundmark)            | Schafer; Truax; Augoyard & Torgue          | solid — unclaimed sensory channel                               |
| **weather**                | the transient atmospheric event bearing down today           | Ingold; Golinski; Harris (_Weatherland_)   | solid                                                           |
| **climate**                | the standing seasonal regime (vs weather's event)            | Köppen; Lamb; Hulme                        | solid                                                           |
| **geomorphology**          | the ground's sudden violence — quake / eruption / subsidence | Lyell; McPhee; Winchester                  | solid                                                           |
| **erosion**                | surfaces worn by wind / water / frost over time              | Hutton/Lyell; Strahler; Macfarlane         | solid                                                           |
| **hydrology**              | the water regime — flood / drought / water-table             | McPhee; M. Davis; Kelman                   | solid                                                           |
| **fire**                   | combustibility & burn regime, incl. suppression debt         | Pyne; Christensen; M. Davis                | solid                                                           |
| **succession**             | the biological reclaiming once human use withdraws           | Cowles; Clements; Gleason; Weisman         | solid                                                           |
| **decay**                  | material entropy — rust / rot / crumble                      | Simmel; Riegl; Trigg; DeSilvey             | solid                                                           |
| **dereliction**            | the built place an authority stopped maintaining             | Edensor; Ginsberg; Ruskin                  | maintainer-call (merge w/ decay?)                               |
| **gentrification**         | capital re-entry that displaces prior occupants              | Glass; N. Smith (rent-gap); Zukin          | solid                                                           |
| **restoration**            | deliberate intervention arresting decay                      | Ruskin vs Viollet-le-Duc; Riegl; Lowenthal | solid                                                           |
| **street-life**            | design that generates or kills pedestrian vitality           | Jacobs; Whyte; Gehl                        | solid                                                           |
| **legibility**             | how readable the layout is — the cognitive map               | Lynch; Passini; Golledge                   | solid                                                           |
| **defensible-space**       | design cues reading a place as claimed/claimable             | Newman; Jeffery (CPTED); Brantingham       | maintainer-call                                                 |
| **landscape-architecture** | designed terrain engineering a social program                | Olmsted; McHarg; J.B. Jackson              | maintainer-call                                                 |
| **ambiance** (Böhme)       | the felt, quasi-objective atmosphere of the ensemble         | Schmitz; Böhme; Griffero; Pallasmaa        | maintainer-call (stem/concept collides with `space` atmosphere) |

- **neighborhood-cycle** (composite, blocked): the churn of decline → capital
  re-entry / displacement → reclamation, over `dereliction` + `gentrification` +
  `restoration`.

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

| Candidate        | Force on / around the piece                               | Warrant                              | Confidence                |
| ---------------- | --------------------------------------------------------- | ------------------------------------ | ------------------------- |
| **biography**    | the object's career between commodity and singular status | Kopytoff; Appadurai; D. Miller       | high                      |
| **patina**       | the trace of time/use read as damage or age-value         | Riegl; Pye; DeSilvey                 | high                      |
| **sign-value**   | the coded status-meaning, and its fetish mystification    | Baudrillard; Marx; Veblen; McCracken | medium-high               |
| **obsolescence** | rendered out-of-date by a shifted standard, not decay     | Slade; Packard; Chapman              | medium (merge w/ patina?) |

**Design family** (what the object invites, form-intrinsic) — **five poles**, one
composite. The domain grew from two poles to five by the discovery loop: building
the `artifice` composite surfaced three missing engines (the physical pole, and the
two "bridges" that turned out to be their own phenomena). Each pole is the
**piece-pole (object side) of a science whose persona-pole is already built** —
deceptive-design ↔ `deception`, captology ↔ `persuasion`/`conditioning`, exactly as
`agency` ↔ personal-agency and `usability` ↔ `space`.

| Pole           | Candidate      | Force on / around the piece                                                                                                            | Warrant                                      | Chapter        | Confidence                |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------- | ------------------------- |
| **cognitive**  | **usability**  | how the form communicates and governs use: root over `grip`/`signifier`/`feedback`/`constraint`                                        | Gibson; Norman; Gaver; Krippendorff; Nielsen | `Apparent`     | **shipped** (#1058/#1059) |
| **political**  | **agency**     | the object as social delegate — prescribing/forbidding conduct (the speed bump that polices; the cap that enforces a program)          | Latour; Akrich; Winner; Gell                 | `Load Bearing` | **shipped** (#1060/#1061) |
| **physical**   | **ergonomics** | the object's physical fit to the body — anthropometric dimensions, reach, force, clearance, the handle sized to the hand               | Dreyfuss; Tilley; Woodson; Pheasant          | `Load Bearing` | high (build #1)           |
| **deceptive**  | **guile**      | the object designed to mislead for the maker's benefit — dark patterns; the lie is the intent, not a defect (vs usability's false cue) | Brignull; Gray et al.; Mathur et al.         | `Apparent`     | high (build #2)           |
| **behavioral** | **captology**  | the object designed to shape behavior / form habits — the engineered reinforcement loop, conditioning the user over time               | Fogg; Eyal; Thaler & Sunstein                | `Load Bearing` | high (build #3)           |

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

### Tier F-plan — forces on a plan-as-contested-object (6 engines)

Boundary held hard against the persona-side planning psychology already built
(`bias`'s planning-fallacy/sunk-cost/escalation, `decision`'s satisficing).

| Candidate        | Force on the plan                                   | Warrant                                    | Confidence                             |
| ---------------- | --------------------------------------------------- | ------------------------------------------ | -------------------------------------- |
| **counter-move** | an adversary's interdependent best-response         | Schelling; von Neumann & Morgenstern; Nash | high                                   |
| **fog-of-war**   | chance + incomplete info degrading execution        | Clausewitz (friction); Moltke; Boyd; Weick | high                                   |
| **deadline**     | an external clock compressing execution as it nears | Parkinson; Ariely & Wertenbroch            | high                                   |
| **logistics**    | the resource/supply base and its depletion rate     | van Creveld; Jomini; Goldratt              | high                                   |
| **obsolescence** | the plan overtaken by events (premises stale)       | Boyd (OODA); Clausewitz; Weick             | high                                   |
| **disruption**   | a discrete shock invalidating a named assumption    | Perrow; Chapman & Ward                     | maintainer-call (merge w/ fog-of-war?) |

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

| Candidate        | Force on the dynamic                                 | Chapter          | Warrant / residue                                                                                                                     | Confidence  |
| ---------------- | ---------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **momentum**     | resistance to changing state — lock-in or dead-start | Echo             | David; Arthur; Pierson. Residue after `scarcity/trap` + `escalation` (both domain-scoped spirals): the domain-neutral inertia itself. | high        |
| **interruption** | broken off mid-run, suspended with a resumption cost | Direction / Echo | Zeigarnik; Mark; Trafton & Monk. Residue: the general suspend-and-resume tax on a dynamic, whoever is interrupted.                    | high        |
| **phase-shift**  | crossing a threshold into a new regime (ignition)    | Initiated by     | Scheffer; Granovetter; Watts. Residue after `adoption` (diffusion S-curve) + `bias` (availability-cascade): the single regime-cross.  | medium-high |

**Six new, each verified against live members:**

| Candidate       | Force on the dynamic                                                                                            | Chapter          | Warrant (lineage)                                                                  | Boundary                                                                                                                           | Confidence  |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **drift**       | the baseline slides step by unremarked step until the process is somewhere no one chose — no decision, no event | Direction        | Vaughan (normalization of deviance) → Snook (practical drift) → Dekker → Rasmussen | `reversal/process_turn.md` **disclaims "a general deterioration or drift" by name**; not momentum (inertia) or phase-shift (event) | high        |
| **entrainment** | two dynamics couple until their rhythms phase-lock — content-neutral                                            | Lever            | Huygens → Kuramoto → Strogatz (_Sync_); McNeill (_Keeping Together in Time_)       | `contagion` owns affect-spread, `ritual/effervescence` collective energy; rhythm-locking is unclaimed                              | high        |
| **bottleneck**  | the whole pace set by the single slowest step; relieving anything else changes nothing                          | Lever            | Liebig (law of the minimum) → Goldratt (_The Goal_, ToC) → queueing theory         | `scarcity` is a persona's bandwidth tax, not a dynamic's throughput ceiling; the rigorous form of "tempo"                          | high        |
| **ratchet**     | a one-way catch — advances but cannot slip back; each gain locked before the next                               | Echo             | Duesenberry → Tomasello (cultural ratchet) → Scheffer (irreversibility)            | stem `hysteresis` is **taken** (`heritage`, Bourdieu); vs `momentum` = why it stays, ratchet = why it can't reverse                | medium-high |
| **punctuation** | long stasis alternating with brief bursts of change — the tempo of a whole run                                  | Echo / Direction | Eldredge & Gould → Tushman & Romanelli → Gersick (deep structure)                  | `phase-shift` is a _single_ crossing; this is the _alternation_ across the whole span                                              | medium-high |
| **oscillation** | a delayed balancing feedback makes it overshoot and swing back, cycling not settling                            | Direction / Echo | Forrester → Meadows (overshoot) → Minsky; Lotka–Volterra                           | `momentum` is one-way inertia; this is the cyclical correction with delay (absorbs the lag/delay question)                         | medium      |

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

| Candidate                            | Force on the plot/play                                         | Warrant                                       | Confidence  |
| ------------------------------------ | -------------------------------------------------------------- | --------------------------------------------- | ----------- |
| **anagnorisis**                      | the discovery-scene — false belief → evidence → the turn       | Aristotle; Cave (_Recognitions_)              | high        |
| **narrative-discourse**              | story-time vs discourse-time (order/duration/frequency)        | Genette (_Narrative Discourse_); Bal; Chatman | high        |
| **ticking-clock**                    | a depleting external time-window raising stakes                | Carroll; Zillmann (excitation-transfer)       | high        |
| **deus-ex-machina**                  | an external resolution the arc did not earn                    | Aristotle; Horace                             | high        |
| **double-plot**                      | a parallel strand mirroring/crossing the main one              | Empson; Bordwell & Thompson                   | high        |
| **chekhov-gun**                      | a planted element that becomes a later trigger                 | Chekhov; Barthes (_S/Z_); Sternberg           | medium-high |
| **hamartia**                         | the protagonist's own error that turns the action              | Aristotle                                     | medium      |
| **red-herring**                      | a planted false inference that misdirects                      | (mystery poetics)                             | medium      |
| **frame-narrative**                  | a telling nested inside another (diegetic levels)              | Genette; Bal                                  | medium      |
| **metatheatre**                      | the play acknowledging its own frame (stem: not "fourth-wall") | Abel; Hornby                                  | medium      |
| **macguffin** / **genre-convention** | (lower confidence / maintainer-call)                           | Hitchcock/Truffaut; genre theory              | low         |

### Tier F-persona — residual gaps (3; persona is otherwise saturated)

The persona audit confirmed extreme saturation (whole classes closed by design).
Only three narrow residues survived verification.

| Candidate                   | Phenomenon                                                                                    | Warrant                                            | Confidence                                            |
| --------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| **disinhibition**           | holding power itself shifts cognition (approach, less perspective-taking, objectification)    | Keltner, Gruenfeld & Anderson; Galinsky; Guinote   | high                                                  |
| **circadian-rhythm**        | daily clock oscillation in alertness (chronotype + desync), distinct from fatigue's depletion | Borbély (two-process); Horne & Östberg; Roenneberg | medium                                                |
| **life-review** (composite) | late-life reappraisal of the whole life story into integrity/despair                          | Butler; Erikson; Wong & Watt                       | medium — over `mortality` + `narrative` + `nostalgia` |

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

| Candidate                | Force on the office                                                              | Attaches        | Warrant                                                                | Confidence                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **institutionalization** | an ad-hoc task/function hardening into a standing office with its own mandate    | Has / Drives    | Selznick; Berger & Luckmann; Meyer & Rowan; Zucker                     | high                                                                                                                                                               |
| **routinization**        | a charismatic/founder role congealing into bureaucratic office, fiat → procedure | Orders / Has    | Weber (routinization of charisma); Eisenstadt; Trice & Beyer           | high                                                                                                                                                               |
| **hollowing**            | a live office decaying into a sinecure or figurehead — title kept, mandate gone  | Loses / Orders  | Bagehot (dignified vs efficient); Weber; Merton (ritualism)            | high — members `sinecure` / `figurehead`                                                                                                                           |
| **oligarchization**      | the office self-perpetuating — holding it displaces the mandate as the end       | Drives / Loses  | Michels (iron law); Merton (goal displacement); Selznick (co-optation) | high                                                                                                                                                               |
| **interregnum**          | the office destabilized at the transfer of incumbency — the vacancy crisis       | Loses / Has     | Gouldner (succession crisis); Grusky; Guest                            | medium-high — **name is `interregnum`, not `succession`** (that stem is F-place's ecological succession)                                                           |
| **capture**              | the office turned to serve a constituency other than its mandate                 | Orders / Drives | Stigler; Bernstein; Laffont & Tirole; Carpenter & Moss                 | medium-high — office-scoped stems (`process_office_capture`, not bare `captured` — collides with `attention`/`scarcity`); keep in-world, not real-world commentary |

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

| Candidate                        | Force                                                                           | Wires on                 | Warrant                                           | Verdict                                                                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **bathos**                       | a solemn register collapsing unintentionally into the trivial                   | `on: persona/Projection` | Pope (_Peri Bathous_, 1727)                       | **cleanest new build in the pass** — zero stem collision, clean warrant, holds against `comic`/`tragic` failure-states without touching them                                                                   |
| **modulation** (whole-key)       | the arc turning over from one named pitch to another                            | (`on: plot`)             | Genette (reaccentuation)                          | **no build** — already handled: a plot relinking _which_ pitch is cast, via `pitchCarryErrors`; do not re-litigate                                                                                             |
| **modulation** (within-plot)     | one plot's atmospheric baseline drifting scene-to-scene short of a whole recast | `on: plot/Cue`           | key-affect theory; Zillmann (excitation-transfer) | **loose thread** — a first-of-kind `plot/Cue` wiring (existing `on: plot` engines all target Action/Tension); reopens at a finer grain a question F-pitch had closed only at the coarse grain; maintainer call |
| **tonal-contract / -dissonance** | audience genre/register expectation met or broken                               | `on: persona/Projection` | Frow (_Genre_); Neale                             | **mostly no build** — `dramatic-irony` and `comic`/`tragic` flatness cover the enumerated cases; `dissonance` stem is taken (Festinger); a distinct general form is thin vs `surprise`                         |

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

| Candidate            | Force on the performance                                               | Attaches           | Warrant                                                        | Confidence                                                      |
| -------------------- | ---------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------- | --------------------------------------------------------------- |
| **canonization**     | a run becomes the definitive version later productions measure against | Note / Aftermath   | J. Assmann (cultural memory); Guillory; Kermode                | high                                                            |
| **reinterpretation** | a later age re-reads a fixed record against new values                 | Aftermath          | Jauss (reception); Hayden White; E. H. Carr                    | high                                                            |
| **revival**          | a dormant performance re-cast into a living production                 | Occasion           | Schechner (restored behavior); Taylor (_Archive & Repertoire_) | high                                                            |
| **supersession**     | a later run overtakes and demotes an earlier one                       | Aftermath / Note   | Carlson (_The Haunted Stage_, ghosting)                        | medium-high                                                     |
| **mythologization**  | a run accrues legend beyond what the ticket records                    | Note               | J. Assmann (mnemohistory); Halbwachs; Hobsbawm & Ranger        | medium-high                                                     |
| **decay**            | the record thins into history, its Note going unheard                  | Note / Lodged      | Phelan (_Unmarked_, disappearance); Nora (lieux de mémoire)    | medium                                                          |
| **contestation**     | rival records of the same evening — whose Aftermath is authoritative   | Aftermath / Lodged | Taylor; historiographical contestation                         | medium (or thin composite over reinterpretation + supersession) |

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

| Candidate                    | Phenomenon                                                                                    | Warrant                         | Note                                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| **reflected-appraisal**      | the looking-glass self — other people's gaze becoming a person's own inner voice              | Cooley (1902); Mearns; Sullivan | the distinct Cooley contribution the set is missing; `on: persona`                              |
| **impression-management**    | the dramaturgical front/back — why people stay on stage even at cost to themselves            | Goffman (1959)                  | consolidates the fragments `backstage` / `role` / `emotional-labor` hold; the unifying frame    |
| **developmental-plasticity** | the self as a phenotypically plastic system — change without betrayal of a stable disposition | West-Eberhard (2003); Bateson   | no foothold at all today; the biological warrant for change; stem to be checked vs `plasticity` |

No composite is proposed for this track (the essay reads them as a _movement_, but the
research proposed three engines plus the `self-efficacy` anchor, not a compound). This
is a **later, separate** effort — not queued behind the frontier, just not lost.

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
