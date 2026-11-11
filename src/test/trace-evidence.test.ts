import { describe, expect, it } from "vitest";
import { suggestions } from "../data/suggestions";

describe("complete example trace collections", () => {
  it.each([
    ["button-component", 9],
    ["spacing-tokens", 6],
    ["sentence-case", 5],
  ])("provides every advertised session for %s", (id, count) => {
    const suggestion = suggestions.find((item) => item.id === id);
    expect(suggestion?.evidence).toHaveLength(count);
    expect(new Set(suggestion?.evidence.map((trace) => trace.id)).size).toBe(count);
    expect(suggestion?.evidence.every((trace) => trace.lines.some((line) => line.flag === "correction"))).toBe(true);
  });
});