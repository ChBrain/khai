/**
 * khai-tour profiles: venues and their constraints
 * Each profile describes how a play/artifact should be formatted for its audience
 */

export const venues = {
  gemini_gem: {
    name: "Gemini Gem",
    description: "Google Gemini context window artifact (10-file limit)",
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
