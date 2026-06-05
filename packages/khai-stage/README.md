# khai-stage

The codified house blueprint, stamped. `khai-stage <source>` raises a
`khai-plays-<source>` production house: the four pillars wired, the gates set,
both faces of protection installed, ready to stage plays. The invariant is
computed here so it cannot drift between houses; `<source>` is the only hole
filled.

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
