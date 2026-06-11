import { describe, it, expect } from "vitest";
import {
  getVenue,
  getFormat,
  validateVenueFormat,
  venues,
  venuesOfKind,
} from "../lib/profiles.mjs";

describe("profiles", () => {
  describe("venues", () => {
    it("exports defined venues", () => {
      expect(venues).toHaveProperty("gemini_gem");
      expect(venues).toHaveProperty("github_pages");
      expect(venues).toHaveProperty("markdown");
      expect(venues).toHaveProperty("print");
      expect(venues).toHaveProperty("email");
    });

    it("declares interactive venues with a source", () => {
      expect(venues.perplexity_space.kind).toBe("interactive");
      expect(venues.perplexity_space.source).toBe("upload");
      expect(venues.claude_project.kind).toBe("interactive");
      expect(venues.claude_project.source).toBe("repo");
    });

    it("treats the Gemini Gem as interactive with a hard 10-file limit", () => {
      expect(venues.gemini_gem.kind).toBe("interactive");
      expect(venues.gemini_gem.source).toBe("upload");
      expect(venues.gemini_gem.constraints.maxFiles).toBe(10);
    });

    it("tags rendered venues as publication", () => {
      expect(venues.github_pages.kind).toBe("publication");
      expect(venues.print.kind).toBe("publication");
    });

    it("venuesOfKind partitions the registry", () => {
      expect(venuesOfKind("interactive")).toEqual([
        "claude_project",
        "perplexity_space",
        "gemini_gem",
      ]);
      expect(venuesOfKind("publication")).toContain("github_pages");
      expect(venuesOfKind("publication")).not.toContain("perplexity_space");
    });

    it("getVenue returns venue by name", () => {
      const venue = getVenue("gemini_gem");
      expect(venue.name).toBe("Gemini Gem");
      expect(venue.constraints.maxFiles).toBe(10);
    });

    it("getVenue throws on unknown venue", () => {
      expect(() => getVenue("unknown_venue")).toThrow("Unknown venue");
    });
  });

  describe("format validation", () => {
    it("validateVenueFormat succeeds for supported formats", () => {
      expect(validateVenueFormat("print", "pdf")).toBe(true);
      expect(validateVenueFormat("github_pages", "html")).toBe(true);
    });

    it("validateVenueFormat throws for unsupported formats", () => {
      expect(() => validateVenueFormat("print", "html")).toThrow("does not support format");
    });
  });
});
