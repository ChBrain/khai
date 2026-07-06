import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, basename, relative, isAbsolute } from "node:path";
import * as yaml from "js-yaml";
import LanguageDetect from "languagedetect";
import { francAll } from "franc-all";

// Split a content file's YAML frontmatter from its body, on js-yaml 5.x (named exports only) — the
// merge-key quadratic-DoS in gray-matter's bundled js-yaml 3.x (GHSA-h67p-54hq-rp68)
// is closed here. Frontmatter opens only on a leading `---` fence; a malformed
// block throws, matching the prior gray-matter behaviour the caller already absorbs.
function parseFrontmatter(text) {
  let str = String(text);
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(str);
  if (!m) return { data: {}, content: str };
  const loaded = yaml.load(m[1]);
  return {
    data: loaded && typeof loaded === "object" ? loaded : {},
    content: str.slice(m[0].length),
  };
}

const lngDetector = new LanguageDetect();

// Every language languagedetect identifies reliably — its own prose comes back
// as the top hit — so each can be declared (`language: <code>`) and gated
// locally. The languages languagedetect cannot separate are routed to franc
// instead (FRANC_MAP, below). See LANGUAGES.md for the few that stay exempt.
// A language given here is detected; one declared only via `khai.languages` is exempt.
const ISO_MAP = {
  // West & South European
  en: "english",
  de: "german",
  fr: "french",
  nl: "dutch",
  it: "italian",
  es: "spanish",
  pt: "portuguese",
  // Nordic
  da: "danish",
  sv: "swedish",
  no: "norwegian",
  fi: "finnish",
  is: "icelandic",
  // Central / Southeast European (Latin script)
  pl: "polish",
  hu: "hungarian",
  ro: "romanian",
  hr: "croatian",
  // Czech rides languagedetect, not franc: franc tops `ces` on most prose but
  // occasionally blows up (one sample read as French), whereas languagedetect's
  // only confusion is its Slovak sibling — always within the 0.1 margin. So Czech
  // gates here at the tight-cluster grade (gross-error catch only; it won't split
  // Czech from Slovak), the languagedetect counterpart of Serbian/Bulgarian.
  cs: "czech",
  sk: "slovak",
  sl: "slovene",
  sq: "albanian",
  // Baltic
  lt: "lithuanian",
  lv: "latvian",
  et: "estonian",
  // Celtic / classical
  cy: "welsh",
  la: "latin",
  // Middle East / South Asia (distinct scripts, cleanly separated)
  ar: "arabic",
  fa: "farsi",
  ur: "urdu",
  hi: "hindi",
  bn: "bengali",
  // Central Asia (Cyrillic but distinct from the Slavic cluster)
  kk: "kazakh",
  mn: "mongolian",
  // Africa / Pacific / Southeast Asia
  sw: "swahili",
  so: "somali",
  ha: "hausa",
  haw: "hawaiian",
  id: "indonesian",
  ceb: "cebuano",
};

