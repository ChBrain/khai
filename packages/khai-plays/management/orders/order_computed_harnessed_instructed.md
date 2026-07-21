---
khai: order
title: "Computed, Harnessed, Instructed"
license: CC-BY-NC-SA-4.0
stamp:
  owner: KAI HACKS AI
  version: v0.0.1
  date: "2026-07-21"
---

# Order: Computed, Harnessed, Instructed

## Direction

The house already computes the lane. `khai-guard branch` reads the diff, the
pre-push hook obeys, the required CI check is the wall, and no model, strong or
weak, talks its way past it. That doctrine, **computed, not judged**, is why the
branch scope survives a change of model or provider: the rigour lives in the
repository, not in the judgement of whoever is driving.

This order extends the same doctrine from the branch to the **craft**: the
authoring and review discipline that decides whether a play is warranted,
wired, cut to fit, and true to its source, and which until now has lived in the
operator's head and varied with the model behind it. The craft is where a house
is still hostage to which LLM it happens to run. It need not be.

The craft resolves into three tiers, ordered by how model-proof each can be
made. The rule of placement is the whole point: push every move as far up this
list as it will go, because the higher a move sits, the less it depends on the
model at all.

- **Computed** (a wall). What is canon-agnostic, universally true, and cheap to
  decide is a pure-code check that **gates**: `khai-rules` atoms composed into the
  `khai-tests` conformance kit, run in the hook and the required CI check. A wall
  is model-proof by construction, because there is no model in it. Any provider
  bounces off it identically.
- **Harnessed** (a judge). What only meaning can decide, and so cannot be walled,
  is given to `khai-review`: a pluggable judge that **never gates** but is held
  rigorous by its scaffold, not by the model in the slot. The scaffold owns the
  rubric, the schema, and the verdict rule; the model is injected and swappable.
  This is the tier that makes "regardless of provider" true for judgement: a
  weaker model in the same scaffold still has its own errors surfaced.
- **Instructed** (a method). What remains is taste, and taste is written down as a
  shared method every agent loads, `khai-methods` and `khai-skills`, with the
  walls beneath it as the backstop, so a model that ignores the method is still
  caught by the gate.

The architecture already embodies this split: `khai-rules` is the pure mechanism,
`khai-tests` is the conformance kit that gates, `khai-review` is the injected
judge that "never gates" and escalates structural then semantic then human, and
`khai-stage` raises every house from one blueprint "computed here so it cannot
drift between houses". What is missing is not the shape but its **completion**:
the craft this order names exercises dimensions the tiers do not yet cover, the
global-versus-local boundary has never been ruled in one place, and no rollout
carries the completed doctrine to every house at once. This order supplies all
three.

The honest bound: the walls guarantee correctness and the harness guarantees
that errors are surfaced, across any provider. Neither makes a weak model write
like a strong one. The aim is not to remove judgement but to **stop depending on
it** for what can be walled or harnessed, so that changing provider is safe
rather than a quality cliff.

## Orders

**1. Compute what can be walled.** Audit the current `khai-tests` conformance
coverage (it already resolves links, catches collisions, dangling references, and
drift). Add, as `khai-rules` atoms gated by the kit, every remaining check the
craft performs by hand that is canon-agnostic and deterministic. At minimum, and
only where not already gated:

- **completeness**: every element a play lists in its Company resolves, every
  required section and reciprocal link is present, and the Company matches the
  files on disk (no billed-but-missing, no present-but-unlisted).
- **collision**: no two elements across kinds share a display title, and a
  whole-phenomenon piece does not silently reuse the play title.
- **cut-to-fit floor**: at least three personas, at least one plot per beat, no
  element that carries no vector.
- **shape of the warrant**: every Origin row is well-formed, every Encoding piece
  resolves, every scholar name parses (the deterministic `surnames()` invariant,
  generalised).
- **field bounds**: the play `description` within its cap, and the deterministic
  slice of voice that needs no model, the dash ban and the spelling register,
  lifted out of the judged rubric into a lint that gates.
- **changeset correctness**: the bump matches the change class (a new unit is a
  minor, a content fix a patch, a tooling or docs change an empty), reconciled
  against the computed count.

A check that can be computed must not be left to a judge: a wall is cheaper,
faster, and provider-proof, and it frees the judge for what only it can do.

**2. Harness what only meaning can decide.** Keep `khai-review`'s design, the
rubric-as-data and the injected judge, and extend it along two axes.

- **New rubrics** for the meaning-judgements the craft makes and the kit cannot:
  `citation-fidelity` (does the staging match what the cited source actually
  found, not merely name it), `distinctness` (does this unit collapse into a
  sibling, checked against the house-wide concordance by canonical name),
  `no-villain` (does the trap run on rational response, or does it smuggle in a
  bad actor), and `load-bearing` (is each named element a distinct vector or
  filler). Each is data, added the way `voice-conformance` was.
