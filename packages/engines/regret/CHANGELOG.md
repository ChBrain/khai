# @chbrain/khai-engine-regret

## 0.1.1

### Patch Changes

- 921fd7b: Add the regret engine: how a persona measures a choice they own against a better outcome they can readily imagine having, and wishes they had chosen otherwise -- the agency-plus-counterfactual emotion of decision. The root (`process_regret.md`) declares the two ingredients that set regret apart from a bare bad feeling: agency (a decision the persona owns) and a counterfactual (a better outcome near enough to imagine), the sting sharper the more mutable the outcome. Three forms carry it: `commission` (the action route -- the hot, immediate regret of a deed done, the abnormal act easily undone in imagination, dominant short-term), `inaction` (the omission route -- the wistful, enduring regret of a chance not seized, the unrealized possibility that never closes, dominant over a lifetime), and `anticipation` (the forward-looking route -- the imagined future regret of an option shaping the choice now, the decision bent to forestall a foreseen sting).

  A foundational decision-psychology gap. Bounded against disappointment (a bad outcome merely suffered, with no agency behind it -- not modeled as an engine here), `guilt` (a moral wrong done to another vs a suboptimal choice measured against its alternative), `grief` (the mourning of a lost attachment vs the counterfactual sting of a controllable choice), and `shame` (a global defect of the self exposed vs a verdict on a specific choice). No homonym gate: `regret` and the form stems `commission`/`inaction`/`anticipation` are all free (`omission`/`justification` were taken). Warranted (LORE) on Kahneman & Tversky (the simulation heuristic, 1982) and Kahneman & Miller (norm theory, 1986); Gilovich & Medvec (_The Experience of Regret_, Psych Review, 1995 -- the action/inaction temporal reversal); Roese & Summerville (what we regret most, 2005); and Zeelenberg with Pieters and Connolly (anticipated regret and regret regulation, 1999-2007). Set at patch as the free level; a new engine may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
  - @chbrain/khai-arch@0.1.23
