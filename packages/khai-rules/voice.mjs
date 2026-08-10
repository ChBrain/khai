// Voice atoms: the text-level half of the CVI (the house writing rules),
// computed. The CVI's §06 "Writing: voice & punctuation" declares what the
// copy may and may not do; this module turns the declarable half into one
// checkable atom. The visual half of the CVI (palette, page structure) is not
// portable and deliberately stays in the website repo.
//
// Two properties hold, and both are load-bearing:
//
// 1. **Contract as argument.** `checkVoice` knows no house style. Every rule is
//    off unless the caller's contract switches it on, so `checkVoice(text)`
//    with no contract returns []. khai's own plays, engines and composites do
//    not conform to the CVI; nothing here may start enforcing it. Composing
//    the atoms (and choosing over which files) is the caller's job, exactly as
//    it is for the rest of khai-rules.
// 2. **Markdown-aware.** A rule about prose must only read prose. Fenced code
//    blocks, inline code spans, YAML frontmatter, link destinations and URLs
//    are masked out before any rule looks at a line, so an em dash inside a
//    code span is not a violation and a doubled space in a table is not one
//    either. Line numbers stay absolute in the original text (masked spans are
//    replaced in place, never deleted), so a report points at the real line.

import { parseFrontmatter, fencedLines } from "./parse.mjs";

// The characters, written as escapes so this source file carries neither
// glyph: a file that hunts the em dash must not smuggle one in its own bytes.
const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

// The sentinel a masked character becomes. NUL is not a word character and not
// whitespace, so it neither joins a word (a doubled space beside a code span
// stays invisible to the word-to-word test) nor reads as a space.
const NUL = "\u0000";
const nuls = (n) => NUL.repeat(n);

// The house's first-person plural: the practice speaks as I, not we.
const PLURAL_PRONOUNS = ["we", "us", "our", "ours", "ourselves"];

/**
 * @typedef {Object} VoiceContract
 * @property {number} [emDashMax]        max em dashes per line (0 = none). CVI §06 "The em dash".
 * @property {number} [enDashMax]        max en dashes per line (0 = none). CVI §06 "The en dash".
 * @property {boolean} [doubledSpace]    flag two or more spaces between two word characters.
 * @property {boolean} [brackets]        flag [] and {} in prose. CVI §06 "Square brackets".
 * @property {boolean|string[]} [firstPersonPlural] flag we/us/our (or a caller's own list).
 * @property {string[]} [supplicantPhrases] phrases to flag. CVI §06 "Supplicant phrasing".
 * @property {number} [maxSentenceWords] max words in a sentence. CVI §06 "two short sentences".
 * @property {number} [exclamationMax]   max exclamation marks per line. CVI §06 "full stops
 *                                       over flourishes".
 */

/**
 * Check a markdown document against a voice contract. Returns a list of error
 * strings ("line N: ..."), empty means pass. Every rule is opt-in: an absent
 * (or undefined) contract key is not checked, so the default contract passes
 * anything.
 *
 * @param {string} text the whole file, frontmatter included
 * @param {VoiceContract} [contract]
 * @returns {string[]}
 */
export function checkVoice(text, contract = {}) {
  const {
    emDashMax,
    enDashMax,
    doubledSpace = false,
    brackets = false,
    firstPersonPlural = false,
    supplicantPhrases = [],
    maxSentenceWords,
    exclamationMax,
  } = contract ?? {};

  const lines = proseLines(text);
  const e = [];

  for (const { line, text: prose, raw } of lines) {
    if (Number.isFinite(emDashMax)) {
      const n = count(prose, EM_DASH);
      if (n > emDashMax)
        e.push(
          `line ${line}: ${plural(n, "em dash", "em dashes")} (max ${emDashMax}); ` +
            `the em dash is not in the voice, reach for a comma, colon or parentheses`,
        );
    }
    if (Number.isFinite(enDashMax)) {
      const n = count(prose, EN_DASH);
      if (n > enDashMax)
        e.push(
          `line ${line}: ${plural(n, "en dash", "en dashes")} (max ${enDashMax}); ` +
            `never as a sentence break, never in a numeric range, use the spaced hyphen`,
        );
    }
    // Two or more spaces WELDED BETWEEN WORD CHARACTERS. Anchoring on \w at
    // both ends is what makes this safe: leading indentation has no word
    // character before it, a markdown hard line break (two trailing spaces) has
    // none after it, and pipe-padded table cells pad up against a "|". Table
    // rows are skipped outright as well, for the pipe-less alignment case.
    if (doubledSpace && !isTableRow(raw) && /\w {2,}\w/.test(prose))
      e.push(`line ${line}: doubled space between words; prose runs on single spaces`);
    if (brackets) {
      for (const ch of ["[", "]", "{", "}"]) {
        if (prose.includes(ch)) {
          e.push(
            `line ${line}: "${ch}" in prose; ` +
              `square brackets and braces belong to code and variables`,
          );
        }
      }
    }
    if (firstPersonPlural) {
      const words = Array.isArray(firstPersonPlural) ? firstPersonPlural : PLURAL_PRONOUNS;
      for (const w of words) {
        const re = new RegExp(`\\b${escapeRe(w)}\\b`, "i");
        if (re.test(prose))
          e.push(
            `line ${line}: first-person plural "${w}"; ` +
              `the practice speaks in the first person singular (I, not we)`,
          );
      }
    }
    for (const phrase of supplicantPhrases) {
      if (!phrase) continue;
      if (prose.toLowerCase().includes(String(phrase).toLowerCase()))
        e.push(`line ${line}: supplicant phrasing "${phrase}"; state plainly what is done`);
    }
    if (Number.isFinite(exclamationMax)) {
      const n = count(prose, "!");
      if (n > exclamationMax)
        e.push(
          `line ${line}: ${plural(n, "exclamation mark", "exclamation marks")} ` +
            `(max ${exclamationMax}); full stops over flourishes`,
        );
    }
  }

  if (Number.isFinite(maxSentenceWords)) e.push(...longSentences(lines, maxSentenceWords));

  return e;
}

