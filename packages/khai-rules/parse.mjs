// Minimal, dependency-light markdown structural parser for khai content files.
// We only need frontmatter + the header tree + section bodies; no full AST.

import { load as yamlLoad } from "js-yaml";

/**
 * @typedef {{ level: number, text: string, line: number }} Header
 * @typedef {{ data: Record<string, unknown>, ok: boolean, error?: string,
 *             body: string, headers: Header[] }} ParsedDoc
 */

/**
 * Split a khai content file into its YAML frontmatter object and its body — the
 * single surface the kit ever needed from gray-matter. Frontmatter opens only
 * when the very first line is a `---` fence and runs to the next `---` fence; the
 * body is the original bytes after it (line endings preserved, so header line
 * numbers and CRLF checks stay exact). A leading BOM is tolerated. YAML loads
 * with js-yaml's safe default loader (no custom types), which **throws** on a
 * malformed block so callers can surface a parse failure instead of guessing.
 * Built on js-yaml 5.x, which closes the merge-key DoS the 3.x line (pulled in by
 * gray-matter) is exposed to.
 * @param {string} text
 * @returns {{ data: Record<string, unknown>, content: string }}
 */
export function parseFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1); // strip a leading UTF-8 BOM
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { data: {}, content: str };
  const loaded = yamlLoad(m[1]);
  const data = loaded && typeof loaded === "object" ? loaded : {};
  return { data, content: str.slice(m[0].length) };
}

/** Parse frontmatter + body, and index every ATX header in document order. */
export function parseDoc(text) {
  let data = {};
  let ok = true;
  let error;
  let body = text;
  try {
    const m = parseFrontmatter(text);
    data = m.data;
    body = m.content;
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : String(err);
  }

  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  const headers = [];
  lines.forEach((line, i) => {
    // A `## ` inside a fenced code block is example text, not structure -- it
    // must never be indexed as a header, or a doc missing a real section but
    // showing one in a code sample would validate as correct.
    if (fenced[i]) return;
    // Match only the leading hashes; slice and trim the remainder in JS.
    // Keeping the regex to a single bounded quantifier (no whitespace-vs-rest
    // overlap) avoids polynomial backtracking on adversarial input.
    const h = /^(#{1,6})(?=[ \t])/.exec(line);
    if (h) {
      // Strip a closed-ATX trailing run (`## Has ##` -> "Has"): a run of `#` at
      // end of line preceded by whitespace. A `#` not preceded by a space (e.g.
      // "C#") is part of the text and kept. Without this, `## Has ##` indexed as
      // "Has ##" while sectionBody looked for "Has", desyncing the checks. Done
      // in JS, not a `\s+...$` regex, to avoid polynomial backtracking (ReDoS)
      // on a line of many trailing spaces.
      let text = line.slice(h[1].length).trim();
      if (text.endsWith("#")) {
        let j = text.length;
        while (j > 0 && text[j - 1] === "#") j--;
        if (j > 0 && /\s/.test(text[j - 1])) text = text.slice(0, j).trimEnd();
      }
      if (text) headers.push({ level: h[1].length, text, line: i + 1 });
    }
  });

  return { data, ok, error, body, headers };
}

/**
 * Mark which body lines fall inside a fenced code block (``` or ~~~), so a
 * header scan can skip them. A fence opens on a line of 3+ backticks or tildes
 * and closes on a line of the same character, at least as long, with only
 * whitespace after it (CommonMark). The delimiter lines themselves are marked
 * fenced too -- they never look like headers, and it keeps the walk in one
 * place. An unclosed fence runs to end-of-document, as Markdown specifies.
 */
function fencedLines(lines) {
  const fenced = new Array(lines.length).fill(false);
  let marker = null; // the opening run, e.g. "```" or "~~~~"
  for (let i = 0; i < lines.length; i++) {
    if (marker === null) {
      const open = /^\s*(`{3,}|~{3,})/.exec(lines[i]);
      if (open) {
        marker = open[1];
        fenced[i] = true;
      }
    } else {
      fenced[i] = true;
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(lines[i]);
      if (close && close[1][0] === marker[0] && close[1].length >= marker.length) {
        marker = null;
      }
    }
  }
  return fenced;
}

/**
 * Return the lines of the section introduced by the given `## <name>` header,
 * up to the next header of the same-or-shallower level. Empty array if absent.
 */
export function sectionBody(body, name, level = 2) {
  const lines = body.split("\n");
  const fenced = fencedLines(lines);
  // Tolerate a closed-ATX trailing run (`## Has ##`) so the section body still
  // resolves under the same name parseDoc indexed.
  const open = new RegExp(`^#{${level}}\\s+${escapeRe(name)}(?:\\s+#+)?\\s*$`);
  const start = lines.findIndex((l, i) => !fenced[i] && open.test(l));
  if (start === -1) return null;
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    // Only a real (unfenced) header of the same-or-shallower level ends the
    // section; a `## ` inside a code sample in the body does not.
    if (!fenced[i]) {
      const h = /^(#{1,6})\s+/.exec(lines[i]);
      if (h && h[1].length <= level) break;
    }
    out.push(lines[i]);
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
