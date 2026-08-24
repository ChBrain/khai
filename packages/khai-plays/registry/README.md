# Registry entries

One registry for every house that depends on khai. Each house registers one
file here, `<source>.json`, where `<source>` is the house slug. The card names
the house and what it publishes: the `repo` is the house, the `package` is what
the website pulls to read it. khai holds the cards; the contents live in the
houses.

Shape:

```
{
  "id": "buechner",
  "title": "Buechner",
  "kind": "stage",
  "package": "@chbrain/khai-plays-buechner",
  "blurb": "One line for the card.",
  "repo": "https://github.com/ChBrain/khai-plays-buechner"
}
```

`id` must be a slug and match the filename. `repo` is required: the repository
is the house, and a house with no resolvable home is not yet a production.
`package` is the one npm package the house publishes. A malformed entry fails
the build, so the bill never renders broken.

## The three kinds

`kind` is required and closed. The houses share an architecture and hold
different things, and the bill renders a section per kind:

- **`stage`** — a source staged as plays. Buechner, Dickens, Grimm, H.C.
  Andersen, Kleist, Storm, and L2, whose source is lived experience rather than
  another author's work. Whether the source is credited (`invented_by` +
  `source`) is the licensing lane's business, not the card's.
- **`work`** — khai's own canon given a voice as a finished piece. Phoenix
  stages the `combustion` engine, each named phenomenon of fire speaking for
  itself. A work is read, not drawn on.
- **`canon`** — reusable material a production draws on. Misfits and Cultures:
  named readings, no voice of their own, cast and wired by other productions
  the way an engine or a composite is.

The kind cannot be computed here. A card is all khai holds about a house — the
house is another repository, so its `package.json` (and the `khai.collection` it
declares) is out of reach at build time. If the card does not carry the kind,
the bill cannot tell a Dickens staging from a catalogue of cultural positions.

Defaults follow the kind: a `stage` house defaults to `khai-plays-<slug>`,
a `work` or `canon` house to `khai-<slug>`. Pass `--repo` or `--package` to
override either.

## Adding a card

Do not hand-write a card or edit `../README.md`:

```
npx @chbrain/khai-plays register <source> --kind <stage|work|canon> --blurb "..."
```

which writes the card and rewrites the README from the whole registry.