// franc-routed languages: those languagedetect cannot separate but franc gates
// without false-failing. Values are the ISO 639-3 code franc emits (note Nepali's
// individual code `npi`). Kept separate from ISO_MAP so the languagedetect path
// stays untouched; detection picks the engine per resolved language.
//
// Two grades here. The first block detects cleanly (its own prose tops the list).
// The second is the tight-cluster grade: franc's *top* may be a sibling (Serbian
// reads as Bosnian, Bulgarian as Macedonian, Turkish as Azeri), but the declared
// language stays within the 0.1 confidence margin, so correct prose still passes
// and only a GROSS mismatch (e.g. English in a Serbian house) is flagged. It is a
// weaker gate — it will not split Serbian from Bosnian — but it is gating, which
// is preferred over dropping the language to NLP. Azeri rides this tier too (the
// Oghuz Turkic cluster); Czech is the notable one routed via languagedetect instead.
const FRANC_MAP = {
  // Clean detection (own prose tops)
  nds: "nds", // Low German — the driving case
  hsb: "hsb", // Upper Sorbian (West Slavic regional language of Germany; isolated)
  el: "ell", // Greek
  ca: "cat", // Catalan (also covers Valencian — same language under ISO, the Moldovan/`ro` precedent)
  eu: "eus", // Basque
  gl: "glg", // Galician (own prose tops clean; Portuguese sibling ~0.93 back, within-margin only in the reverse direction — the Galician-Portuguese cluster)
  oc: "oci", // Occitan / Aranese (Catalonia's third official language; clean top, Catalan sibling ~0.86 back)
  ast: "ast", // Asturian (own prose tops clean 4/5 registers, Occitan ties one within 0.045; Castilian impostor gap ~0.10, borderline like gl)
  // Italy — regional / minority languages (Sardinian rides franc's Logudorese code)
  sc: "src", // Sardinian (franc emits `src`, Logudorese; own prose tops clean, Italian/French/German far back)
  fur: "fur", // Friulian (Rhaeto-Romance, Friuli; clean top, Italian/French siblings ~0.78 back)
  lld: "lld", // Ladin (Rhaeto-Romance, Dolomites; clean top, isolated)
  // France — regional languages (Occitan `oc` already registered above)
  br: "bre", // Breton (Brythonic Celtic; clean top, no near sibling)
  co: "cos", // Corsican (Italo-Romance; clean own prose, Italian near-sibling gap ~0.16, Romagnol can tie one sample within margin)
  vi: "vie", // Vietnamese
  tl: "tgl", // Tagalog
  ht: "hat", // Haitian Creole (Kreyòl; French-lexified but tops cleanly, French ~0.65 back)
  ne: "npi", // Nepali (individual code)
  ru: "rus", // Russian
  uk: "ukr", // Ukrainian
  be: "bel", // Belarusian (East Slavic; tops cleanly, Ukrainian sibling ~0.3 back)
  mk: "mkd", // Macedonian
  gd: "gla", // Scottish Gaelic
  mt: "mlt", // Maltese (Semitic + Latin script; uniquely distinctive, no near sibling)
  lb: "ltz", // Luxembourgish (NATO / Benelux; German sibling ~0.2 back)
  // Tight-cluster grade: gross-error catch only (within-margin of a sibling top)
  bg: "bul", // Bulgarian (sibling top: Macedonian)
  sr: "srp", // Serbian (sibling top: Bosnian)
  bs: "bos", // Bosnian (Serbo-Croatian cluster attractor; siblings within margin)
  cnr: "cnr", // Montenegrin (Serbo-Croatian cluster, sibling top: Bosnian)
  tr: "tur", // Turkish (sibling top: Azeri)
  uz: "uzn", // Uzbek
  ga: "gle", // Irish (sibling top: Scottish Gaelic — Goidelic cluster)
  sco: "sco", // Scots (sibling top: English)
  // Commonwealth — South Asia (distinct scripts, own prose tops cleanly)
  ta: "tam", // Tamil
  te: "tel", // Telugu
  gu: "guj", // Gujarati
  pa: "pan", // Punjabi (Gurmukhi)
  si: "sin", // Sinhala
  // Commonwealth — Africa (own prose tops; Nguni pair sit within each other's margin)
  ig: "ibo", // Igbo
  af: "afr", // Afrikaans
  zu: "zul", // Zulu (sibling: Xhosa — Nguni cluster, within margin)
  xh: "xho", // Xhosa (sibling: Zulu — Nguni cluster, within margin)
  // Commonwealth — Southeast Asia
  ms: "zlm", // Malay (franc's Malay code; near-sibling Indonesian routes via languagedetect `id`)
  // Commonwealth — Pacific (own prose tops cleanly)
  mi: "mri", // Maori
  fj: "fij", // Fijian
  sm: "smo", // Samoan
  to: "ton", // Tongan
  // Pacific / Oceania — Melanesian creoles + Micronesian/Polynesian
  tpi: "tpi", // Tok Pisin (PNG)
  bis: "bis", // Bislama (Vanuatu)
  pis: "pis", // Pijin (Solomon Is.; sibling Bislama within margin — Melanesian creole cluster)
  cha: "cha", // Chamorro (Guam)
  tah: "tah", // Tahitian (sibling Rarotongan within margin — East Polynesian cluster)
  mah: "mah", // Marshallese
  pau: "pau", // Palauan
  // East Asia / Southeast Asia — distinct scripts, all top cleanly. The spaceless
  // ones are scriptio continua; the span gate measures them by character count
  // (see DENSE_SCRIPT_RE) so detection actually runs.
  // (Vietnamese `vi` is already registered above; it uses spaces.)
  zh: "cmn", // Chinese (Mandarin)
  ja: "jpn", // Japanese
  ko: "kor", // Korean (Hangul; uses spaces)
  th: "tha", // Thai
  km: "khm", // Khmer
  lo: "lao", // Lao
  my: "mya", // Burmese
  bo: "bod", // Tibetan
  // Maritime SE Asia (Latin script, spaced)
  tet: "tet", // Tetum (Timor-Leste; tops cleanly, sibling tdt is its own Dili variety)
  // South Asia — distinct Brahmic scripts, all top cleanly (gated by character
  // count, since these scripts are agglutinative: a full sentence is ~10 words).
  mr: "mar", // Marathi (Devanagari; Hindi not even a near sibling)
  kn: "kan", // Kannada
  ml: "mal", // Malayalam
  // Middle East
  he: "heb", // Hebrew (Yiddish sibling far below)
  ps: "pbu", // Pashto (franc's Northern Pashto code; Persian ~0.68 back)
  // Central Asia
  ky: "kir", // Kyrgyz
  tg: "tgk", // Tajik (Persian in Cyrillic; Uzbek ~0.65 back)
  tk: "tuk", // Turkmen
  // Tight-cluster grade: Azeri rides the Oghuz Turkic cluster
  az: "azj", // Azerbaijani (North, Latin; siblings Gagauz/Turkish within margin)
  // Africa (beyond the Commonwealth ig/af/zu/xh + built-in sw/so/ha slice)
  // Horn (Tigrinya gates; Amharic false-fails to it, so Amharic is exempt)
  ti: "tir", // Tigrinya (Ge'ez; Amharic far below on Tigrinya prose)
  om: "gaz", // Oromo (franc's West-Central Oromo code)
  // Bantu — East/Central/Southern
  rw: "kin", // Kinyarwanda (sibling Kirundi `run` within margin — tight-cluster)
  sn: "sna", // Shona
  st: "sot", // Sesotho (Sotho-Tswana siblings nso/tsn within margin)
  lg: "lug", // Luganda
  ln: "lin", // Lingala (Kongo siblings ktu/kng within margin)
  // West Africa & Sahel
  yo: "yor", // Yoruba (clean — overturns the early world-probe fail)
  wo: "wol", // Wolof
  bm: "bam", // Bambara (sibling Maninka `emk` within margin — tight-cluster)
  tw: "twi", // Twi / Akan (sibling Fante `fat` within margin)
  // Island — Indian Ocean
  mg: "plt", // Malagasy (franc's Plateau Malagasy code)
  crs: "crs", // Seychellois Creole / Seselwa (French-lexified; tops clean, French ~0.76 back — sister Mauritian Morisien `mfe` has no franc model and stays exempt)
  // Caucasus — unique alphabets, fully isolated (nothing else in the ranking)
  ka: "kat", // Georgian (Mkhedruli)
  hy: "hye", // Armenian
  // Africa, round 2 — Sotho-Tswana, Nguni, and Bantu/Niger-Congo nationals.
  // Each tops its own prose; close siblings sit within the margin (gross-error grade).
  rn: "run", // Kirundi (Burundi; Kinyarwanda `kin` sibling within margin)
  tn: "tsn", // Tswana (Botswana; Sotho-Tswana cluster)
  ts: "tso", // Tsonga (South Africa)
  ve: "ven", // Venda (South Africa)
  ss: "ssw", // Swati (Eswatini; Nguni cluster with Zulu/Xhosa)
  nso: "nso", // Sepedi / Northern Sotho (South Africa; Sotho-Tswana cluster)
  ee: "ewe", // Ewe (Togo/Ghana)
  ff: "fuv", // Fula (franc's Nigerian Fulfulde; Pular `fuf` sibling within margin)
  tzm: "tzm", // Tamazight (Morocco; Latin/Berber-Latin — Tifinagh untested)
  sg: "sag", // Sango (CAR; sibling Lingala within margin — tight-cluster)
  kg: "kng", // Kikongo (Congo; sibling Kituba `ktu` within margin — tight-cluster)
  // West African creoles / lingua francas (own prose tops; Cape Verdean Kriolu
  // stays exempt — it false-fails to Guinea-Bissau Kriol, the Upper Guinea sibling).
  pov: "pov", // Guinea-Bissau Kriol (Upper Guinea Creole; clean)
  kri: "kri", // Krio (Sierra Leone; clean)
  pcm: "pcm", // Nigerian Pidgin / Naija (tight-cluster; English sibling within margin)
};
const FRANC_CODES = new Set(Object.values(FRANC_MAP));