/**
 * The prose view of a markdown document: one entry per line that carries prose,
 * with everything that is not prose masked out in place.
 *
 * Dropped entirely: YAML frontmatter, fenced code blocks (fences included).
 * Masked to sentinels, preserving length and therefore the line's shape:
 * inline code spans, link and image destinations (the label survives, it is
 * prose), reference definitions, footnote and reference markers, task-list
 * checkboxes, autolinks and bare URLs.
 *
 * Two markdown constructs are knowingly NOT masked, both because masking them
 * costs more than it buys: an indented (four-space) code block, which is
 * indistinguishable from list-continuation prose without a block parser, and an
 * HTML comment. Content that uses either and wants a voice contract should
 * fence its code and keep its asides in prose.
 *
 * @param {string} text
 * @returns {{ line: number, text: string, raw: string }[]} `line` is 1-based in
 *   the ORIGINAL text; `text` is the masked prose; `raw` is the line as written.
 */
export function proseLines(text) {
  let str = String(text ?? "");
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1); // a BOM shifts no line
  const lines = str.split(/\r?\n/); // CRLF must not leave a \r in the prose
  const skip = frontmatterLineCount(str);
  // Run the fence scan over the body only: a "```" inside the YAML block would
  // otherwise open a fence that swallows the document.
  const fenced = fencedLines(lines.slice(skip));

  const out = [];
  for (let i = skip; i < lines.length; i++) {
    if (fenced[i - skip]) continue;
    out.push({ line: i + 1, text: maskInline(lines[i]), raw: lines[i] });
  }
  return out;
}

/** How many leading lines the YAML frontmatter block occupies (0 if none). */
function frontmatterLineCount(str) {
  let content;
  try {
    content = parseFrontmatter(str).content;
  } catch {
    // Malformed YAML: parseFrontmatter throws, but the block is still not
    // prose. Fall back to the same fence rule, counting lines instead of
    // loading them. (checkFrontmatter is what reports the parse failure.)
    const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
    return m ? countLines(m[0]) : 0;
  }
  if (content === str) return 0;
  return countLines(str.slice(0, str.length - content.length));
}

function countLines(chunk) {
  let n = 0;
  for (let i = 0; i < chunk.length; i++) if (chunk[i] === "\n") n++;
  return n;
}

/**
 * Mask everything on one line that is not prose. Order matters: code spans go
 * first (a code span may contain anything, brackets and URLs included), then
 * the link constructs, then what is left that looks like a URL.
 */
function maskInline(line) {
  let m = maskCodeSpans(line);
  // A link reference definition (`[ref]: https://...`) is machinery, not prose.
  if (/^ {0,3}\[[^\]]*\]:/.test(m)) return nuls(m.length);
  // Inline link / image: keep the label (it is prose the reader reads), mask
  // the brackets, the parentheses and the destination.
  m = m.replace(
    /(!?)\[([^\[\]]*)\]\(([^()\s]*)\)/g,
    (_all, bang, label, dest) => nuls(bang.length + 1) + label + nuls(1 + 1 + dest.length + 1),
  );
  // Reference link (`[label][ref]`) and footnote marker (`[^1]`).
  m = m.replace(/\[\^[^\]\s]*\]/g, (all) => nuls(all.length));
  m = m.replace(
    /\[([^\[\]]*)\]\[([^\[\]]*)\]/g,
    (_all, label, ref) => nuls(1) + label + nuls(1 + 1 + ref.length + 1),
  );
  // Task-list checkbox (`- [ ]`, `* [x]`).
  m = m.replace(/^(\s*[-*+]\s+)(\[[ xX]\])/, (_all, lead, box) => lead + nuls(box.length));
  // Autolink (`<https://...>`, `<a@b.c>`) and a bare URL.
  m = m.replace(/<[a-z][a-z0-9+.-]*:[^>\s]*>/gi, (all) => nuls(all.length));
  m = m.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, (all) => nuls(all.length));
  m = m.replace(/\bwww\.\S+/gi, (all) => nuls(all.length));
  return m;
}

