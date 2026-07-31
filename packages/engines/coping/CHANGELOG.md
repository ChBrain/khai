# @chbrain/khai-engine-coping

## 0.1.1

### Patch Changes

- e9d3cca: Add the coping engine (process) -- the effortful, appraisal-driven repertoire a persona deploys against a stressor. The gap analysis (Tier-2 #17) found this homeless in the seam between `stress` (the involuntary autonomic routing) and `regulation` (emotion-timeline moves): neither models Lazarus & Folkman's transactional coping -- the deliberate handling of a demand appraised as taxing or exceeding one's resources.

  - **Root (process):** `coping` -- the effortful, appraisal-driven management of a stressor, transactional and dynamic.
  - **Forms (process):**
    - `appraisal` -- the sizing-up that launches and steers coping: primary appraisal of the stakes (harm/threat/challenge) and secondary of the options, updated as the encounter turns.
    - `problem` (Problem-Focused) -- acting on the stressor: planning, active steps, instrumental support, altering or removing the source, deployed where the stressor is appraised as changeable.
    - `escape` (avoidant coping) -- distraction, denial, and behavioral/mental disengagement, relieving now and, sustained, leaving the demand to grow.

  **Scope note -- emotion-focused coping stays with `regulation`.** Per the chase-list boundary, the emotion-directed function of coping (soothing, reframing, expressing, or suppressing the feeling) is the `regulation` engine's domain (Gross's situation selection / reappraisal / suppression). This engine owns only the appraisal and the two _stressor-directed_ families (problem-focused and avoidant), and delegates emotion-focused coping to `regulation` and meaning-focused coping (Folkman 2008) to `meaning` -- one phenomenon, one engine. In particular, coping's cognitive _appraisal_ (sizing up the stressor and one's options) is kept distinct from regulation's _reappraisal_ (reframing the emotional meaning of a situation).

  Warranted (LORE) on Lazarus & Folkman (1984, the transactional model and appraisal), Carver/Scheier/Weintraub (1989, the COPE inventory and the avoidant family), Folkman (2008, meaning-focused coping -- delegated), and Folkman & Lazarus (1985, coping as a changing process). Bounded against `stress` (the reflex vs the effortful response), `regulation` (emotion-focused coping), `meaning` (meaning-focused coping), and `grit` (the long goal-pursuit vs the response to a present demand). Set at patch as the free level. No whitelist required -- the `coping`/`appraisal`/`problem`/`escape` stems are unique (`avoidance`/`disengagement`/`planning` were avoided as owned by goal/moral-disengagement/executive-function).

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