// Detect a paragraph's language with the engine that gates the resolved language:
// franc (broad, ISO 639-3) for FRANC_CODES, languagedetect (the ISO_MAP set)
// otherwise. Both return a score-ranked [lang, score] list, so the caller
// compares them identically. franc's "und" (undetermined) means no detection.
function detectLanguages(text, resolvedLanguage) {
  if (FRANC_CODES.has(resolvedLanguage)) {
    const ranked = francAll(text, { minLength: 10 });
    if (!ranked.length || ranked[0][0] === "und") return [];
    return ranked;
  }
  return lngDetector.detect(text);
}

const DEFAULT_PROSE_SECTIONS = [
  "projection",
  "action",
  "shadow",
  "arc",
  "stakes",
  "yearbook",
  "tagline",
  "tell",
  "withheld",
  "shown",
  "offers",
  "loses",
  "orders",
  "apparent",
  "load bearing",
];

const DEFAULT_NLP_LANGUAGES = [];

// Dense scripts — ones where a whitespace-token count badly understates a
// paragraph's length, so span length is measured in characters instead. Two
// families qualify:
//   • scriptio continua (no word spaces): Han, Japanese kana, Thai, Lao, Khmer,
//     Myanmar, Tibetan — a whole Chinese sentence reads as one "word".
//   • agglutinative Brahmic (spaced, but one orthographic word packs many
//     morphemes): Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu,
//     Kannada, Malayalam, Sinhala — a full Malayalam sentence is ~10 words.
// Korean (Hangul) and Latin/Cyrillic/Arabic-script languages are excluded: they
// space their words and 15 of them is a reasonable floor, so they count normally.
const DENSE_SCRIPT_RE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}\p{Script=Tibetan}\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Gurmukhi}\p{Script=Gujarati}\p{Script=Oriya}\p{Script=Tamil}\p{Script=Telugu}\p{Script=Kannada}\p{Script=Malayalam}\p{Script=Sinhala}\p{Script=Ethiopic}]/gu;

