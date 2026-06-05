# Registry entries

Each house registers one file here, `<source>.json`, where `<source>` is the
house slug (matching `khai-plays-<source>`). khai holds these cards; the plays
live in the houses. The website reads the cards and pulls each card's package to
read that house's plays.

Shape:

```
{
  "id": "buechner",
  "title": "Buechner",
  "package": "@chbrain/khai-plays-buechner",
  "blurb": "One line for the card.",
  "repo": "https://github.com/ChBrain/khai-plays-buechner"
}
```

`id` must be a slug and match the filename. `package` is the one npm package the
house publishes; it contains that house's plays, and the website pulls it. `repo`
is optional, a human link to where the house lives. A malformed entry fails the
build, so the bill never renders broken.

Do not hand-write a card or edit `../README.md`: run
`npx @chbrain/khai-plays register <source> --blurb "..."`, which writes the card
and rewrites the README from the whole registry.
