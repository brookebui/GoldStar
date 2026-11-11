import { describe, expect, it } from "vitest";
import { patternStrength } from "@/data/suggestions";
describe("pattern strength", () => {
  it("94% is a strong pattern", () => expect(patternStrength(0.94)).toBe("Strong pattern"));
  it("81% is an emerging pattern", () => expect(patternStrength(0.81)).toBe("Emerging pattern"));
});
