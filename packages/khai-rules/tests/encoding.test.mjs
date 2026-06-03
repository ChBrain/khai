// Loop 1: the encoding and filename atoms. Encoding guards what the reader and
// the model see (the bytes inside the file); filename guards that the file can
// be found and parsed at all (the path as a structured identifier).

import { describe, it, expect } from "vitest";
import { checkEncoding, checkFilename } from "../index.mjs";

const BOM = "﻿";
const EM_DASH = "—";
const EN_DASH = "–";
const FFFD = "�";

describe("checkEncoding", () => {
  it("passes clean UTF-8 text ending in LF", () => {
    expect(checkEncoding("hello world\n")).toEqual([]);
  });

  it("flags a leading BOM", () => {
    expect(checkEncoding(`${BOM}hello\n`)).toContain("BOM present");
  });

  it("flags CRLF line endings", () => {
    expect(checkEncoding("a\r\nb\n")).toContain("CRLF present");
  });

  it("flags an em-dash", () => {
    expect(checkEncoding(`a ${EM_DASH} b\n`)).toContain("en/em-dash present (use ' - ')");
  });

  it("flags an en-dash (the disguised dash)", () => {
    expect(checkEncoding(`a ${EN_DASH} b\n`)).toContain("en/em-dash present (use ' - ')");
  });

  it("flags a U+FFFD replacement character (a bad decode lost a character)", () => {
    expect(checkEncoding(`bad ${FFFD} char\n`)).toContain(
      "U+FFFD replacement character present (a bad decode lost a character)",
    );
  });

  it("flags a literal unicode escape leaking from a serialization layer", () => {
    expect(checkEncoding("a \\u2014 b\n")).toContain(
      "literal unicode escape present (e.g. \\u2014); write the character, not the escape",
    );
  });

  it("flags a missing LF at EOF", () => {
    expect(checkEncoding("no newline")).toContain("no LF at EOF");
  });

  it("reports every violation present, not just the first", () => {
    // em-dash and no trailing LF together.
    expect(checkEncoding(`a ${EM_DASH} b`)).toEqual([
      "en/em-dash present (use ' - ')",
      "no LF at EOF",
    ]);
  });

  it("treats the empty string as clean (no EOF requirement on no content)", () => {
    expect(checkEncoding("")).toEqual([]);
  });
});

describe("checkFilename", () => {
  it("passes a well-formed <type>_<descriptor>.md name", () => {
    expect(checkFilename("position_gender.md")).toEqual([]);
  });

  it("flags a hyphen (it breaks the underscore-delimited grammar)", () => {
    expect(checkFilename("position-gender.md")).toContain(
      'hyphen in filename "position-gender.md"; use an underscore',
    );
  });

  it("flags a non-ASCII character (it breaks portability)", () => {
    expect(checkFilename("persona_müller.md")).toContain(
      'non-ASCII filename "persona_müller.md"; use ASCII characters only',
    );
  });

  it("reports both faults when a name has a hyphen and a diacritic", () => {
    expect(checkFilename("café-bar.md")).toEqual([
      'non-ASCII filename "café-bar.md"; use ASCII characters only',
      'hyphen in filename "café-bar.md"; use an underscore',
    ]);
  });
});
