---
updated: "2026-07-17"
---

# Archetypes: Reference

## Line of Work

Archetypes as **persona**: Jung's principal figures of the collective
unconscious, cast directly as personas -- an archetype is already a way of
being seen and behaving before an individual life chooses it, so it belongs
on the persona type, not one layer removed from it. The domain does not
model a specific person's biography (that is the production's own persona
work); it models the inherited pattern -- the figure a persona is cast into,
constellated by, or dressed as, and the friction that fires when the figure
is mistaken for the literal person carrying it.

The spine is Jung's theory of the collective unconscious: archetypes are not
learned from personal experience but inherited structural predispositions,
shared across humanity, that surface in dream, myth, and ordinary behaviour
whenever a situation resembles the shape they carry. This engine ships the
anchor (the archetype as such) and seven of the principal figures Jung
documented and returned to across his work.

## Origin

C. G. Jung's analytical psychology, applied directly as persona: the
archetype is a way of appearing, not a hidden trait, so its home is the
persona type itself.

| Source         | Key Work                                                                               | Scope                                                                           |
| :------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **C. G. Jung** | _The Archetypes and the Collective Unconscious_ (Collected Works Vol. 9i, 1959)        | The principal archetypes and the collective unconscious as their shared ground. |
| **C. G. Jung** | _Psychological Types_ (1921)                                                           | The persona and the structure of the psyche the archetypes move through.        |
| **C. G. Jung** | _Two Essays on Analytical Psychology_ (1928)                                           | The shadow, anima and animus, and the process of individuation.                 |
| **C. G. Jung** | _Aion: Researches into the Phenomenology of the Self_ (Collected Works Vol. 9ii, 1951) | The Self as the archetype of wholeness and the organizing centre of the psyche. |

## Restrictions

What the engine refuses to model, and to whom it delegates.

- **The mask, the social face**: Jung's own persona concept -- the mask worn
  toward the world -- is not a separate archetype file here; it collides
  directly with khai's own `persona` type, which already _is_ the projected,
  presented face (the Projection chapter on every persona file). Modelling it
  again as `persona_mask.md` would duplicate a structure khai already
  provides natively, so it is delegated whole to khai's persona Projection
  chapter, not carried in this engine.
- **The individual life**: The engine ships the collective, inherited
  pattern, not a named person. A specific character who is constellating one
  of these archetypes is composed in the production's own persona work,
  outside the engine, by linking the archetype under that persona's own
  Projection.
- **Cultural costume**: Which images, myths, or figures a given culture
  dresses an archetype in (which god, which folk story, which face) is the
  consuming culture's or production's to supply; the engine ships the
  universal pattern underneath the costume, not the costume itself.
- **Clinical use**: The engine encodes Jung's structural theory for
  authoring personas, not a diagnostic or therapeutic instrument; it does not
  model individuation as a clinical process.

## Encoding

Source to persona. An anchor (the archetype as such) with seven principal
figures -- the Self, the Shadow, the Anima, the Animus, the Wise Old Man, the
Great Mother, and the Trickster -- each cast as a persona in its own right.

- **[archetype](persona_archetype.md)** (the anchor): The collective pattern
  itself -- inherited, older than the individual, shared across a culture,
  no khai file above it but the collective unconscious. Anchored by Jung
  (_The Archetypes and the Collective Unconscious_).
- **[self](persona_self.md)**: The archetype of wholeness and integration,
  the organizing centre the psyche moves toward. Anchored by Jung (_Aion_).
- **[shadow](persona_shadow.md)**: The repressed, disowned, inferior side;
  what the ego refuses to own. Anchored by Jung (_Two Essays on Analytical
  Psychology_).
- **[anima](persona_anima.md)**: The unconscious feminine image in a man's
  psyche, Jung's contrasexual archetype. Anchored by Jung (_Two Essays on
  Analytical Psychology_).
- **[animus](persona_animus.md)**: The unconscious masculine image in a
  woman's psyche. Anchored by Jung (_Two Essays on Analytical Psychology_).
- **[wise old man](persona_wise_old_man.md)**: The Senex, the spirit
  archetype -- the figure of meaning, guidance, and hidden knowledge.
  Anchored by Jung (_The Archetypes and the Collective Unconscious_).
- **[great mother](persona_great_mother.md)**: The archetype of nurture and
  devouring in one figure, origin and dissolution. Anchored by Jung (_The
  Archetypes and the Collective Unconscious_).
- **[trickster](persona_trickster.md)**: The boundary-breaker, shape-shifter,
  agent of disruptive transformation. Anchored by Jung (_The Archetypes and
  the Collective Unconscious_).
