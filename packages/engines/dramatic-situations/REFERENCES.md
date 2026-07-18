---
updated: "2026-07-17"
---

# Dramatic Situations: Reference

## Line of Work

Dramatic situations as **plot**: Georges Polti's claim that every dramatic
collision -- however it is dressed in character, century, or culture -- is
one of a bounded set of recurring shapes. The domain does not author the
specific characters, the setting, or the moral verdict a plot lands on (those
are the production's); it names the collision shape itself: a protagonist, an
opposing force, and a contested object or stake, cast in Polti's own role
vocabulary.

The spine is Polti's taxonomy: an exhaustive catalogue of dramatic situations,
each with its own named roles and its own account of what makes the Action
unable to resolve cleanly. Dramatic Situation names the anchor shape; the
member situations name a representative spread of Polti's own 36.

## Origin

Georges Polti's taxonomy of dramatic situations, itself descended from a
claim Polti credits to Gozzi by way of Goethe and Schiller's correspondence.

| Source                 | Key Work                                                                                               | Scope                                                                                               |
| :--------------------- | :----------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Georges Polti**      | _The Thirty-Six Dramatic Situations_ (_Les Trente-six situations dramatiques_, 1895; Eng. trans. 1916) | The exhaustive taxonomy of dramatic situations and their role-sets: the source this engine encodes. |
| **Carlo Gozzi**        | (via Goethe's and Schiller's report of his claim)                                                      | The original claim of 36 tragic situations -- the source Polti credits as his starting point.       |
| **Friedrich Schiller** | Correspondence with Goethe attempting to enumerate the situations                                      | The antecedent attempt Polti extends and systematizes into the full taxonomy.                       |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **The full 36**: The engine ships the anchor and a representative spread of
  six exemplar situations (supplication, revenge, pursuit, rivalry,
  self-sacrifice, disaster), not all 36. The remaining situations are
  compositions the consuming production selects from Polti's own catalogue,
  cast to the production's own vectors rather than carried here as inert
  files.
- **The specific characters**: The engine names roles (Avenger, Criminal,
  Fugitive, Superior Rival) as slots in a collision shape, not persons. Which
  persona fills a role, and what that persona is like beyond the role, is the
  production's.
- **The cultural skin**: Which stakes a culture treats as worth an Avenger's
  pursuit, or a Hero's sacrifice, is the consuming culture's to set. The
  engine ships the universal shape; the culture supplies what fills it.
- **The moral verdict**: Whether the Avenger was right to pursue, whether the
  Power should have granted shelter, whether the Hero's Faith deserved the
  cost, is never settled by the situation itself. The engine names the
  collision; the verdict is delegated to the telling.

## Encoding

Source to constraint. A plot anchor (the situation as such) with six
exemplar plots, each a distinct collision shape in Polti's own role
vocabulary.

- **[Dramatic Situation](plot_dramatic_situation.md)** (the anchor): the
  situation as such -- a finite pattern of forces a plot instantiates: a
  protagonist, an opposing force, a contested stake. Anchored by Polti's
  thesis that the set is bounded.
- **[Supplication](plot_supplication.md)**: a Persecutor pursues, a
  Supplicant begs a Power in authority who hesitates. Polti, Situation I.
- **[Revenge](plot_revenge.md)**: an Avenger pursues a Criminal for a wrong
  done. Polti, Situation III (Crime Pursued by Vengeance).
- **[Pursuit](plot_pursuit.md)**: a Fugitive flees a Punishment, justified or
  not, that hunts them. Polti, Situation V (Pursuit).
- **[Rivalry](plot_rivalry.md)**: a Superior Rival and an Inferior Rival
  contend for a coveted Object, unequal in power. Polti, Situation XXIV
  (Rivalry of Superior and Inferior).
- **[Self-Sacrifice](plot_self_sacrifice.md)**: a Hero gives up all -- life,
  love, safety -- for a Faith or cause. Polti, Situation XX (Self-Sacrificing
  for an Ideal).
- **[Disaster](plot_disaster.md)**: the sudden fall of the powerful -- a
  Vanquished Power, a Victorious Enemy, a fortune overturned. Polti,
  Situation VI (Disaster).
