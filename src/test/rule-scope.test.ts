import { describe, expect, it } from "vitest";
import { canApprove, emptyScope, hasConflict, setAgentScope, setProjectScope } from "@/data/rule-scope";

describe("Canvas scope", () => {
  it("includes Product A with its Claude agents", () => {
    expect(setProjectScope(emptyScope, "product-a", true)).toEqual({ projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] });
  });
  it("blocks approval when Product B conflicts", () => {
    const scope = setProjectScope(setProjectScope(emptyScope, "product-a", true), "product-b", true);
    expect(hasConflict(scope)).toBe(true);
    expect(canApprove(scope)).toBe(false);
  });
  it("allows Product A approval after excluding Product B", () => {
    const scope = setProjectScope(setProjectScope(setProjectScope(emptyScope, "product-a", true), "product-b", true), "product-b", false);
    expect(scope).toEqual({ projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] });
    expect(canApprove(scope)).toBe(true);
  });
  it("does not include an agent without its project", () => {
    expect(setAgentScope(emptyScope, "product-a-builder", true)).toEqual(emptyScope);
  });
});