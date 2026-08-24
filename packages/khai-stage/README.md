# khai-stage

The codified house blueprint, stamped. `khai-stage <source>` raises a house: the
four pillars wired, the gates set, both faces of protection installed. The
invariant is computed here so it cannot drift between houses; `<source>` and
`--kind` are the only holes filled.

Three kinds, the same three the bill carries:

```
khai-stage buechner                                  # stage: khai-plays-buechner, indexes plays
khai-stage cultures --kind canon                     # canon: khai-cultures, indexes cultures
khai-stage phoenix  --kind work --collection beasts  # work:  khai-phoenix, indexes beasts
```

`stage` is the default and is unchanged by the option: it indexes the default
`plays` collection and so declares none, exactly as every house raised before
`--kind` existed. A `work` or `canon` house is named `khai-<source>`, indexes a
collection named for itself unless `--collection` says otherwise, and declares
that collection in `khai.collection`.

What varies by kind is the house's **identity and structure**. The **voice does
not**: the blueprint's management personas still speak of plays, because that
prose is judged rather than computed. A non-stage stamp says so in its handoffs
and leaves the reading to the skill that raised it.

This is the **stamp** half of raising a house. The `khai-impresario` skill is the
**conduct** half: it judges the source, runs this, and drives the handoffs (the
token install, branch protection, the registry listing). The skill stays fat
where it judges; this package is thin and deterministic where everything is the
same.

## Use

```
npx khai-stage buechner
```

Writes `khai-plays-buechner/`, then prints the handoffs to finish by hand. The
generator never reaches the network.

## What it stamps

The house `package.json` (the four pillars), `.npmrc`, the dual license, the
guard config (a `play/*` lane for productions, `governance/*` for the gates), CI
and the pre-push hook, CODEOWNERS, SECURITY, `CLAUDE.md`, the `README.md` that
serves as the house's Estate identity, and a conformance test that is green on an
empty house and validates plays as they land. No play is written; the house is
handed back empty. The plays come later, in `khai-playwright` mode.
