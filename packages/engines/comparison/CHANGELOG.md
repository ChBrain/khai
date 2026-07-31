# @chbrain/khai-engine-comparison

## 0.1.1

### Patch Changes

- a8fc0a7: Add the comparison engine: how a persona evaluates their own opinions and abilities by measuring against others, so the self is known relative to others rather than in the absolute. The root (`process_comparison.md`) declares Festinger's theory of social comparison: a drive to self-evaluate that, absent objective standards, turns to other people as the yardstick, so what a persona judges themselves to be is read off the gap between themselves and those they compare with. Three forms carry it: `upward` (comparison with the better-off -- double-edged as a spur to improve or a wound to the self, turning on whether the higher mark seems attainable), `downward` (comparison with the worse-off -- self-enhancement by contrast, a defense recruited most under threat), and `similar` (the target-selection principle -- a persona compares most tellingly with those like themselves, because only a like other yields a diagnostic read).

  Promotes social comparison from a single `bias/position_social_comparison.md` entry to a full process engine -- the same move made for `dissonance`, `anchoring`, `availability`, and `representativeness`. Bounded against `envy` (the pain at another's superiority that upward comparison may feed vs the appraisal itself), `status` (the rank that results vs the act of measuring), `self-esteem` (the settled global self-attitude vs one comparison feeding it), and `bias` (the static catalog of comparison tilts vs the measuring process). No homonym gate: the root stem `comparison` and the form stems `upward`/`downward`/`similar` are all free (the bias member's stem is `social_comparison`). Warranted (LORE) on Festinger ("A Theory of Social Comparison Processes", Human Relations, 1954), Wills (downward comparison principles, 1981), Wheeler (upward comparison), Suls, Martin & Wheeler (the modern synthesis, 2002), and Tesser (self-evaluation maintenance, 1988). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