/**
 * Mask CommonMark inline code spans. Hand-scanned rather than matched with a
 * backreferencing regex: the delimiter is a run of N backticks closed by the
 * next run of exactly N, and a scanner does that in linear time on adversarial
 * input (a line of many backticks) where the regex form backtracks.
 */
function maskCodeSpans(line) {
  let out = "";
  let i = 0;
  while (i < line.length) {
    if (line[i] !== "`") {
      out += line[i];
      i++;
      continue;
    }
    const n = runLength(line, i);
    let close = -1;
    let j = i + n;
    while (j < line.length) {
      if (line[j] !== "`") {
        j++;
        continue;
      }
      const m = runLength(line, j);
      if (m === n) {
        close = j;
        break;
      }
      j += m;
    }
    if (close === -1) {
      // An unmatched run is a literal backtick, not an opening delimiter.
      out += line.slice(i, i + n);
      i += n;
      continue;
    }
    out += nuls(close + n - i);
    i = close + n;
  }
  return out;
}

/** Length of the run of backticks starting at `i`. */
function runLength(line, i) {
  let n = 0;
  while (i + n < line.length && line[i + n] === "`") n++;
  return n;
}

/**
 * A markdown table row: a pipe-led row, or the alignment row under a header.
 * Cells are padded with runs of spaces to line the columns up, which is layout,
 * not prose spacing.
 */
function isTableRow(raw) {
  const t = raw.trim();
  if (t.startsWith("|")) return true;
  return /^:?-{3,}:?(\s*\|\s*:?-{3,}:?)+$/.test(t);
}

/**
 * "Two short sentences beat one long one", computed: flag every sentence over
 * `max` words, reporting the line the sentence STARTS on. Sentences are read
 * per paragraph, so one that runs across a line wrap is measured whole.
 *
 * A full stop counts as a terminator only when whitespace or end-of-paragraph
 * follows it, so "3.5" does not split a sentence. An abbreviation ("e.g. ")
 * does split one; that direction only ever under-reports, which is the right
 * way for a rule to be wrong.
 */
function longSentences(lines, max) {
  const e = [];
  for (const para of paragraphs(lines)) {
    let joined = "";
    const lineAt = [];
    for (const entry of para) {
      if (joined.length) {
        joined += " ";
        lineAt.push(entry.line);
      }
      for (let i = 0; i < entry.text.length; i++) {
        joined += entry.text[i];
        lineAt.push(entry.line);
      }
    }
    for (const { start, end } of sentenceSpans(joined)) {
      const words = joined
        .slice(start, end)
        .split(/\s+/)
        .filter((w) => /[A-Za-z0-9]/.test(w));
      if (words.length <= max) continue;
      // Point at the line the first WORD of the sentence sits on, not the
      // whitespace the previous sentence left behind.
      let at = start;
      while (at < end && /\s/.test(joined[at])) at++;
      e.push(
        `line ${lineAt[at] ?? para[0].line}: sentence of ${words.length} words ` +
          `(max ${max}); two short sentences beat one long one`,
      );
    }
  }
  return e;
}

/**
 * Split a paragraph into sentence spans. A terminator run ends a sentence only
 * when whitespace or end-of-paragraph follows it, which is what keeps "3.5"
 * and "e.g" from cutting one in half mid-token. Hand-scanned in one pass, so
 * the cost is linear in the paragraph's length.
 */
function sentenceSpans(joined) {
  const spans = [];
  let start = 0;
  for (let i = 0; i < joined.length; i++) {
    if (!".!?".includes(joined[i])) continue;
    let j = i;
    while (j + 1 < joined.length && ".!?".includes(joined[j + 1])) j++;
    const next = joined[j + 1];
    if (next !== undefined && !/\s/.test(next)) {
      i = j; // mid-token punctuation ("3.5"): not a boundary
      continue;
    }
    spans.push({ start, end: j + 1 });
    start = j + 1;
    i = j;
  }
  if (joined.slice(start).trim()) spans.push({ start, end: joined.length });
  return spans;
}

/**
 * Group prose lines into paragraphs: runs of adjacent, non-blank lines. A
 * header, a table row and a blank line all break the run, and a header is never
 * a sentence (it carries no full stop and is not measured).
 */
function paragraphs(lines) {
  const out = [];
  let cur = [];
  let prev = null;
  const flush = () => {
    if (cur.length) out.push(cur);
    cur = [];
  };
  for (const entry of lines) {
    const isBreak =
      !entry.text.trim() || /^ {0,3}#{1,6}(?:[ \t]|$)/.test(entry.raw) || isTableRow(entry.raw);
    if (isBreak || (prev !== null && entry.line !== prev + 1)) flush();
    if (!isBreak) cur.push(entry);
    prev = entry.line;
  }
  flush();
  return out;
}

function count(str, ch) {
  let n = 0;
  for (let i = 0; i < str.length; i++) if (str[i] === ch) n++;
  return n;
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
