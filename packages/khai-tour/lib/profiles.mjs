/**
 * khai-tour profiles: venues and their constraints
 * Each profile describes how a play/artifact should be formatted for its audience
 */

// A Venue has a `kind`:
//   - `interactive`: an LLM deployment (a custom assistant configured with the
//     composed instructions + knowledge). Its instructions are composed by
//     `composeVenue(slug)`; `source` says how it takes its files — `repo`
//     (synced from a connected repository) or `upload` (uploaded by hand).
//   - `publication`: a rendered artifact (PDF, HTML, ...). Its `constraints`,
//     `defaultFormat` and `packaging` drive the renderer.
// Interactive venue slugs carry the kind of host (`perplexity_space`,
// `claude_project`); the slug is also the key of the adaption fragment in
// @chbrain/khai-engine-spine.
export const venues = {
  // --- Interactive venues (LLM deployments) ---
  claude_project: {
    name: "Claude Project",
    description: "Anthropic Claude Project (instructions + connected knowledge)",
    kind: "interactive",
    source: "repo",
  },

  perplexity_space: {
    name: "Perplexity Space",
    description: "Perplexity Space (instructions + uploaded knowledge)",
    kind: "interactive",
    source: "upload",
  },

  // --- Publication venues (rendered artifacts) ---
  gemini_gem: {
    name: "Gemini Gem",
    description: "Google Gemini context window artifact (10-file limit)",
    kind: "publication",
    constraints: {
      maxFiles: 10,
      maxTotalSize: null, // Context-dependent, not enforced here
      supportedFormats: ["pdf", "zip"],
    },
    defaultFormat: "pdf",
    packaging: "zip", // Bundle all into single zip
    optimization: "compact", // Single PDF vs. multiple
  },

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
