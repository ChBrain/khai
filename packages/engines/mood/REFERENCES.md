---
updated: "2026-06-09"
---

# Mood: Reference

## Line of Work

Mood as **position**: the persisting affective background a persona carries
beneath the moment's feeling. The domain does not model the discrete event-driven
spike or the lifelong trait climate; it models the baseline tone a persona holds
across hours and days, the colour laid on every read before any single event.

## Origin

The affect circumplex, applied directly as code constraints.

| Source                | Key Work                                         | Scope                                                                              |
| --------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **James Russell**     | _"A circumplex model of affect"_ (1980)          | Affect as a circle on two axes, valence by arousal; the four quadrants as moods.   |
| **Watson & Tellegen** | _"Toward a consensual structure of mood"_ (1985) | Mood as positive and negative affect, two roughly independent dimensions.          |
| **Robert Thayer**     | _The Biopsychology of Mood and Arousal_ (1989)   | Arousal split into energetic and tense; the activated axis as two kinds of energy. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **The discrete feeling** (the spike): A mood is not an event. The sudden,
  cause-bound feeling that fires and fades, the lightning, **delegates to the
  emotion engine**. Mood is the weather the emotion fires through, not the strike
  itself.
- **The lifelong trait** (the climate): A mood is weather over hours and days,
  not a life. The enduring temperamental set that holds across years
  **delegates to the temperament engine**. Mood is the weather; temperament is
  the climate that biases which weather is likely.
- **The autonomic surge**: The acute physiological spike, the racing heart and
  flooded system under load, **delegates to the stress engine**. Mood is a tone,
  not a surge; it colours the read without seizing the body.
- **The cause of the mood** (the why): The engine models the baseline as it
  stands, never its origin. Why a persona carries this mood, the event or arc
  that set it, **belongs to the scene and the play's arc**, not to a mood file.
- **Clinical mood disorder**: The engine models the normal range only. Diagnostic
  states, the disorder rather than the weather, are **out of scope**.

## Encoding

Source to constraint, per file.

- **[mood](position_mood.md)** (the anchor): mood as a background tone held across
  a stretch, a baseline on two axes carried continuously rather than run as a
  process. Anchored by Russell (the circumplex) and Watson & Tellegen (mood as
  standing affect).
- **[buoyant](position_buoyant.md)** (expression): pleasant and activated, up and
  bright, the read that reaches out and says yes. Anchored by the circumplex's
  high-pleasant-high-activation quadrant and Thayer's energetic arousal.
- **[serene](position_serene.md)** (expression): pleasant and quiet, calm and at
  ease, the low warm baseline that settles. Anchored by the circumplex's
  high-pleasant-low-activation quadrant.
- **[irritable](position_irritable.md)** (expression): unpleasant and activated,
  tense and on edge, the braced read with a short fuse. Anchored by the
  circumplex's low-pleasant-high-activation quadrant and Thayer's tense arousal.
- **[flat](position_flat.md)** (expression): unpleasant and quiet, down and
  depleted, the heavy low with the colour drained. Anchored by the circumplex's
  low-pleasant-low-activation quadrant.

---

_Authored by KAI HACKS AI: original constraint-based expression in the
affect-circumplex tradition; it does not reproduce claims or quote directly._
