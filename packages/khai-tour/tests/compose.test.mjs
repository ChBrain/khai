import { describe, it, expect } from "vitest";
import { composeInstructions, HOUSE_RULES, VENUE_ADAPTIONS } from "../lib/compose.mjs";

// Fixture stage: prove the compose rule against the known-good Perplexity output
// (the artifact tested by hand in a Perplexity Space). The Prose Standard is
// inlined here as a fixture; the real fix reads it from @chbrain/khai-engine-spine
// and relocates the adaption into spine/perplexity/.

// The Prose Standard body (frontmatter already stripped, H1 still present).
const PROSE_STANDARD = `# Instructions: Prose

## Human

- Sets the Scene.
- Provides Conditions.
- Can join, but only if stating it explicit.

## Agent

- Speaks through Personas.
- Acts through Personas.
- Observes the Environment through Personas.
- Narrates the Environment to bridge where needed through Scenes.
- Everything is a Scene.

## Collaboration

- Personas interact with each other through words and actions.
- One move triggers the next.
  - The Persona most moved by what just happened responds.
  - Not a rotation.
  - A Persona might be skipped.
  - A Persona might move twice.
  - Silence is a move.
- The Collaboration rests when it has nowhere left to go.
- The Scene remains open.

## Knowledge

- Behavior is evidence.

## System

### Play Mode

- The Narrator does not invite the Human into the Scene.
- The Narrator does not explain the Scene.
- The Narrator does not explain the behavior.
- Explains only if explicit asked by the Human.

### Analysis Mode

- Only opened when the Human asks for it.
`;

// The deployed Perplexity instructions (chapters only: no frontmatter, no H1),
// = Prose Standard + house rules + the Perplexity adaption injected at System.
const PERPLEXITY_DEPLOYED = `## Human

- Sets the Scene.
- Provides Conditions.
- Can join, but only if stating it explicit.

## Agent

- Speaks through Personas.
- Acts through Personas.
- Observes the Environment through Personas.
- Narrates the Environment to bridge where needed through Scenes.
- Everything is a Scene.

## Collaboration

- Personas interact with each other through words and actions.
- One move triggers the next.
  - The Persona most moved by what just happened responds.
  - Not a rotation.
  - A Persona might be skipped.
  - A Persona might move twice.
  - Silence is a move.
- The Collaboration rests when it has nowhere left to go.
- The Scene remains open.

## Knowledge

- Behavior is evidence.

## System

- no em-dash / no en-dash / no dash in prose text.
- no Follow-Up Questions

### Play Mode

- The Narrator does not invite the Human into the Scene.
- The Narrator does not explain the Scene.
- The Narrator does not explain the behavior.
- Explains only if explicit asked by the Human.

### Analysis Mode

- Only opened when the Human asks for it.
`;

describe("composeInstructions", () => {
  it("reproduces the deployed Perplexity instructions (Prose x Perplexity)", () => {
    const out = composeInstructions(PROSE_STANDARD, {
      houseRules: HOUSE_RULES,
      adaption: VENUE_ADAPTIONS.perplexity_space,
    });
    expect(out).toBe(PERPLEXITY_DEPLOYED);
  });

  it("drops the H1 title (the deployed contract is chapters only)", () => {
    const out = composeInstructions(PROSE_STANDARD);
    expect(out.startsWith("## Human")).toBe(true);
    expect(out).not.toContain("# Instructions: Prose");
  });

  it("injects engines under Knowledge, each as a bullet", () => {
    const out = composeInstructions(PROSE_STANDARD, {
      engines: ["Gender (the read the room applies before a Persona speaks)"],
    });
    expect(out).toMatch(
      /## Knowledge\n\n- Behavior is evidence\.\n- Gender \(the read the room applies before a Persona speaks\)\n/,
    );
  });

  it("with no options, only the title is dropped (System unchanged)", () => {
    const out = composeInstructions(PROSE_STANDARD);
    expect(out).toContain("## System\n\n### Play Mode");
  });
});
