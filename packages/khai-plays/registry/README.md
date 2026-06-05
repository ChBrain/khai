# Registry entries

Each house registers one file here, `<source>.json`, where `<source>` is the
house slug (matching `khai-plays-<source>`). The card names the house and its
programme: the `repo` is the house, the `package` is the programme the website
pulls to read that house's plays. khai holds the cards; the plays live in the
houses.

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

`id` must be a slug and match the filename. `repo` is required: the repository
is the house, and a house with no resolvable home is not yet a production.
`package` is the one npm package the house publishes, its programme of plays.
A malformed entry fails the build, so the bill never renders broken.

Do not hand-write a card or edit `../README.md`: run
`npx @chbrain/khai-plays register <source> --blurb "..."`, which writes the card
and rewrites the README from the whole registry. `repo` and `package` default
from the slug (`https://github.com/ChBrain/khai-plays-<slug>` and
`@chbrain/khai-plays-<slug>`); pass `--repo` or `--package` to override.
