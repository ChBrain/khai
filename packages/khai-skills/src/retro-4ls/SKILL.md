---
name: retro-4ls
description: "Facilitates a 4 L's retrospective (Liked, Learned, Lacked, Longed for) on a completed period of work. Two modes: facilitated (asks the human each lens in turn) or self-diagnosis (AI reads available context and fills all four lenses itself). Use after any sprint, project, session, or review."
license: CC-BY-NC-4.0
---

# 4 L's Retrospective

A four-lens reflection on a completed period of work. Each lens names a
different quality of experience: what energised (**Liked**), what expanded
capability (**Learned**), what constrained delivery (**Lacked**), and what
the team or person would benefit from in the future (**Longed for**).

Attributed to Mary Gorman and Ellen Gottesdiener, _Discover to Deliver_ (2012).

## Mode selection

Before running any lens, determine the mode:

**Mode A: Facilitated.** The human answers each lens. Ask the questions, wait
for responses, probe once if an answer is thin, then compile. Use this when
the human wants to reflect and articulate their own experience.

**Mode B: Self-diagnosis.** The AI reads the available context (conversation
history, session artifacts, outputs, decisions made) and fills all four lenses
itself. The human does not answer questions. Use this when the human asks the AI
to run the retro, or when the subject of the retro is the AI's own work in the
session.

Detect the mode from the request. "Run a 4L" with no further input: ask which
mode. "You run it" or "self-diagnose" or "tell me": use Mode B. "Ask me" or
"facilitate": use Mode A. When in doubt, ask once.

In Mode B, state clearly at the top of the output that this is an AI
self-assessment drawn from session context, not a human-reported retro.

## How to run it

### Mode A: Facilitated

**Step 1. Establish the period.**

Ask the participant what period of work the retro covers. Get a concrete
answer: a sprint number, a project name, a date range. Do not proceed until
the scope is clear.

**Step 2. Work through each lens in sequence.**

Run the four lenses in order. For each one: ask the prompt question, wait
for a response, then probe once if the answer is thin. One probe is enough:
do not interrogate. Move on when the lens is spent.

**Step 3. Compile the output.**

After all four lenses, compile the responses into the output format below.
Do not editorialize: report what was said, not what you infer from it. If
an item is ambiguous, note it as-is rather than resolving it silently.

### Mode B: Self-diagnosis

**Step 1. Establish the period.**

If the period is not named, derive it from context: the session, the project,
the last sprint visible in the conversation. State the period you are assessing
at the top of the output.

**Step 2. Run each lens analytically.**

For each lens, read the available context and extract items the AI can
directly observe: decisions made, friction encountered, things that worked,
things that were missing, moments where the direction changed. Do not invent
items; only surface what the context supports. Label inferred items as
inferred if they are not directly evidenced.

**Step 3. Compile the output.**

Use the same output format as Mode A. Prefix the document with:
"Self-diagnosis: drawn from session context. Not a human-reported retro."

## The four lenses

### Liked

> What did you like?

What worked, what felt good, what gave energy. This is not about what was
correct or optimal: it is about what was valued. Accept short answers; the
lens is often quick.

Probe if empty (Mode A): "Is there anything from the period, however small,
that you would want to keep or repeat?"

In Mode B: what decisions or approaches in the session produced clean results?
What moments went well by observable evidence?

### Learned

> What did you learn?

What the period added to capability: skills, knowledge, understanding of
the domain, or understanding of the team. Distinguish between things
learned and things confirmed.

Probe if empty (Mode A): "Was there a moment where something surprised you or
clicked into place?"

In Mode B: what assumptions were revised? What approaches were tried and
corrected? What did the session surface that was not known at the start?

### Lacked

> What did you lack?

What was missing and constrained the work: information, tooling, time,
clarity, support, or something else. This is the most actionable lens:
items here point directly at future improvements.

Probe if empty (Mode A): "Was there a point where you felt blocked or slowed
down by something outside your control?"

In Mode B: what caused rework, extra rounds, or avoidable friction? Where did
root-cause diagnosis come late?

### Longed for

> What did you long for?

What would have improved the period beyond what was available: a capability,
a process, a relationship, a resource. Unlike Lacked (which is about what
constrained this period), Longed for can reach beyond the period to future
possibilities.

Probe if empty (Mode A): "If you could change one thing about how the next
period runs, what would it be?"

In Mode B: what context, information, or capability, if available at the start,
would have changed the shape of the session?

## Output format

```
# Retrospective: 4 L's
Period: [the period assessed]

## Liked
[one bullet per item]

## Learned
[one bullet per item]

## Lacked
[one bullet per item]

## Longed for
[one bullet per item]
```

Keep bullets short: one idea per bullet. Do not merge items. If a lens
produced no items, write "nothing surfaced" rather than omitting the section.

## Quality rules

- **Mode first.** Determine the mode before asking any question or reading any
  context. Running Mode A questions in a Mode B situation wastes the human's
  time; running Mode B silently when the human expected to be asked is
  disorienting.
- **Scope first.** A retro without a named period is a venting session. Pin
  the scope before any lens.
- **One probe per lens (Mode A).** More than one follow-up shifts from
  facilitation to interrogation.
- **Evidence only (Mode B).** Do not speculate beyond what the context supports.
  If an item is inferred rather than directly observed, say so.
- **Report, do not resolve.** Lacked and Longed for often contain tension.
  Surface the tension; do not smooth it in the output.
- **Separate lenses.** An item that belongs in Lacked should not also appear
  in Longed for. If overlap arises, place the item where it fits best and
  note the connection once.
- **House voice.** No em-dashes or en-dashes in the output document. Use
  colons, commas, or line breaks instead.
