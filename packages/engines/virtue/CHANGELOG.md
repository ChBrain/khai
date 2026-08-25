# @chbrain/khai-engine-virtue

## 0.2.0

### Minor Changes

- b0c3698: Name every pole by its register: the seven sins become `position_vice_*` and
  the seven answering virtues `position_virtue_*`. Three of the fourteen
  (`envy`, `pride`, `gratitude`) collided with the emotion engines that own those
  words and were the reason for the pass; the other eleven follow for symmetry, so
  the file names carry the classification the engine's own REFERENCES already
  documents. Member files are API and renaming one is breaking, hence minor;
  nothing outside the engine linked any of the fourteen.

## 0.1.1

### Patch Changes

- 6841142: engine: lift the virtue position/process engine from Cultures. Virtue as the active firing under pressure -- a process anchor (the firing) and fourteen pole positions across seven sin/virtue axes: pride/humility, wrath/patience, greed/generosity, gluttony/temperance, envy/gratitude, lust/chastity, sloth/diligence. The harder pole is the active practice, the easier the depleted default; the room reads the move through behaviour and the engine never names it (the behaviour-as-evidence rule). Grounded in Aristotle (the active mean), Baumeister (ego depletion), Haidt (intuition first), and MacIntyre. The first mixed-type engine (process root + position leaves).
- 6841142: Add the Playwright wiring guide to the virtue engine: a `khai: instructions`
  HACKS file explaining the engine's model so an LLM Playwright wires it from
  understanding. Virtue is the active moral firing under pressure, seven sin/virtue
  axes read by the room through behaviour and never named; anchored on process, a
  persona links under Projection the pole it just fired, the firing read at the
  beat of pressure across the plots. The engine files stay untouched; the Roadie
  plumbs the law into Knowledge.
