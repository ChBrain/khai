---
"@chbrain/khai-tour": patch
---

Implement the `tour()` interactive path. For a `kind: interactive` venue, `tour()`
validates the venue, composes the deployment via `composeVenue`, aggregates the
caller's collections, and writes the bundle as a `<venue>.zip` — root carries
`README` / `REFERENCES` / `LICENSE` / `LICENSE-CODE` (a missing one is a warning,
never a silent drop), the `khai/` folder carries `instructions.md` + the
collections. Adds a dependency-free ZIP writer (`zip`, over `node:zlib`, with
reproducible output) and the pure bundle assembler (`buildInteractiveBundle`).
The publication path still throws a clear "not implemented yet". See docs/TOUR.md.
