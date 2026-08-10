// The voice atom: the text-level half of the CVI, computed. Two things are
// under test and the second one is the point.
//
// 1. Every rule catches its violation, on the right line.
// 2. Every rule stays silent where a NAIVE implementation would not. A regex
//    over the whole file finds an em dash in a code fence, in an inline code
//    span, in the YAML frontmatter and in a URL; a /  / scan finds a markdown
//    hard line break, a padded table cell and an indented line. Each of those
//    is a false positive that would make the atom unusable, so each has a test
//    of its own. The negatives here outnumber the positives on purpose.

import { describe, it, expect } from "vitest";
import { checkVoice, proseLines } from "../index.mjs";

const EM = "—";
const EN = "–";
const BOM = "﻿";

describe("checkVoice: the empty contract is inert", () => {
  // Load-bearing: khai's own plays, engines and composites do not conform to
  // the CVI. An atom that flagged anything by default would start enforcing a
  // house style nobody wired in.
  it("passes a document that breaks every rule when no contract is given", () => {
    const text = `We help you ${EM} really${EN}truly!  With [brackets] and {braces}.\n`;
    expect(checkVoice(text)).toEqual([]);
    expect(checkVoice(text, {})).toEqual([]);
    expect(checkVoice(text, null)).toEqual([]);
  });

  it("checks a rule only when its key is present", () => {
    const text = `a ${EM} b\n`;
    expect(checkVoice(text, { doubledSpace: true })).toEqual([]);
    expect(checkVoice(text, { emDashMax: 0 })).toHaveLength(1);
  });
});

describe("checkVoice: the em dash (CVI 06, 'it is not in the voice')", () => {
  it("flags an em dash, on the line it sits on", () => {
    const e = checkVoice(`one\ntwo\nthree ${EM} four\n`, { emDashMax: 0 });
    expect(e).toHaveLength(1);
    expect(e[0]).toMatch(/^line 3: 1 em dash \(max 0\)/);
    expect(e[0]).toContain("reach for a comma, colon or parentheses");
  });

  it("counts several on one line as one report carrying the count", () => {
    const e = checkVoice(`a ${EM} b ${EM} c ${EM} d\n`, { emDashMax: 0 });
    expect(e).toEqual([
      "line 1: 3 em dashes (max 0); the em dash is not in the voice, " +
        "reach for a comma, colon or parentheses",
    ]);
  });

  it("catches one at line start and one at line end", () => {
    const e = checkVoice(`${EM}leading\ntrailing${EM}\n`, { emDashMax: 0 });
    expect(e.map((s) => s.slice(0, 6))).toEqual(["line 1", "line 2"]);
  });

  it("honours a non-zero budget", () => {
    const text = `a ${EM} b\nc ${EM} d ${EM} e\n`;
    expect(checkVoice(text, { emDashMax: 1 })).toEqual([
      "line 2: 2 em dashes (max 1); the em dash is not in the voice, " +
        "reach for a comma, colon or parentheses",
    ]);
  });

  it("reads line numbers in the ORIGINAL text, past the frontmatter", () => {
    const e = checkVoice(`---\nkhai: piece\ntitle: X\n---\n\nprose ${EM} here\n`, {
      emDashMax: 0,
    });
    expect(e).toEqual([
      "line 6: 1 em dash (max 0); the em dash is not in the voice, " +
        "reach for a comma, colon or parentheses",
    ]);
  });

  it("survives CRLF input without shifting the line number", () => {
    const e = checkVoice(`one\r\ntwo ${EM} three\r\n`, { emDashMax: 0 });
    expect(e).toHaveLength(1);
    expect(e[0]).toMatch(/^line 2:/);
  });

  it("tolerates a leading BOM without shifting the line number", () => {
    const e = checkVoice(`${BOM}first\nsecond ${EM}\n`, { emDashMax: 0 });
    expect(e).toHaveLength(1);
    expect(e[0]).toMatch(/^line 2:/);
  });
});

