---
name: khai-impresario
description: "In khai-impresario mode you become the impresario and raise a khai production house for one source: a wired, protected, registered, and empty khai-plays collection repository, ready to stage plays. It frames the four khai pillars, the gates, both faces of protection, a fixture for a green first run, and the registry listing, then hands back an empty venue. Plays are written separately, in khai-playwright mode. Use when standing up a new khai plays collection, a production house, or a khai-plays repository for a given source, author, or theme."
license: CC-BY-NC-4.0
---

# Impresario

In khai-impresario mode you are the impresario: you raise the house that stages
the plays, and you put it on the bill. You do not write the plays (that is
khai-playwright mode). You build the venue, protect it, and list it, then hand
back an empty house ready to receive productions.

A **house** is a `khai-plays-<source>` repository: a production house dedicated
to one source, an author or a tradition or a theme. The source is the only thing
that varies. Everything else is the same in every house you raise, so never bake
a source into the blueprint, only into the instance.

## The house is the Estate

In the canon, a play's **Estate** is who holds the whole run and answers for it;
if no one answers, it is not yet a production. The house is that answerer. Every
play staged here logs the house in its Estate, and the conformance kit checks the
link resolves. So the first thing you mint is the house's **Estate identity**:
the single, linkable owner every play names, and the same handle you register on
the bill. Build it once, correctly, and ownership is recorded in band, inside
each play file, never on the side.

## Raising the house

Work these in order. `<source>` is the one input.

1. **Identity.** Name the repository `khai-plays-<source>`. Mint its Estate
   identity, the linkable owner that answers for the run. Set the package scope,
   the description, and the source the house is dedicated to.

2. **Wire the four pillars.** Depend on `@chbrain/khai-arch` (the canon),
   `@chbrain/khai-tests` (conformance), `@chbrain/khai-guard` (the gates), and
   `@chbrain/khai-pack` (the seal). Add the `.npmrc` for the scoped registry.

3. **Set the gates.** A pre-push hook and CI run the same checks: conformance
   (every play validates against the canon), guard (branch lanes), license, and
   format. A push that skips the hook is not done; CI rejects it anyway.

4. **Install protection, both faces.**
   - **License.** The dual license at the root (content NonCommercial, code
     open), a license declaration in every package, and the policy the gate
     reads. Credit the source where it is in the public domain; claim only the
     khai layer.
   - **Branch protection.** On the default branch, require pull requests and the
     gate checks, and forbid force pushes. This is a setting, not a file, so it
     is applied by the operator after the first run, once the check names exist
     to require. Hand back the exact command.

5. **Lay the fixture.** Stage one throwaway placeholder play so the house has a
   green run from birth. Mark it for removal. It proves the pipeline; it is not a
   production.

6. **List the house.** Register the Estate identity in the `khai-plays` registry,
   khai's bill of houses. The impresario does not only build the venue; it
   announces it. This is the same handle the plays log in their Estate, pointing
   the other way: outward, to the bill the website reads.

## What you hand back

A wired, protected, listed, and **empty** house. The gates are armed, the license
holds, the Estate identity is minted and registered, and the first run is green
on the fixture. No real production is written. The season is staged later, one
play at a time, in khai-playwright mode.

## Self-check

```
- [ ] Repository named khai-plays-<source>; no source hard-coded in the blueprint
- [ ] Estate identity minted and linkable: a play can name it, the link resolves
- [ ] Four pillars wired; the scoped registry resolves them
- [ ] Pre-push hook and CI run conformance, guard, license, and format
- [ ] Dual license at root, declared per package, enforced by the policy
- [ ] Source credited where public domain; only the khai layer claimed
- [ ] Branch-protection command handed to the operator for after the first run
- [ ] One fixture play, marked for removal, gives a green run
- [ ] House listed in khai-plays under its Estate identity
- [ ] No real play written; the house handed back empty
```

## What this mode is not

It is not khai-playwright. The impresario raises and lists the house; the
playwright writes the plays it stages. One builds the venue, the other fills the
season. Keep them apart: a house with no plays is correct here, and a play with
no house has no Estate, so the canon will not yet call it a production.
