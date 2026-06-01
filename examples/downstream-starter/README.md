# khai downstream starter

A minimal project that **consumes** khai engines. Copy it, write your content,
and one command validates every file against the architecture canon and the
wiring rules of the engines you installed.

## Setup

```bash
npm install
```

This pulls the engines you depend on (here, `@chbrain/khai-engine-gender`) plus
the conformance kit. The packages live in GitHub Packages under the `@chbrain`
scope; `.npmrc` points npm at that registry. You need a GitHub token with
`read:packages` configured for npm to install — see
[GitHub Packages docs](https://docs.github.com/en/packages).

## Write content

Put your instance files anywhere (the validator discovers them by their
`khai:` frontmatter). See [`personas/mara.md`](personas/mara.md) for a worked
persona.

## Validate

```bash
npm run validate          # = khai-tests --project .
```

It exits non-zero on any failure, so it works as a CI step or pre-commit hook.

### What gets checked, per file

1. **Encoding** — no BOM/CRLF/en–em dashes, trailing newline.
2. **Frontmatter** — closed key set; `khai` is a known canon type; valid stamp.
3. **Headers: exact set and order** — for a persona,
   `[Title, Owner, Projection, Action, Shadow, Tell]`. This contract comes from
   the canon (`@chbrain/khai-arch`); the kit reads it, never restates it.
4. **No undeclared `###`** — sub-headers are engine-imposed, not a free pass.
5. **H1 / Title / Owner** — well-formed and consistent.
6. **Links resolve** (engine wiring targets excepted — they live in node_modules).
7. **Engine wiring as installed** — because the gender engine is installed,
   every `persona` must link a gender expression under `## Projection`. The
   engine _declares_ this requirement in its manifest; the kit _enforces_ it.
   Install a different engine and its rules apply too — no config here changes.

Drop the gender link from a persona, or remove a chapter, and `npm run validate`
fails with a precise message pointing at the file.

## CI

[`.github/workflows/validate.yml`](.github/workflows/validate.yml) runs
`npm run validate` on every push and PR.
