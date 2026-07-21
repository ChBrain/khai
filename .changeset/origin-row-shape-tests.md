---
---

Tests for the Origin-row well-formedness wall: a unit suite for `originRowErrors` (flags a two- or four-column data row, passes a clean three-column table, ignores the separator, header, prose, and bare pipes) and an integration suite (`collectScience` throws naming the engine on a malformed row, passes a clean engine, and does not check a type-less meta engine whose warrant is two-column). Tests only; ships nothing.
