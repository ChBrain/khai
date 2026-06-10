import { describe, it, expect } from "vitest";
import { getVenue, getFormat, validateVenueFormat, venues } from "../lib/profiles.mjs";

describe("profiles", () => {
  describe("venues", () => {
    it("exports defined venues", () => {
      expect(venues).toHaveProperty("gemini_gem");
      expect(venues).toHaveProperty("github_pages");
      expect(venues).toHaveProperty("markdown");
      expect(venues).toHaveProperty("print");
      expect(venues).toHaveProperty("email");
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
      expect(validateVenueFormat("gemini_gem", "pdf")).toBe(true);
      expect(validateVenueFormat("github_pages", "html")).toBe(true);
    });

    it("validateVenueFormat throws for unsupported formats", () => {
      expect(() => validateVenueFormat("gemini_gem", "html")).toThrow("does not support format");
    });
  });
});
