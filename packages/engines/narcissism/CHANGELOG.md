# @chbrain/khai-engine-narcissism

## 0.2.0

### Minor Changes

- 369749d: Take the field's own compound terms on the three members that collided:
  `process_admiration` → `process_narcissistic_admiration`, `process_rivalry` →
  `process_narcissistic_rivalry`, `position_communal` →
  `position_communal_narcissism`. Frees `admiration`, `rivalry` and `communal` for
  the engines that own them. Member files are API and renaming one is breaking,
  hence minor.

## 0.1.1

### Patch Changes

- adb2bca: Add the narcissism engine -- a first-of-its-kind multi-type engine spanning position, plan, and process. Narcissism is the entitled self-importance a persona must continually defend: an inflated self held past what reality will confirm, so the whole disposition is organised around maintaining the grandiose self-image. The engine fans that core into three altitudes: the type the persona is (position), the aim that type pursues (plan), and the self-regulation every type runs to hold the inflated self up (process).

  - **Types (position):** `grandiose` (overt dominance and display), `vulnerable` (covert hypersensitivity and shame), `communal` (grandiosity won through being the most caring/moral -- Gebauer), and `malignant` (grandiosity fused with antagonism, sadism, and paranoia -- Kernberg).
  - **Aims (plan, on a persona owner):** each type parents its scheme -- `dominance` (be admired/superior), `safety` (avoid exposure, extract reassurance), `glory` (be the most virtuous), `conquest` (subjugate and destroy threats).
  - **Self-regulation (process, shared):** `admiration` (assertive self-promotion), `rivalry` (antagonistic self-defence), `injury` (the narcissistic wound and the rage or collapse it triggers) -- the NARC routes plus the fragile core.

  Promotes narcissism from the single `dark-triad/position_narcissism.md` node to a standalone engine (via the `narcissism` homonym whitelist), keeping dark-triad a balanced comparative triad while narcissism gets its own depth. A position root fans into position/plan/process members three levels deep; each validates against its own khai chapters. Bounded against `dark-triad` (narcissism as one corner of the aversive triad vs its internal structure), `self-esteem` (the resting global self-attitude vs the defence of an inflated, contingent one), `pride` (hubristic pride as a component, not the syndrome), and `empathy`/`aggression` (the faculties vs their recruitment in the defence). Warranted (LORE) on Morf & Rhodewalt (the dynamic self-regulatory model, 2001), Back et al. (the NARC admiration/rivalry model, 2013), Krizan & Herlache (the narcissism spectrum, 2018), Gebauer et al. (communal narcissism, 2012), Kernberg (malignant narcissism, 1984), and Pincus & Lukowitsky (pathological narcissism and injury, 2010). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
