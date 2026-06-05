---
"@chbrain/khai-plays": patch
---

Give khai-plays a `register` and `render` CLI, and make the README a generated
view of the bill. `npx @chbrain/khai-plays register <source> --blurb "..."`
writes `registry/<slug>.json` and rewrites `README.md` from the whole registry;
`render` rewrites the README alone, so a hand-added card or a drift check can
refresh the human view without touching the data. A card names a house and its
programme: `repo` is the house (required, since the repository is the house and
a house with no resolvable home is not yet a production) and `package` is the
programme the website pulls for that house's plays, with `title`/`blurb` for the
bill. Both `repo` and `package` default from the slug, so the impresario passes
only `--blurb`. A test asserts `README.md` matches `renderReadme(houses)`, so the
bill and its README can never drift.
