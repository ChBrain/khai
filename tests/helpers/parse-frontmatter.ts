import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv, { type ValidateFunction } from "ajv";
import yaml from "js-yaml";

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
  const parsed = matter(text);
  return { data: parsed.data, body: parsed.content };
}

export function loadValidator(repoRoot: string): ValidateFunction {
  const schemaText = readFileSync(join(repoRoot, "architecture", "_schema.yml"), "utf-8");
  const schema = yaml.load(schemaText);
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(schema as object);
}
