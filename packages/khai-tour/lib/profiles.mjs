/**
 * khai-tour profiles: venues and their constraints
 * Each profile describes how a play/artifact should be formatted for its audience
 */

// A Venue has a `kind`:
//   - `interactive`: an LLM deployment (a custom assistant configured with the
//     composed instructions + knowledge). Its instructions are composed by
//     `composeVenue(slug)`; `source` says what the Roadie must PRODUCE — today
//     every interactive host is upload-oriented, so the Roadie bundles and the
//     human uploads.
//
//     `repoAttachable` is a separate fact and deliberately not the same field:
//     some hosts can additionally be pointed at a repository, under their own
//     limits, but that is the human's option in the host's UI and it does not
//     change what khai-tour builds. `claude_project` carried `source: "repo"`
//     and that was simply wrong: it made the bundle look optional for a host
//     that is uploaded to like the others. Nothing branched on the field -- it
//     reaches exactly one CLI display string -- so the error was invisible to
//     every gate and survived until a human read it.
//   - `publication`: a rendered artifact (PDF, HTML, ...). Its `constraints`,
//     `defaultFormat` and `packaging` drive the renderer.
// Interactive venue slugs carry the kind of host (`perplexity_space`,
// `claude_project`); the slug is also the key of the adaption fragment in
// @chbrain/khai-engine-spine.
export const venues = {
  // --- Interactive venues (LLM deployments) ---
  claude_project: {
    name: "Claude Project",
    description: "Anthropic Claude Project (instructions + uploaded knowledge)",
    kind: "interactive",
    source: "upload",
  },

  // The host renamed Spaces to Projects. The display name follows, because a
  // reader is looking at that word in Perplexity's own UI. The SLUG does not:
  // it is the key of the adaption fragment in @chbrain/khai-engine-spine, so
  // renaming it carries a package outside this one and belongs on a `rename/`
  // lane, which is the maintainer's call rather than a drive-by.
  perplexity_space: {
    name: "Perplexity Project",
    description: "Perplexity Project, formerly Space (instructions + uploaded knowledge)",
    kind: "interactive",
    source: "upload",
    repoAttachable: true,
  },

  gemini_gem: {
    name: "Gemini Gem",
    description: "Google Gemini Gem (instructions + up to 10 uploaded knowledge files)",
    kind: "interactive",
    source: "upload",
    repoAttachable: true,
    // A Gem accepts at most 10 knowledge files (hard limit). Consolidate the
    // collections to fit — one file per category (all personas, all positions,
    // ...); aggregateCollections already merges each collection into one file.
    constraints: {
      maxFiles: 10,
    },
  },

  // --- Publication venues (rendered artifacts) ---
  github_pages: {
    name: "GitHub Pages",
    description: "Hosted static site with unlimited files",
    kind: "publication",
    constraints: {
      maxFiles: null,
      maxTotalSize: null,
      supportedFormats: ["html", "markdown", "pdf"],
    },
    defaultFormat: "html",
    packaging: false, // No ZIP, files served directly
    optimization: "expanded", // Separate files per collection
  },

  markdown: {
    name: "Portable Markdown",
    description: "Single markdown file for local/portable use",
    kind: "publication",
    constraints: {
      maxFiles: 1,
      maxTotalSize: null,
      supportedFormats: ["markdown"],
    },
    defaultFormat: "markdown",
    packaging: false,
    optimization: "portable",
  },

  print: {
    name: "Print-Ready",
    description: "Single PDF optimized for printing",
    kind: "publication",
    constraints: {
      maxFiles: 1,
      maxTotalSize: null,
      supportedFormats: ["pdf"],
    },
    defaultFormat: "pdf",
    packaging: false,
    optimization: "curated", // Editorial ordering, not glob order
  },

  email: {
    name: "Email Share",
    description: "Compressed for email transmission",
    kind: "publication",
    constraints: {
      maxFiles: 1,
      maxTotalSize: 25 * 1024 * 1024, // 25MB typical email limit
      supportedFormats: ["pdf", "zip"],
    },
    defaultFormat: "pdf",
    packaging: "zip",
    optimization: "compact",
  },
};

/** Venue slugs of a given kind ("interactive" | "publication"). */
export function venuesOfKind(kind) {
  return Object.entries(venues)
    .filter(([, v]) => v.kind === kind)
    .map(([slug]) => slug);
}

/**
 * Format-specific renderers: what each format needs
 */
export const formats = {
  pdf: {
    name: "PDF",
    engine: "markdown-pdf", // Requires CLI tool
    requiresMarkdown: true,
    supportsFrontmatter: false,
  },

  html: {
    name: "HTML",
    engine: "markdown-it", // Or other markdown-to-html
    requiresMarkdown: true,
    supportsFrontmatter: false,
  },

  markdown: {
    name: "Markdown",
    engine: "native",
    requiresMarkdown: true,
    supportsFrontmatter: false, // Strip before output
  },

  zip: {
    name: "ZIP Archive",
    engine: "archiver",
    isPackaging: true,
    wrapsOtherFormats: true,
  },
};

/**
 * Collection aggregation strategies
 */
export const aggregationStrategies = {
  bundled: {
    description: "All collections in one output file",
    multipleOutputs: false,
  },
  each: {
    description: "Separate output per collection",
    multipleOutputs: true,
  },
  curated: {
    description: "Editorial ordering, custom grouping",
    multipleOutputs: true,
  },
};

/**
 * Resolve venue profile by name
 */
export function getVenue(name) {
  const venue = venues[name];
  if (!venue) {
    throw new Error(`Unknown venue: ${name}. Available: ${Object.keys(venues).join(", ")}`);
  }
  return venue;
}

/**
 * Resolve format spec by name
 */
export function getFormat(name) {
  const fmt = formats[name];
  if (!fmt) {
    throw new Error(`Unknown format: ${name}. Available: ${Object.keys(formats).join(", ")}`);
  }
  return fmt;
}

/**
 * Validate that a venue supports the requested format
 */
export function validateVenueFormat(venueName, formatName) {
  const venue = getVenue(venueName);
  const fmt = getFormat(formatName);

  if (!venue.constraints.supportedFormats.includes(formatName)) {
    throw new Error(
      `Venue "${venueName}" does not support format "${formatName}". Supported: ${venue.constraints.supportedFormats.join(", ")}`,
    );
  }

  return true;
}
