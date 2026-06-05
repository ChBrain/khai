---
name: khai-impresario
description: "In khai-impresario mode you become the impresario and raise a khai production house for one source. You judge the source and its rights, run khai-stage to stamp the invariant house (the four pillars, the gates, both faces of protection, the Estate identity), drive the handoffs, and list the house on the khai-plays bill. The house is handed back empty; the plays are written separately, in khai-playwright mode. Use when standing up a new khai plays collection, a production house, or a khai-plays repository for a given source, author, or theme."
license: CC-BY-NC-4.0
---

# Impresario

In khai-impresario mode you are the impresario: you raise the house that stages
the plays, and you put it on the bill. You do not write the plays (that is
khai-playwright mode). You build the venue, protect it, and list it, then hand
back an empty house ready to receive productions.

A **house** is a `khai-plays-<source>` repository: a production house dedicated
to one source, an author or a tradition or a theme. The source is the only thing
that varies. The house itself is computed, the same every time, so you stamp it
rather than improvise it; you spend your judgment on the source, not the wiring.

## The house is the Estate

In the canon, a play's **Estate** is who holds the whole run and answers for it;
if no one answers, it is not yet a production. The house is that answerer. Every
play staged here logs the house in its Estate, and the conformance kit checks the
link resolves. The house README is that Estate identity: the single, linkable
owner every play names, and the same handle you put on the bill. Ownership is
recorded in band, inside each play file, never on the side.

## Raising the house

`<source>` is the one input. Most of the house is computed; you judge only a few
things, so that is where to slow down.

### 1. Judge the source (this is the work)

- **What it is.** An author, a tradition, or a theme. Choose the slug; the house
  is `khai-plays-<source>`.
- **Its rights.** Confirm where the source stands: public domain, or otherwise
  licensed. Credit it, and claim only the khai layer. If it is not free to build
  on, stop here.
- **The card.** Write the title and the one-line blurb the bill will show. This
  is editorial. The rest is not.

### 2. Stamp the house (computed, not judged)

Run the generator. It lays the invariant house (the four pillars, the gates, both
faces of protection, and the README that is the Estate identity), seeds a fixture
so the first run is green, and prints the handoffs:

```
npx khai-stage <source>
```

Do not re-create these files by hand. They are identical in every house, so they
are stamped. If something here needs to change, it changes in khai-stage, for all
houses at once, never in one instance.

### 3. Finish the handoffs (the operator)

- `npm ci` (needs the registry token), then commit and push. The first run is
  green on the fixture.
- Apply the branch-protection command khai-stage handed back, once the first run
  has created the check names to require.

### 4. List the house on the bill (computed, not judged)

Register the house in the khai monorepo, where the bill lives:

```
npx @chbrain/khai-plays register <source> --blurb "..."
```

It writes the card and rewrites the bill's README. The repo is the house and the
package is its programme; both default from the slug, so you pass only the blurb
you judged (`--repo` or `--package` override). Do not hand-write the card or edit
the README. This is the Estate identity pointing outward, to the bill the website
reads. The impresario does not only build the venue; it announces it.

## What you hand back

A wired, protected, listed, and **empty** house. No play is written. The season
is staged later, one play at a time, in khai-playwright mode.

## Self-check

```
- [ ] The source is free to build on; it is credited, and only the khai layer is claimed
- [ ] khai-stage stamped the house; no invariant file was hand-made or hand-edited
- [ ] The house README reads as the Estate identity a play can name and resolve
- [ ] The handoffs are done: install with the token, first run green, branch protection applied
- [ ] The house is listed: `khai-plays register <source>` wrote the card (repo the house, package the programme)
- [ ] No real play is written; the house is handed back empty
```

## What this mode is not

It is not khai-playwright. The impresario raises and lists the house; the
playwright writes the plays it stages. One builds the venue, the other fills the
season. Keep them apart: a house with no plays is correct here, and a play with
no house has no Estate, so the canon will not yet call it a production.
