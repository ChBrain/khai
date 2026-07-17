---
updated: "2026-07-16"
---

# Locus of Control: Reference

## Line of Work

Locus of control as **position**: a generalized expectancy about where control
over reinforcement lies, held before any single outcome is read. The domain
does not model one attribution about one event; it models the standing frame
a persona brings to every event, which then shapes how that event gets read.

## Origin

Social learning theory's account of generalized expectancy, applied directly
as code constraints.

| Source               | Key Work                                                                                  | Scope                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Julian Rotter**    | _"Generalized Expectancies for Internal versus External Control of Reinforcement"_ (1966) | The internal/external construct itself: a generalized expectancy, learned across a history of reinforcement, about whether outcomes follow from one's own behavior or from luck, chance, fate, or powerful others. |
| **Herbert Lefcourt** | _Locus of Control: Current Trends in Theory and Research_ (1976)                          | Consolidates the construct's downstream correlates and boundary conditions across the research that followed Rotter, without treating any single outcome-attribution as the construct itself.                      |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **The belief in one's capability for a task** (Bandura, self-efficacy): a
  judgment of "can I do this," scoped to a task, not a generalized expectancy
  about where control lies at all. The architecture **delegates that to a
  self-efficacy engine**.
- **The attribution of one specific outcome** (Weiner, attribution theory): a
  single decision's read of why this one thing happened. Locus of control is
  the standing frame that precedes and shapes that read, not the read itself.
  The architecture **delegates the single-outcome read to a decision engine**.
- **The felt helplessness that can follow repeated external attribution**
  (Seligman, learned helplessness): the affective collapse is downstream of
  the expectancy, not the expectancy itself. The architecture **delegates the
  felt state to the emotion/stress engines**.
- **Agency as a hope axis** (Snyder, hope theory): hope's pathways-and-agency
  model of pursuing a goal is a distinct construct from a generalized
  expectancy about the source of reinforcement. The architecture **delegates
  goal-pursuit agency to the hope engine**.

## Encoding

Source to constraint, per file.

- **[locus-of-control](position_locus_of_control.md)** (the anchor): the
  generalized expectancy itself, held continuously as a resting frame rather
  than computed fresh per outcome. Anchored directly in Rotter (1966).
- **[internal](position_internal.md)** (expression): the expectancy that
  reinforcement follows from one's own behavior, effort read as leverage.
  Anchored in Rotter's internal-control pole.
- **[external](position_external.md)** (expression): the expectancy that
  reinforcement follows from luck, fate, or powerful others, effort read as a
  bet against forces it does not run. Anchored in Rotter's external-control
  pole, with Lefcourt (1976) for the construct's later elaboration.

---

_Authored by KAI HACKS AI: original constraint-based expression in the
locus-of-control tradition; it does not reproduce claims or quote directly._