/**
 * Normalizes a language code or name to the lowercase name expected by languagedetect.
 */
function normalizeLanguage(lang) {
  if (!lang) return "english";
  const normalized = lang.trim().toLowerCase();
  return ISO_MAP[normalized] || FRANC_MAP[normalized] || normalized;
}

/**
 * Parses a markdown file's YAML frontmatter.
 */
function readFrontmatter(filePath) {
  if (!existsSync(filePath)) return {};
  try {
    const content = readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(content);
    return parsed.data || {};
  } catch {
    return {};
  }
}

/**
 * Finds the play file (declaring khai: play) in the directory of the file or its parents.
 */
function findPlayFile(fileDir, projectPath) {
  let current = resolve(fileDir);
  const root = resolve(projectPath);

  while (true) {
    // Stay within the project. A raw `current.startsWith(root)` would treat a
    // sibling like "<root>-old" as in-scope (shared textual prefix) and could
    // resolve a play/language from a foreign directory; compare by path instead.
    const rel = relative(root, current);
    if (rel.startsWith("..") || isAbsolute(rel)) break;
    if (existsSync(current)) {
      const files = readdirSync(current);
      for (const file of files) {
        if (file.endsWith(".md") && file.startsWith("play_")) {
          const fullPath = join(current, file);
          const data = readFrontmatter(fullPath);
          if (data.khai === "play") {
            return fullPath;
          }
        }
      }
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

/**
 * Resolves the language for a given file based on the inheritance chain:
 * 1. File frontmatter
 * 2. Play file frontmatter
 * 3. House README frontmatter
 * 4. Fallback: english
 */
export function resolveLanguage(filePath, projectPath) {
  const fileData = readFrontmatter(filePath);
  if (fileData.language) {
    return normalizeLanguage(fileData.language);
  }

  const playFile = findPlayFile(dirname(filePath), projectPath);
  if (playFile) {
    const playData = readFrontmatter(playFile);
    if (playData.language) {
      return normalizeLanguage(playData.language);
    }
  }

  const houseReadme = join(projectPath, "README.md");
  if (existsSync(houseReadme)) {
    const houseData = readFrontmatter(houseReadme);
    if (houseData.language) {
      return normalizeLanguage(houseData.language);
    }
  }

  return "english";
}

/**
 * Cleans markdown formatting, links, and blockquotes from prose text.
 */
export function cleanProse(text) {
  // Strip blockquotes: lines starting with >
  let clean = text.replace(/^\s*>.*$/gm, " ");
  // Strip Markdown links: [text](url) -> text
  clean = clean.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  // Strip list bullet markers, then inline code/bold/italic/table markers. The
  // bullet branch comes first so a line-start `*`/`+` marker is consumed whole
  // (with its trailing space), not one char at a time by the char class.
  clean = clean.replace(/^\s*[-*+]\s+|[`*_~|]/gm, " ");
  return clean;
}

/**
 * Extracts prose bodies from H2 sections matching the target list (case-insensitive).
 */
export function extractProseSections(text, proseSections) {
  const sections = [];
  const lines = text.split(/\r?\n/);

  let currentHeader = null;
  let currentBodyLines = [];

  for (const line of lines) {
    const headerMatch = /^##\s+(.+)$/.exec(line);
    if (headerMatch) {
      if (currentHeader && proseSections.includes(currentHeader.toLowerCase())) {
        sections.push({
          header: currentHeader,
          body: currentBodyLines.join("\n"),
        });
      }
      currentHeader = headerMatch[1].trim();
      currentBodyLines = [];
    } else if (/^#\s+/.test(line)) {
      if (currentHeader && proseSections.includes(currentHeader.toLowerCase())) {
        sections.push({
          header: currentHeader,
          body: currentBodyLines.join("\n"),
        });
      }
      currentHeader = null;
      currentBodyLines = [];
    } else {
      if (currentHeader) {
        currentBodyLines.push(line);
      }
    }
  }

  if (currentHeader && proseSections.includes(currentHeader.toLowerCase())) {
    sections.push({
      header: currentHeader,
      body: currentBodyLines.join("\n"),
    });
  }
  return sections;
}

/**
 * Loads exceptions from language_exceptions.txt files co-located with the file or globally.
 */
function loadExceptions(filePath, projectPath) {
  const exceptions = new Set();
  const dirs = [dirname(filePath), projectPath];

  for (const dir of dirs) {
    const excFile = join(dir, "language_exceptions.txt");
    if (existsSync(excFile)) {
      try {
        const lines = readFileSync(excFile, "utf8").split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            exceptions.add(trimmed.toLowerCase());
          }
        }
      } catch {}
    }
  }
  return Array.from(exceptions);
}

/**
 * Scans a file and validates it against its resolved language policy.
 */
export function validateLanguageOfFile(filePath, projectPath, options = {}) {
  const proseSections = (options.proseSections || DEFAULT_PROSE_SECTIONS).map((s) =>
    s.toLowerCase(),
  );
  // Normalize through the same map resolveLanguage uses, so an entry given as an
  // ISO code (e.g. "fr") matches the normalized resolvedLanguage ("french") and
  // actually routes to the NLP/LLM fallback. A bare toLowerCase left "fr" unable
  // to match "french", silently running the local detector anyway.
  const nlpLanguages = (options.nlpLanguages || DEFAULT_NLP_LANGUAGES)
    .filter((s) => typeof s === "string" && s.trim())
    .map((s) => normalizeLanguage(s));
  const minSpanWords = options.minSpanWords !== undefined ? options.minSpanWords : 15;
  // Scriptio-continua fallback: a paragraph also qualifies if it carries at least
  // this many spaceless-script characters, since franc is reliable well below 15
  // "words" of CJK/SEA text (it tops these at 1.0 on a single short sentence).
  const minSpanChars = options.minSpanChars !== undefined ? options.minSpanChars : 24;
  const confidenceMargin = options.confidenceMargin !== undefined ? options.confidenceMargin : 0.1;

  if (!existsSync(filePath)) {
    return [`File not found: ${filePath}`];
  }

  const resolvedLanguage = resolveLanguage(filePath, projectPath);

  const allowedLangs = new Set([
    ...Object.values(ISO_MAP),
    ...Object.values(FRANC_MAP),
    ...nlpLanguages,
  ]);
  if (!allowedLangs.has(resolvedLanguage)) {
    return [
      `Language '${resolvedLanguage}' is not registered. ` +
        `Allowed languages: [${Array.from(allowedLangs).join(", ")}]`,
    ];
  }

  // NLP Fallback check
  if (nlpLanguages.includes(resolvedLanguage)) {
    console.log(
      `[NLP Fallback] File ${basename(filePath)} resolved to ${resolvedLanguage}. Local check skipped; expectations routed to assistant/LLM verification.`,
    );
    return [];
  }

  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (err) {
    return [`Could not read file: ${err.message}`];
  }

  const sections = extractProseSections(text, proseSections);
  const exceptions = loadExceptions(filePath, projectPath);
  const errors = [];

  for (const section of sections) {
    const cleanBody = cleanProse(section.body);
    // Split by paragraphs
    const paragraphs = cleanBody
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean);
      // Too short to trust — but measure dense scripts by character count, or a
      // whole Chinese/Thai/Malayalam paragraph (few whitespace tokens) is wrongly skipped.
      const denseChars = (para.match(DENSE_SCRIPT_RE) || []).length;
      if (words.length < minSpanWords && denseChars < minSpanChars) continue;

      // Check exceptions
      const lowerPara = para.toLowerCase();
      if (exceptions.some((entry) => lowerPara.includes(entry))) continue;

      const detections = detectLanguages(para, resolvedLanguage);
      if (!detections || detections.length === 0) continue;

      const [topLanguage, topScore] = detections[0];
      if (topLanguage === resolvedLanguage) continue;

      // Re-run check / verify standalone confidence
      const allowedScore = detections.find((d) => d[0] === resolvedLanguage)?.[1] || 0.0;
      const diff = topScore - allowedScore;

      if (diff >= confidenceMargin) {
        const snippet = para.length > 80 ? para.slice(0, 77) + "..." : para;
        // Report a word count for spaced text, a character count for dense scripts.
        const measure =
          words.length >= minSpanWords ? `${words.length} words` : `${denseChars} chars`;
        errors.push(
          `${topLanguage.charAt(0).toUpperCase() + topLanguage.slice(1)} span ` +
            `(${measure}) in ## ${section.header}: '${snippet}' ` +
            `(expected: ${resolvedLanguage})`,
        );
      }
    }
  }

  return errors;
}

/**
 * Finds all markdown content files under a project directory.
 */
// Infra/docs markdown that is never a language-checked content instance: the
// generated changelog, the house README, and the LORE warrant (REFERENCES). The
// single source of the skip policy, so discovery and validation can't diverge.
const NON_CONTENT_MD = new Set(["CHANGELOG.md", "README.md", "REFERENCES.md", "REFERENCE.md"]);
const isContentMarkdown = (name) => name.endsWith(".md") && !NON_CONTENT_MD.has(name);

function findProjectMarkdownFiles(dir) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findProjectMarkdownFiles(fullPath));
    } else if (isContentMarkdown(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Validates language policy across an entire project.
 */
export function validateProjectLanguages(projectPath, options = {}) {
  const contentDir = options.contentDir || join(projectPath, "plays");
  if (!existsSync(contentDir)) {
    return [];
  }

  // Load languages from package.json if not provided in options
  let nlpLanguages = options.nlpLanguages;
  if (!nlpLanguages) {
    const pkgPath = join(projectPath, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        nlpLanguages = pkg.khai?.languages || [];
      } catch {
        nlpLanguages = [];
      }
    } else {
      nlpLanguages = [];
    }
  }
  const mergedOptions = { ...options, nlpLanguages };

  // findProjectMarkdownFiles already applies the single NON_CONTENT_MD skip
  // policy, so README/REFERENCES (infra, not content) never reach here.
  const mdFiles = findProjectMarkdownFiles(contentDir);
  const results = [];

  for (const file of mdFiles) {
    const errors = validateLanguageOfFile(file, projectPath, mergedOptions);
    if (errors.length > 0) {
      results.push({
        file,
        errors,
      });
    }
  }

  return results;
}
