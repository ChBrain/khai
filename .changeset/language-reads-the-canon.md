---
"@chbrain/khai-language": patch
---

The language gate reads the canon's chapters, not a hand-typed list.

`DEFAULT_PROSE_SECTIONS` carried fifteen section names. Measured over the
290-culture Cultures house, that left **612,572 words, 43% of the house's prose,
outside the gate**: every chapter of every pitch and every process unread
entirely, `Cue`/`Stage`/`Tension` unread on every plot, and `Has`/`Drives` unread
on every position -- `Has` being where a language variety states its own grammar,
in that variety. Nothing announced it, because a section the scanner never opens
produces no finding, and no finding reads exactly like no error.

The set is now derived from khai-arch: every chapter of a house- or element-class
type, minus six structural ones, unioned with the legacy fifteen so a canon
rename cannot silently narrow the gate. A new content type is scanned the day it
lands.

The class filter is the policy. Meta-class types (order, plan, instructions,
architecture, engines, repertoire) are the governance voice and are English
inside a house of any language, so scanning them would flag correct prose.

The six structural exclusions were measured, not assumed: `Taxonomy` and `Owner`
are keys, `Company` and `Triggers` are cast lists whose words are a gloss around
a link, `Estate` and `Name` are identity lines of URLs and ISO codes. Including
the four list-and-identity chapters produced exactly one finding across the
house, a 25-word `Triggers` gloss reading as Bislama where Pijin was declared --
a documented within-margin sibling that the word count, not the language, made
visible.

The widening costs nothing: khai-cultures (both collections) and khai-misfits
report zero findings, the same as before. What was missing was the check, not the
quality.

Adds `@chbrain/khai-arch` as a dependency. No cycle -- khai-arch depends only on
js-yaml, so the language gate reads the architecture and never the reverse.
