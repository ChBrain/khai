# Registry entries

Each house registers one file here, `<source>.json`, where `<source>` is the
house slug (matching `khai-plays-<source>`). The website reads these and renders
one card per house, with its productions underneath. khai holds these cards; the
productions live in the houses.

Shape:

```
{
  "id": "buechner",
  "title": "Buechner",
  "repo": "https://github.com/ChBrain/khai-plays-buechner",
  "blurb": "One line for the card.",
  "plays": [{ "id": "woyzeck", "title": "Woyzeck", "package": "@chbrain/khai-play-woyzeck" }]
}
```

`id` must be a slug and match the filename. `repo` points to where the house
lives. `plays` grows as productions are staged and may start empty. A malformed
entry fails the build, so the bill never renders broken.
