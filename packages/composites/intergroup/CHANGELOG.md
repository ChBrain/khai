# @chbrain/khai-composite-intergroup

## 0.1.2

### Patch Changes

- Updated dependencies [9867f1f]
  - @chbrain/khai-engine-bias@0.2.0

## 0.1.1

### Patch Changes

- 26e8987: Add the intergroup composite: the us/them relation between groups, read from a member's side -- how belonging to one group shapes the stance toward another, from a mere lean to open hostility, and how it can be undone. It is not a new engine but a wiring of three: `social-identity` supplies the in-group belonging and the contest for standing, `bias` supplies the tilt toward the out-group (favouritism, prejudice, stereotyping, out-group homogeneity), and `aggression` supplies the hostile harm. The root (`process_intergroup.md`) reads the dynamic the three make; three bridges are its course: `division` (the line drawn -- even arbitrary -- switches on the tilt, the in-group favoured and the out-group prejudged before a single interaction: the minimal-group floor, that to sort is to bias), `enmity` (under competition or felt threat the tilt hardens into hostile, instrumental, or displaced aggression -- the out-group cast rival, opposed, harmed, or scapegoated), and `contact` (meeting under equal, cooperative terms toward a superordinate goal recategorizes them-and-us into a larger we and reduces the tilt -- or, on the wrong terms, confirms it).

  khai's first composite over a between-groups relation, kept castable by anchoring in a member's experience; the outward counterpart to `membership` (which reads the member's bind to their own in-group). The intergroup domain does not warrant its own engine -- prejudice, stereotyping, in-group bias, and out-group homogeneity are already owned by `bias`, and the us/them contest by `social-identity`'s competition stance -- so this composite strictly wires those owned pieces rather than restating them. Bounded against `membership` (the bind to the in-group vs the stance toward the out-group) and `escalation` (the general conflict-spiral vs the group-specific relation). Warranted (LORE) on Tajfel & Turner (social identity and the minimal group paradigm), Sherif (realistic conflict and superordinate goals), Allport (the nature of prejudice and the contact hypothesis), Stephan & Stephan (integrated threat theory), and Pettigrew & Tropp (the meta-analytic confirmation of contact). Set at patch as the free level; a new composite may warrant a minor at the maintainer's `bump:minor` label.

- Updated dependencies [5a6714e]
- Updated dependencies [3c5945c]
- Updated dependencies [e4f8e46]
  - @chbrain/khai-arch@0.1.23
  - @chbrain/khai-engine-social-identity@0.1.1
