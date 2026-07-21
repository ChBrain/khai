<!-- The boundary ruling (order 4 of "Computed, Harnessed, Instructed"). What is -->
<!-- global and what is local, decided by where a thing can live without -->
<!-- drifting, not by taste. Governed under the governance lane, like BRANCHING.md -->
<!-- and CLAUDE.md, because a boundary ruling is policy: this doc obeys the rule it -->
<!-- states. -->

# The Boundary: Global and Local

What is **global** travels unchanged and is computed so it cannot drift between
houses; what is **local** is the house's own hole, declared in the house's source
and never in the mechanism. The line between them is decided by where a thing can
live without drifting, not by taste, and it is a moving frontier, not a one-time
sort. This is the single place that ruling lives.

## The ladder it rests on

Every check sits on one ladder, read both ways (see the model note atop
`packages/khai-review/index.mjs`):

- **Up, escalation, per case:** `code -> ai -> human`. What the deterministic
  gates cannot settle is judged by the harness; what the harness cannot settle
  escalates to a person.
- **Down, consolidation, over time:** `human -> ai -> code`. A judgement that
  recurs and crisps up becomes a rubric; once crisp enough to be mechanical, a
  wall.

The boundary is where the frontier stands **now**. It moves down as things crisp
up, so nothing here is fixed: a rubric is a check on its way down, not a permanent
home.

## Global: the mechanism, one copy, every house identical

Carried in the shared packages and the `khai-stage` blueprint, computed so it
cannot drift:

- **The walls and their atoms** (`khai-rules`, `khai-tests`): the conformance kit
  and every gate in it (collision, warrant-row well-formedness, the play-level
  orphan, and all the rest). A wall is provider-proof because there is no model in
  it.
- **The review harness mechanism** (`khai-review`): the robustness wrapper
  (`reviewRobust`: N-of-K consensus, the refute-by-default skeptic, source
  anchoring), the position-to-rubric resolver (`resolvePositionRubrics`), the
  composition (`reviewHouse`), the voice-resolution mechanism (`resolveVoice`,
  `buildVoiceRubric`), and the ledger (`collect`, `reconcile`).
- **The gating and escalation policy:** the walls gate; the harness never gates,
  it advises and escalates to a person. This policy is the same in every house.
- **The three methods** (`khai-methods`, `khai-skills`): the shared craft
  guidance, loaded by every agent. Guidance, with the walls beneath as backstop.

## Local: the house's hole, declared in its source

Never in the mechanism; each house's own:

- **The voice itself**, at each level of the chain: the house README, the play,
  the element. The words, resolved by the global mechanism but written locally.
- **What the house checks for:** its **rubric set**, resolved from the positions
  its management team casts. There is no universal rubric set; a house that casts
  three positions checks three things, one that casts ten checks ten, and a
  different house rightfully chases different criteria.
- **The rubric thresholds** (the consensus `n` and `k`, whether a skeptic runs)
  and any opt-in rubric beyond what the team's positions yield.
- **The escalation chain:** who rises to whom (the Roadie to the Choregos, the
  Choregos to the human). The mechanism carries a finding to its next rung; the
  chain that names the rungs is the house's local config.
- **The canon and content** of the house.

## The classification rule, computed not argued

For any future check, ask three questions in order:

1. Is it canon-agnostic, universally true, and cheap to decide? Then it is a
   **global wall** (the `code` rung). Land it in `khai-rules` and `khai-tests`.
2. Does it need meaning to decide? Then it is a **global harness rubric with a
   local voice and threshold** (the `ai` rung). It runs in `khai-review`, never
   gates, and escalates.
3. Is it only this house's taste? Then it is **local guidance** (the `human`
   rung), written in a method, not enforced.

Default a candidate to the highest rung it will reach and push it down over time;
demote it up the moment a real case will not settle at its rung. The rule is a
standing process, not a fixed line.

## Voice is the model case

The mechanism that resolves and enforces voice is global; the words it enforces
are local. Everything in the Local list follows this same shape: a global
mechanism reading a locally declared value. If a new thing does not fit that
shape, it is either a wall (no local value to read) or it does not belong in the
mechanism at all.

## Where this corrects the order's first draft

The order named this boundary before the work settled it. Four things landed
differently, and this ruling is the reconciliation:

1. **No universal rubric set.** The order's draft placed "the harness and its
   universal rubric set" in Global. The harness **mechanism** is global; the
   rubric **set is local**, resolved from each house's positions.
2. **The cut-to-fit floor is local guidance, not a wall.** "At least three
   personas, at least one plot per beat" is no hard rule: the number is the
   house's (some three, some ten), so it is authoring taste (the `human` rung),
   not a computed gate. The `docs/COMPUTED-TIER-AUDIT.md` first draft that called
   the floors a wall is superseded here.
3. **The escalation chain is local config.** The order's draft placed the whole
   escalation policy in Global. The **policy** (advise, never gate, escalate) is
   global; the **chain** that names who rises to whom is the house's local
   config.
4. **The frontier moves.** The boundary is not ruled once and frozen; the ladder
   runs both ways, so the classification rule above is a standing process the
   house re-applies as checks crisp up or slip back.
