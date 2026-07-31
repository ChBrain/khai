# @chbrain/khai-engine-self-monitoring

## 0.1.1

### Patch Changes

- ccb55fa: Add the self-monitoring engine: the persona's characteristic degree of watching and tuning its own self-presentation to fit the situation, versus letting it flow from a self held constant across situations. A `position`-type (trait) engine like `self-esteem`, its anchor (`position_self_monitoring.md`) declares Snyder's self-monitoring: high on the trait, the persona reads rooms and fits itself to them; low on it, the persona is one self everywhere, guided from within. Three positions carry the trait: `scanning` (the high-monitor's outward attention -- a sensitivity to social cues, reading the room for the presentation it rewards), `tuning` (the high-monitor's expressive control -- the skill and habit of adjusting the presented self to fit, the chameleon), and `consistency` (the low-monitor's inner direction -- a presentation flowing from one's own attitudes and feelings and held steady across situations).

  A clean personality gap from the audit, and khai's first new `position`-type engine of the session. The high pole is split into reading (`scanning`) and adjusting (`tuning`) per the Lennox & Wolfe two-factor structure. Bounded against `face` (the image the persona defends vs the trait of tailoring presentation), `emotional-labor` (the managing of feeling to meet a role's display for a wage vs the general dispositional tendency), `deception` (misleading for gain vs sanctioned situational fitting), and `identity` (the self-concept expressed vs how consistently it is expressed). No homonym gate: `self-monitoring` and the position stems `scanning`/`tuning`/`consistency` are all free (`reading`, `shifting`, `attunement`, `sensitivity`, `adjustment` were already taken). Warranted (LORE) on Snyder (self-monitoring of expressive behavior, 1974; _Public Appearances, Private Realities_, 1987), Lennox & Wolfe (the revised scale's two factors, 1984), Gangestad & Snyder (the appraisal-and-reappraisal review, 2000), and Snyder & Gangestad (the validity case, 1986). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
