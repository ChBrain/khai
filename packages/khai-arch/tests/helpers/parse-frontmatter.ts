import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv, { type ValidateFunction } from "ajv";
import * as yaml from "js-yaml";

export interface Frontmatter {
  id: string;
  type: string;
  class: "system" | "element" | "meta";
  mnemonic: string;
  chapters: string[];
  subtitle: string;
  status: "draft" | "published";
  version: string;
}

export function parse(text: string): { data: Record<string, unknown>; body: string } {
  // Mirror the package's own frontmatter split (js-yaml 5.x), so the test
  // parses exactly as index.mjs does without re-introducing gray-matter.
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { data: {}, body: str };
  const loaded = yaml.load(m[1]);
  return {
    data: (loaded && typeof loaded === "object" ? loaded : {}) as Record<string, unknown>,
    body: str.slice(m[0].length),
  };
}

export function loadValidator(repoRoot: string): ValidateFunction {
  const schemaText = readFileSync(join(repoRoot, "architecture", "_schema.yml"), "utf-8");
  const schema = yaml.load(schemaText);
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(schema as object);
}
