import { describe, expect, it } from "vitest";
import { filterSuggestions, suggestions } from "@/data/suggestions";
describe("Inbox filters", () => {
  it("everything starts pending", () => expect(filterSuggestions(suggestions, {}, "pending", "")).toHaveLength(3));
  it("accepted rules leave Pending and show under Accepted", () => {
    const st = { "button-component": "accepted" as const };
    expect(filterSuggestions(suggestions, st, "pending", "").map((s) => s.id)).not.toContain("button-component");
    expect(filterSuggestions(suggestions, st, "accepted", "").map((s) => s.id)).toEqual(["button-component"]);
  });
  it("search matches titles case-insensitively", () => {
    expect(filterSuggestions(suggestions, {}, "pending", "SPACING").map((s) => s.id)).toEqual(["spacing-tokens"]);
  });
  it("category filter keeps only matching rules", () => {
    expect(filterSuggestions(suggestions, {}, "pending", "", "Components").map((s) => s.id)).toEqual(["button-component"]);
    expect(filterSuggestions(suggestions, {}, "pending", "", "Spacing").map((s) => s.id)).toEqual(["spacing-tokens"]);
    expect(filterSuggestions(suggestions, {}, "pending", "", "Voice and copy").map((s) => s.id)).toEqual(["sentence-case"]);
    expect(filterSuggestions(suggestions, {}, "pending", "", "Color")).toHaveLength(0);
    expect(filterSuggestions(suggestions, {}, "pending", "", "All")).toHaveLength(3);
  });
  it("category and search combine", () => {
    expect(filterSuggestions(suggestions, {}, "pending", "button", "Components").map((s) => s.id)).toEqual(["button-component"]);
    expect(filterSuggestions(suggestions, {}, "pending", "button", "Spacing")).toHaveLength(0);
  });
});
