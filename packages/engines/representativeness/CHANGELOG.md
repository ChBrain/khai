# @chbrain/khai-engine-representativeness

## 0.1.1

### Patch Changes

- 5478b69: Add the representativeness engine: the judgment process through which a persona reads the probability that a thing belongs to a category or came from a process off how much it resembles the prototype -- and lets that likeness override the base rates, sample sizes, and reliability that should govern. The root (`process_representativeness.md`) declares Kahneman & Tversky's representativeness heuristic -- the third and last of the three original heuristics of judgment under uncertainty, sister to `availability` and `anchoring` -- similarity to the type substituted for the odds of the type. Three forms carry it: `priors` (base-rate neglect -- a case judged by fit to the stereotype with the prior probability set aside, so a rare type is read from a fitting description however rare it is), `conjunction` (the conjunction fallacy -- a specific, prototype-fitting story judged likelier than the broader class that contains it, the Linda problem, resemblance rising as probability falls), and `randomness` (the misconception of chance -- a random process expected to look prototypically random, so streaks are read as loaded and small samples trusted to mirror the whole, the gambler's fallacy and the law of small numbers).

  Cleared the member-scope gate via the `representativeness` homonym whitelist (governance PR #909), mirroring `anchoring`: `bias` carries a bare `position_representativeness.md`, and a codex entry at the `position` altitude does not preempt the full `process` engine of the same phenomenon. The third form is `randomness` rather than `chance` because `attribution` already owns `process_chance.md`. Bounded against `availability` (ease-of-recall vs resemblance-to-prototype), `anchoring` (reference-pull vs resemblance), `decision` (the mode of choosing vs the probability judgment), and `bias`/`stigma` (the fixed social stereotype and the static tilt vs the live resemblance-for-probability read). Warranted (LORE) on Kahneman & Tversky (_Subjective Probability_, 1972; _On the Psychology of Prediction_, 1973), Tversky & Kahneman (_Judgment under Uncertainty_, 1974; _Belief in the Law of Small Numbers_, 1971; _Extensional versus Intuitive Reasoning_ / the conjunction fallacy, 1983). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
