---
khai: order
title: "Open the Clinical Tier"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-08-01"
---

# Order: Open the Clinical Tier

## Direction

The canon opens a **clinical tier**: engines and composites that model the
DSM/ICD disorders as **persona-architecture** -- the structure of a disordered
character, for a play -- distinct from the ordinary apparatus every persona has
that the rest of the inventory (and the `freud` composite explicitly) models. A
disorder is what gives a persona flavour: not a mood dial but a mechanic (a
self-maintaining loop) or a compound (a syndrome read over several capacities).

Two firsts prove the tier and set its shape:

- **`ptsd`** (engine) -- the trauma-loop over the four DSM-5 clusters. The first
  engine built to foreground **mechanics**: the root carries a self-maintaining
  cycle in its Direction and Lever, a pattern any khai-type may borrow when it
  needs a dynamic rather than a static stance.
- **`cptsd`** (composite) -- complex PTSD (ICD-11) over five atoms: core `ptsd`
  plus the capacities sustained trauma disturbs (`regulation`, `self-esteem`,
  `shame`, `attachment`). The first proof that a disorder is often best read as a
  **compound over existing engines**, not a fresh one.

This tier is the one room where a careless production reaches outside the
theatre. It opens under a standing invariant, not case by case: the safety
framing and the build heuristics below are **ordered once, for all of it**, so no
later clinical engine re-argues them.

## Orders

Every clinical-tier build obeys the following. They are the invariant this order
exists to set; the enumerated candidates are deferred to the chart (see
Implementation).

- **The safety invariant (non-negotiable).** A clinical engine is authored
  character-architecture for a play, **never a diagnosis of a real person**, and
  never a diagnostic or assessment instrument. The content says so in four
  places, every time: the Line of Work, the card (`enforce` and `setup`), the
  Playwright `System`, and a dedicated `Restrictions` entry. It sets no
  thresholds, durations, or differentials for a real person; the DSM/ICD criteria
  are used as the structure of a truthful character, not as a test. Diagnosis and
  treatment belong to clinicians. A clinical build missing this framing is not
  ready, whatever else passes.

- **Warrant is a lineage, not solo work.** The Origin table credits the
  diagnostic codification (DSM/ICD) **and** the construct's founders **and** those
  who built on and validated it -- as `ptsd` (Kardiner -> DSM -> Foa, Ehlers &
  Clark, Brewin, van der Kolk) and `cptsd` (Herman -> ICD-11 -> Cloitre) do.
  Never one author.

- **Composite over existing atoms, first.** Prefer a **composite** that reads the
  disorder as a compound over engines that already exist; mint a **new engine**
  only for a genuinely unowned single phenomenon with clean, unique stems.
  One-phenomenon-one-engine holds inside the tier as everywhere. Most syndromes
  (the personality disorders above all, and much of the mood and anxiety space)
  are composite-shaped -- cheaper to build and truer to the science, which reads
  them as disturbances of ordinary capacities.

- **Bound the disorder against its normal-range neighbour.** The tier models the
  disordered case; the ordinary faculty stays with its engine. Every clinical
  build delegates its normal-range neighbour explicitly (as `ptsd` hands the
  acute response to `stress`, mourning to `grief`, the faculties to `memory` and
  `body`). The disorder is the specifically-disordered reading, borrowed against
  the everyday engine, not a re-model of it.

- **Carry the mechanic where there is one.** Where the disorder is a loop or a
  cycle, stage the dynamic in the process chapters (Direction, Lever) as `ptsd`
  does -- the trap, the maintaining behaviour, the feedback -- rather than
  flattening it to a symptom list.

- **Same gates, same discipline.** Each engine or composite lands on its own
  guard-computed lane, its own PR, its own changeset; source and tests are
  separate PRs; the maintainer alone merges and labels any minor/major bump. The
  tier is built serially, one merged before the next, as the rest of the
  inventory is.

## Implementation

The tier's **candidate chart** lands in `docs/ENGINE-GAPS.md` under this order --
a Clinical-tier section listing each disorder family as engine-vs-composite
candidates, with its warrant lineage, its atoms (for composites) or members (for
engines), its normal-range boundary, and a confidence flag -- exactly as the
Tier tables already record the rest of the backlog. Execution is deferred to that
chart and to each candidate's own lane; **no build moves inside this order.**

The chart is populated by a **targeted research pass** (domain-expert agents
sweeping the DSM/ICD families -- mood, anxiety and OCD-related, dissociative,
personality, neurodevelopmental, feeding/eating, and addictive/behavioural
disorders -- each candidate verified against the live inventory so a disorder
already owned as a form of an existing engine is not counted as a gap). That pass
also audits the existing `addiction` engine and whether it warrants a composite
over it, parallel to `cptsd` over `ptsd`.

The maintainer approves the chart before build and labels every bump; the
Choregos revisits this order only if the tier's scope or invariant changes, not
per candidate. Each row then builds to the usual standard on its own lane.

## Targets

- [x] the clinical tier is named and opened, distinct from the ordinary apparatus
      the rest of the inventory models
- [x] the two proofs are recorded: `ptsd` (the mechanics engine) and `cptsd` (the
      compound-over-atoms composite)
- [x] the safety invariant is ordered once for the whole tier: authored
      persona-architecture, never a diagnosis, stated in four places every build
- [x] the warrant-is-a-lineage rule is carried into the tier
- [x] the composite-over-existing-atoms heuristic is ordered, with
      one-phenomenon-one-engine held inside the tier
- [x] the normal-range boundary rule and the carry-the-mechanic rule are recorded
- [ ] the candidate chart is authored into `docs/ENGINE-GAPS.md` from the research
      pass, approved by the maintainer, and each row deferred to its own lane
