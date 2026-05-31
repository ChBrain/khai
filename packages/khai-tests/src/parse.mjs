// Minimal, dependency-light markdown structural parser for khai content files.
// We only need frontmatter + the header tree + section bodies; no full AST.

import matter from "gray-matter";

/**
 * @typedef {{ level: number, text: string, line: number }} Header
 * @typedef {{ data: Record<string, unknown>, ok: boolean, error?: string,
 *             body: string, headers: Header[] }} ParsedDoc
 */

/** Parse frontmatter + body, and index every ATX header in document order. */
export function parseDoc(text) {
  let data = {};
  let ok = true;
  let error;
  let body = text;
  try {
    const m = matter(text);
    data = m.data;
    body = m.content;
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
  }

  const headers = [];
  body.split("\n").forEach((line, i) => {
    // Match only the leading hashes; slice and trim the remainder in JS.
    // Keeping the regex to a single bounded quantifier (no whitespace-vs-rest
    // overlap) avoids polynomial backtracking on adversarial input.
    const h = /^(#{1,6})(?=[ \t])/.exec(line);
    if (h) {
      const text = line.slice(h[1].length).trim();
      if (text) headers.push({ level: h[1].length, text, line: i + 1 });
    }
  });

  return { data, ok, error, body, headers };
}

/**
 * Return the lines of the section introduced by the given `## <name>` header,
 * up to the next header of the same-or-shallower level. Empty array if absent.
 */
export function sectionBody(body, name, level = 2) {
  const lines = body.split("\n");
  const open = new RegExp(`^#{${level}}\\s+${escapeRe(name)}\\s*$`);
  const start = lines.findIndex((l) => open.test(l));
  if (start === -1) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    const h = /^(#{1,6})\s+/.exec(lines[i]);
    if (h && h[1].length <= level) break;
    out.push(lines[i]);
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
