# NLP Review — Architecture

The NLP review is the semantic layer above the structural conformance kit
(`khai-tests`). Where `khai-tests` checks that the architecture is followed —
the right sections are present, the right links are made — the NLP review checks
that the prose is good: lean, coherent, and true to its declared voice.

It never gates. A structural failure breaks CI; an NLP finding is a suggestion
that a human treats in a comment thread. The gate is the conversation, not the
model.

## Escalation of concerns

Three layers, each narrower than the one above:

1. **Structural** (`khai-tests`) — deterministic, binary, cheap. Does the file
   conform to its khai type? Are the required links present? Runs on every push.
2. **Semantic** (`khai-review`) — a model judge, advisory, expensive. Is the
   prose lean? Does it conform to the declared voice? Triggered sparingly.
3. **Human** — the treatment layer. A finding is a risk; the human accepts,
   reduces, or transfers it. The consistency gate checks that the table and the
   comment threads agree.

## Rubrics

A rubric is a named criterion the judge applies. Adding a check is adding a
rubric — data, not code. The judge is injected, so the harness tests without a
model.

Rubrics in use:

| Rubric | Scope | What it checks |
| --- | --- | --- |
| `conciseness` | universal | at least a quarter of a passage could go with no loss of meaning |
| `khai-type` | universal | the prose actually does the job the section demands (e.g. Shadow contradicts Projection rather than restating it) |
| `voice-conformance` | per content unit | the prose conforms to the voice the file declares |

`voice-conformance` is parameterised at runtime: the harness reads the effective
voice declaration for the file under review and builds the rubric instruction from
it. The rubric is data, not code.

## Voice: the override chain

Every khai content file may declare its voice in YAML frontmatter:

```yaml
voice: "sparse and clinical; working-class register; colon and semicolon, never a dash"
```

The effective voice for any given file is resolved by walking up:

```
repo README.md  (house voice — the base)
  └── play file  (play voice — overrides house)
        └── element file  (file voice — overrides play)
```

The most specific declaration wins. A level with no `voice` field inherits from
the level above. No declaration anywhere means no brief — the harness skips the
`voice-conformance` rubric for that file and warns.

House voice is authored when the house is raised (khai-impresario); play voice
when the play is raised (khai-playwright). A play voice is specific to the
production — Woyzeck's stripped clinical cadence is not the voice of Leonce and
Lena, even within the same Buechner house. Element files may further narrow the
voice, because a persona or a place has its own register within the play: the
Captain's files are wordier than Woyzeck's because he is, and that verbosity is
not padding.

### CVI

The `voice` field is also read by the website's CVI (Creative Visual Identity).
CVI does not declare its own voice; it reads the `voice` field from the content
package it is rendering and instantiates the appropriate presentation from it.
The content self-describes once; both the reviewer and the renderer pick it up.

## Trigger pattern

The model call is expensive. The review job fires only on:

- PR open / reopen
- `/audit <id>` comment (on-demand)
- Manual dispatch

Every subsequent push runs the cheap `consistency` job instead: no model calls,
only the deterministic ledger-vs-comments check. The gate stays live cheaply.

## Audit manifests

An audit is declared in `audit/<id>/audit.json`:

```json
{
  "id": "woyzeck-conciseness",
  "review": { "rubrics": ["conciseness"], "targets": ["plays/woyzeck"] }
}
```

A house may run several audits in parallel — one per rubric, or one per scope.
The collector deduplicates findings across runs; each finding lives in exactly
one ledger.

## Current state and what is still to build

The harness is implemented and tested. The `conciseness` rubric is the only one
defined. The CLI reads engine `khai.card` chapters only; it does not yet read H2
section bodies from markdown files.

What remains:

- **Markdown input path** in the CLI: extract H2 section bodies from `.md` files
  as review targets alongside card chapters.
- **`khai-type` rubric**: a per-section-type criterion defined once and applied
  universally.
- **`voice-conformance` rubric**: parameterised from the `voice` field, resolved
  via the override chain at review time.
- **`voice` field** in the khai-arch type definitions: recognised frontmatter
  field so the conformance kit can require its presence.
- **khai-stage blueprint update**: stamp `@chbrain/khai-review` as a dependency,
  seed `audit/` manifests for each rubric, and add `audit.yml` to the house CI.
  The impresario and playwright skills guide the voice authoring step.
