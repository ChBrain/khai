---
"@chbrain/khai-plays": patch
---

Give khai-plays a `register` and `render` CLI, and make the README a generated
view of the bill. `npx @chbrain/khai-plays register <source> --blurb "..."`
writes `registry/<slug>.json` and rewrites `README.md` from the whole registry;
`render` rewrites the README alone, so a hand-added card or a drift check can
refresh the human view without touching the data. A card now registers a house
by its one published package (the website pulls that package for the house's
plays), with `title`/`blurb` for the bill and an optional `repo` link. A test
asserts `README.md` matches `renderReadme(houses)`, so the bill and its README
can never drift.
