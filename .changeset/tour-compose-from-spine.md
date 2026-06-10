---
"@chbrain/khai-tour": patch
---

Compose deployed instructions from live spine content instead of inline fixtures.
`compose.mjs` now reads the Prose Standard, the shared House Rules and the Venue
adaptions from `@chbrain/khai-engine-spine`; the new `composeVenue(venue)` feeds
that live content to the pure `composeInstructions`. The Perplexity test composes
from real spine inputs and still reproduces the known-good deployed artifact, end
to end. Drops the interim `HOUSE_RULES` / `VENUE_ADAPTIONS` fixtures.