describe("checkVoice: what is not prose is not a violation", () => {
  it("ignores an em dash inside a fenced code block", () => {
    expect(
      checkVoice(`prose\n\n\`\`\`js\nconst d = "${EM}";\n\`\`\`\n\nmore\n`, { emDashMax: 0 }),
    ).toEqual([]);
  });

  it("ignores an em dash inside a tilde fence, and inside an unclosed one", () => {
    expect(checkVoice(`~~~\nx ${EM} y\n~~~\n`, { emDashMax: 0 })).toEqual([]);
    expect(checkVoice(`a\n\`\`\`\nx ${EM} y\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("ignores an em dash inside an inline code span", () => {
    expect(checkVoice(`the flag \`--em ${EM} dash\` is code\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("ignores an em dash inside a multi-backtick code span holding a backtick", () => {
    expect(checkVoice(`a \`\`b \` ${EM} c\`\` d\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("still reads prose after a closed code span on the same line", () => {
    const e = checkVoice(`\`code\` then prose ${EM} here\n`, { emDashMax: 0 });
    expect(e).toHaveLength(1);
  });

  it("treats an unmatched backtick as a literal, not an opening delimiter", () => {
    // A naive `.*` span scan swallows the rest of the line and hides the dash.
    expect(checkVoice(`a \` b ${EM} c\n`, { emDashMax: 0 })).toHaveLength(1);
  });

  it("ignores an em dash inside the YAML frontmatter", () => {
    expect(checkVoice(`---\ntitle: A ${EM} B\n---\nclean prose\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("ignores frontmatter that does not even parse", () => {
    // checkFrontmatter reports the parse failure; the voice atom must not
    // suddenly start reading YAML as prose because js-yaml threw.
    expect(checkVoice(`---\nkhai: [unclosed ${EM}\n---\nclean\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("ignores an em dash in a link destination, an autolink and a bare URL", () => {
    expect(checkVoice(`see [x](https://e.com/a${EM}b)\n`, { emDashMax: 0 })).toEqual([]);
    expect(checkVoice(`see <https://e.com/a${EM}b>\n`, { emDashMax: 0 })).toEqual([]);
    expect(checkVoice(`see https://e.com/a${EM}b now\n`, { emDashMax: 0 })).toEqual([]);
    expect(checkVoice(`[ref]: https://e.com/a${EM}b\n`, { emDashMax: 0 })).toEqual([]);
  });

  it("DOES read a link's label: that text is prose the reader reads", () => {
    const e = checkVoice(`see [the fall ${EM} part two](piece_fall.md)\n`, { emDashMax: 0 });
    expect(e).toHaveLength(1);
    expect(e[0]).toMatch(/^line 1:/);
  });
});

describe("checkVoice: the en dash (CVI 06, never a break, never a range)", () => {
  it("flags an en dash used as a sentence break", () => {
    const e = checkVoice(`the read ${EN} and its cost\n`, { enDashMax: 0 });
    expect(e).toEqual([
      "line 1: 1 en dash (max 0); never as a sentence break, never in a numeric range, " +
        "use the spaced hyphen",
    ]);
  });

  it("flags an en dash in a numeric range", () => {
    expect(checkVoice(`400${EN}500\n`, { enDashMax: 0 })).toHaveLength(1);
  });

  it("leaves the sanctioned spaced hyphen alone (400 - 500 is the house form)", () => {
    expect(checkVoice("400 - 500 and 2006 - '12\n", { enDashMax: 0, emDashMax: 0 })).toEqual([]);
  });

  it("does not confuse an en dash with an em dash", () => {
    expect(checkVoice(`a ${EN} b\n`, { emDashMax: 0 })).toEqual([]);
    expect(checkVoice(`a ${EM} b\n`, { enDashMax: 0 })).toEqual([]);
  });
});

describe("checkVoice: the doubled space", () => {
  it("flags two spaces welded between two words", () => {
    const e = checkVoice("the read  and its cost\n", { doubledSpace: true });
    expect(e).toEqual(["line 1: doubled space between words; prose runs on single spaces"]);
  });

  it("flags a run of more than two", () => {
    expect(checkVoice("a     b\n", { doubledSpace: true })).toHaveLength(1);
  });

  it("reports the right line in a multi-line document", () => {
    const e = checkVoice("clean line\nanother clean one\nhere  it is\n", { doubledSpace: true });
    expect(e).toEqual(["line 3: doubled space between words; prose runs on single spaces"]);
  });

  it("does NOT flag indentation", () => {
    expect(
      checkVoice("- item\n  continued text\n    deeper text\n", { doubledSpace: true }),
    ).toEqual([]);
  });

  it("does NOT flag a markdown hard line break (two trailing spaces)", () => {
    expect(checkVoice("first line  \nsecond line\n", { doubledSpace: true })).toEqual([]);
  });

  it("does NOT flag padded cells in a pipe table, alignment row included", () => {
    const table = "| Name  | Type   |\n| ----- | ------ |\n| read  | piece  |\n";
    expect(checkVoice(table, { doubledSpace: true })).toEqual([]);
  });

  it("does NOT flag a pipe-less table padded up against its separator", () => {
    expect(
      checkVoice("Name | Type\n---- | ----\nread | piece\nfoo  | bar\n", {
        doubledSpace: true,
      }),
    ).toEqual([]);
  });

  it("does NOT flag spacing inside a code span or a code fence", () => {
    expect(checkVoice("run `a  b` now\n", { doubledSpace: true })).toEqual([]);
    expect(checkVoice("```\na  b\n```\n", { doubledSpace: true })).toEqual([]);
  });

  it("does NOT flag a line that is only whitespace", () => {
    expect(checkVoice("a\n   \nb\n", { doubledSpace: true })).toEqual([]);
  });

  it("survives CRLF: the stray CR must not read as a word character", () => {
    expect(checkVoice("first line  \r\nsecond\r\n", { doubledSpace: true })).toEqual([]);
    expect(checkVoice("here  it is\r\n", { doubledSpace: true })).toHaveLength(1);
  });
});

describe("checkVoice: brackets and braces (CVI 06, they belong to code)", () => {
  it("flags a square bracket and a brace in prose, one report per character", () => {
    const e = checkVoice("the read [an aside] and {a variable}\n", { brackets: true });
    expect(e).toHaveLength(4);
    expect(e[0]).toBe(
      'line 1: "[" in prose; square brackets and braces belong to code and variables',
    );
    expect(e.map((s) => s.match(/"(.)"/)[1])).toEqual(["[", "]", "{", "}"]);
  });

  it("does NOT flag markdown link and image syntax", () => {
    expect(
      checkVoice("see [the fall](piece_fall.md) and ![the mark](mark.svg)\n", { brackets: true }),
    ).toEqual([]);
  });

  it("does NOT flag a reference link, its definition, or a footnote marker", () => {
    expect(checkVoice("see [the fall][fall] now\n", { brackets: true })).toEqual([]);
    expect(checkVoice("[fall]: piece_fall.md\n", { brackets: true })).toEqual([]);
    expect(checkVoice("a claim[^1] here\n", { brackets: true })).toEqual([]);
  });

  it("does NOT flag a task-list checkbox", () => {
    expect(checkVoice("- [ ] open\n* [x] done\n", { brackets: true })).toEqual([]);
  });

  it("does NOT flag brackets inside code", () => {
    expect(checkVoice("call `fn([a], {b})` here\n", { brackets: true })).toEqual([]);
    expect(checkVoice("```\nconst a = [1, 2];\n```\n", { brackets: true })).toEqual([]);
  });
});

describe("checkVoice: first person singular (CVI 06, I, not we)", () => {
  it("flags each first-person plural pronoun it finds on the line", () => {
    const e = checkVoice("We read the room for us.\n", { firstPersonPlural: true });
    expect(e).toHaveLength(2);
    expect(e[0]).toBe(
      'line 1: first-person plural "we"; the practice speaks in the first person singular (I, not we)',
    );
  });

  it("matches whole words only, in any case", () => {
    // "weather" carries "we", "wears" carries "we"; only the standalone "us"
    // is the pronoun. A substring scan would report three.
    const e = checkVoice("The weather wears us out.\n", { firstPersonPlural: true });
    expect(e).toHaveLength(1);
    expect(e[0]).toContain('"us"');
    // Every default pronoun hidden inside a longer word: bus, course, wear,
    // ourselves inside "flavoursome" is a stretch, so "outsourced" carries our.
    expect(
      checkVoice("A bus, of course, wears the outsourced route.\n", { firstPersonPlural: true }),
    ).toEqual([]);
  });

  it("accepts a caller's own pronoun list in place of the default", () => {
    expect(checkVoice("We are here.\n", { firstPersonPlural: ["one"] })).toEqual([]);
    expect(checkVoice("One is here.\n", { firstPersonPlural: ["one"] })).toHaveLength(1);
  });

  it("does NOT flag a pronoun inside code or a URL", () => {
    expect(checkVoice("run `we build` now\n", { firstPersonPlural: true })).toEqual([]);
    expect(checkVoice("see https://e.com/our/page\n", { firstPersonPlural: true })).toEqual([]);
  });
});

describe("checkVoice: supplicant phrasing (CVI 06, state plainly what is done)", () => {
  it("flags a configured phrase, case-insensitively", () => {
    const e = checkVoice("I help you find clarity.\n", { supplicantPhrases: ["I help you"] });
    expect(e).toEqual(['line 1: supplicant phrasing "I help you"; state plainly what is done']);
    expect(checkVoice("i HELP you.\n", { supplicantPhrases: ["I help you"] })).toHaveLength(1);
  });

  it("checks nothing when the caller names no phrases", () => {
    expect(checkVoice("I help you.\n", { supplicantPhrases: [] })).toEqual([]);
    expect(checkVoice("I help you.\n", {})).toEqual([]);
  });

  it("does NOT flag a phrase inside a code span", () => {
    expect(checkVoice("run `I help you` now\n", { supplicantPhrases: ["I help you"] })).toEqual([]);
  });
});

describe("checkVoice: full stops over flourishes (CVI 06)", () => {
  it("flags a sentence over the word budget, on the line it starts", () => {
    const e = checkVoice("Short one.\nOne two three four five six seven.\n", {
      maxSentenceWords: 5,
    });
    expect(e).toEqual([
      "line 2: sentence of 7 words (max 5); two short sentences beat one long one",
    ]);
  });

  it("measures a sentence whole across a line wrap", () => {
    const e = checkVoice("One two three\nfour five six seven.\n", { maxSentenceWords: 5 });
    expect(e).toHaveLength(1);
    expect(e[0]).toMatch(/^line 1: sentence of 7 words/);
  });

  it("does not split a sentence on a decimal point", () => {
    expect(checkVoice("The read costs 3.5 units of it.\n", { maxSentenceWords: 20 })).toEqual([]);
    expect(checkVoice("The read costs 3.5 units of it.\n", { maxSentenceWords: 5 })).toHaveLength(
      1,
    );
  });

  it("does not measure a header or a code block as a sentence", () => {
    expect(
      checkVoice("## One two three four five six seven eight\n", { maxSentenceWords: 3 }),
    ).toEqual([]);
    expect(checkVoice("```\none two three four five\n```\n", { maxSentenceWords: 3 })).toEqual([]);
  });

  it("flags exclamation marks when the caller budgets them", () => {
    const e = checkVoice("Wow! Really!\n", { exclamationMax: 0 });
    expect(e).toEqual(["line 1: 2 exclamation marks (max 0); full stops over flourishes"]);
    expect(checkVoice("Wow!\n", { exclamationMax: 1 })).toEqual([]);
  });

  it("does not read an exclamation mark out of code or an image", () => {
    expect(checkVoice("run `a != b` now\n", { exclamationMax: 0 })).toEqual([]);
    expect(checkVoice("![the mark](mark.svg)\n", { exclamationMax: 0 })).toEqual([]);
  });
});

describe("checkVoice: composition and degenerate input", () => {
  it("reports every rule that fires, not just the first", () => {
    const e = checkVoice(`We  are ${EM} here.\n`, {
      emDashMax: 0,
      doubledSpace: true,
      firstPersonPlural: true,
    });
    expect(e).toHaveLength(3);
    expect(e.every((s) => s.startsWith("line 1:"))).toBe(true);
  });

  it("keeps line numbers exact with CRLF frontmatter above the prose", () => {
    const doc = `---\r\nkhai: piece\r\ntitle: X\r\n---\r\n\r\nprose ${EM} here\r\n`;
    expect(checkVoice(doc, { emDashMax: 0 })[0]).toMatch(/^line 6:/);
  });

  it("reads the last line of a document with no trailing newline", () => {
    expect(checkVoice(`one\ntwo ${EM}`, { emDashMax: 0 })[0]).toMatch(/^line 2:/);
  });

  it("still sees a doubled space that sits between two real words on a coded line", () => {
    // The masked code span is not a word character, so the gap beside it is not
    // read as a doubled space; the gap between "and" and "y" still is.
    const e = checkVoice("run `x`  and  y\n", { doubledSpace: true });
    expect(e).toEqual(["line 1: doubled space between words; prose runs on single spaces"]);
  });

  it("passes the empty string and a document of only frontmatter", () => {
    const all = { emDashMax: 0, enDashMax: 0, doubledSpace: true, brackets: true };
    expect(checkVoice("", all)).toEqual([]);
    expect(checkVoice("---\nkhai: piece\n---\n", all)).toEqual([]);
  });

  it("stays linear on a run of many backticks, and still sees the dash after it", () => {
    // Not at line start: 3+ backticks opening a line is a code fence, and the
    // rest of the document is correctly code. Mid-line it is an unmatched run,
    // which must fall through as literal text rather than swallow the line.
    const text = `a${"`".repeat(2000)} ${EM}\n`;
    const started = Date.now();
    expect(checkVoice(text, { emDashMax: 0 })).toHaveLength(1);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("treats a line that is only a long backtick run as a code fence", () => {
    // parse.mjs owns this reading (3+ backticks open a fence, unclosed runs to
    // EOF); the voice atom must agree with it, not second-guess it.
    expect(checkVoice(`${"`".repeat(2000)} ${EM}\n`, { emDashMax: 0 })).toEqual([]);
  });
});

describe("proseLines", () => {
  it("drops frontmatter and fenced blocks, keeping absolute line numbers", () => {
    const doc = "---\nkhai: piece\n---\nprose\n```\ncode\n```\ntail\n";
    expect(proseLines(doc).map((l) => [l.line, l.text])).toEqual([
      [4, "prose"],
      [8, "tail"],
      [9, ""],
    ]);
  });

  it("masks in place, so the masked line keeps the raw line's length", () => {
    const [only] = proseLines("a `code` b\n");
    expect(only.raw).toBe("a `code` b");
    expect(only.text).toHaveLength(only.raw.length);
    expect(only.text).not.toContain("code");
  });
});