- **A robustness wrapper** so the verdict does not ride on one sample of one
  model. A rubric is run as **N independent judgements**, a finding is confirmed
  only on a declared consensus (K of N) or when a skeptic pass, told to refute by
  default, fails to refute it, and any rubric that asserts a fact, above all
  `citation-fidelity`, must **anchor to a retrieved source** and may not
  self-certify from the model's memory. The consensus threshold, the skeptic, and
  the anchoring live in the harness. This is the difference between one model's
  opinion and a finding that survives adversarial agreement, and it is what holds
  when the model in the slot is changed.

The judge still never gates: it escalates to the human, and the treatment is the
conversation, exactly as the review architecture already prescribes.

**3. Instruct the rest.** Promote the three methods the craft runs to shared,
provider-neutral docs under `khai-methods` and `khai-skills`, so every agent in
every house loads the same craft: the **authoring** method (cut to fit, one
element per load-bearing vector), the **review** method (the multi-lens
adversarial pass, one rubric per lens, synthesised on consensus), and the
**fix** method (apply only confirmed findings, weigh a lone finding against
precedent, re-run the walls). The method is guidance; the wall is the backstop.

**4. Rule the boundary, once.** What is global and what is local is decided by
where a thing can live without drifting, not by taste:

- **Global**, carried in the blueprint and the shared packages, computed so it
  cannot drift between houses: the conformance walls and their atoms, the review
  harness and its universal rubric set, the three methods, the gating and
  escalation policy, and the voice override-chain **mechanism**.
- **Local**, the house's own hole, declared in its source and never in the
  mechanism: the **voice** itself at each level of the chain (house README, play,
  element), the house's **rubric thresholds** and any **opt-in rubric** beyond
  the universal set, and the canon and content of the house. Voice is the model
  case: the mechanism that resolves and enforces it is global, the words it
  enforces are local.
- **The classification rule**, computed not argued, for any future check: if it
  is canon-agnostic, universally true, and cheap, it is a global wall; if it
  needs meaning, it is a global harness rubric with a local voice and threshold;
  if it is only this house's taste, it is local. When a house wants a wall the
  others do not, it declares it as a local rubric or config, never by forking the
  mechanism.

**5. Roll it to every house.** Land the global tiers in the shared packages under
their own lanes, seed them into the `khai-stage` blueprint, then carry them to the
houses on the tour, house by house. Each house adopts by taking the blueprint
update and ratifying its local declarations (its voice chain, its thresholds); no
house is forced to fork the mechanism to keep its taste. The rollout is staged,
not flash-cut, and its execution is deferred to its own lanes under the
maintainer's go.

## Implementation

The packages and lanes each tier lands in, and the path to every house.

- **Walls** land in `packages/khai-rules` (the atoms) and `packages/khai-tests`
  (the conformance kit and its drift gates), ride the `arch/` and `governance/`
  lanes, and are enforced by the pre-push hook and the required CI checks the
  guard already runs.
- **Harness** lands in `packages/khai-review` (rubrics as data, the consensus and
  skeptic wrapper, the source-anchoring seam for factual rubrics), ride the
  `governance/` lane. The judge stays injected, so the harness is tested without a
  model and the provider is a configuration line.
- **Methods** land in `packages/khai-methods` and `packages/khai-skills`, ride the
  `methods/` and `skills/` lanes, and are recorded in `docs/METHODS.md` and
  `docs/SKILLS.md`.
- **The seed** is `packages/khai-stage/blueprint`: the config, the `.github`
  workflows and hook, the `audit` rubric set, and the management methods are
  updated there so that every house raised or re-raised from the blueprint
  inherits the completed tiers by construction, the blueprint being the single
  computed source that cannot drift between houses.
- **The propagation** is the tour: `khai-stage` re-raises and `khai-tour` stages
  the blueprint update to each house's venue, house by house, tiered, each house
  ratifying its local hole on adoption.

The staged sequence, worked from the top by whoever takes this order: audit and
close the wall gaps first (they gate immediately and protect every house that
bumps the dependency); add the harness rubrics and the consensus-skeptic-anchor
wrapper second; write the three shared methods third; seed all of it into the
blueprint fourth; tour it to the houses last, tier by tier and house by house.

## Targets

- [x] the doctrine is recorded: the craft is placed in three tiers, computed then
      harnessed then instructed, with the rule to push every move as far up as it
      goes, and the honest bound that walls and harness raise the floor and catch
      regressions but do not make a weak model write like a strong one
- [x] the tiers are mapped to the existing architecture, `khai-rules` and
      `khai-tests` for the walls, `khai-review` for the injected judge that never
      gates, `khai-methods` and `khai-skills` for the method, and the completion
      gaps in each tier are enumerated
- [x] the global-versus-local boundary is ruled in one place, with a computed
      classification rule for every future check and voice named as the case where
      the mechanism is global and the words are local
- [x] the rollout is staged through the blueprint and the tour, house by house,
      each house ratifying its local hole and none forced to fork the mechanism
- [x] all execution is deferred to its own lanes under the maintainer's go: the
      wall atoms and kit, the review rubrics and wrapper, the shared methods, the
      blueprint seed, and the tour, each a self-contained PR whoever takes this
      order rolls in the sequence above
