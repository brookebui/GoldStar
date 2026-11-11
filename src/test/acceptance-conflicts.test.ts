import { describe, expect, it } from "vitest";
import { acceptanceConflicts, appliedSelection, canApplySelection } from "@/data/acceptance-conflicts";
import { canvasRules } from "@/data/canvas-rules";

describe("Acceptance conflict decision", () => {
  const scope = { projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] };
  it("identifies Product B's approved ActionButton conflict only for the Button rule", () => {
    expect(acceptanceConflicts("button-component", canvasRules).map((c) => [c.project.id, c.existing.id])).toEqual([["product-b", "commerce-action-btn"]]);
    expect(acceptanceConflicts("spacing-tokens", canvasRules)).toEqual([]);
  });
  it("allows applying to Product A without confirming an excluded Product B", () => {
    expect(canApplySelection(scope, ["product-b"], [])).toBe(true);
    expect(canApplySelection(scope, ["product-b"], ["product-b"])).toBe(true);
  });
  it("requires acknowledgement when a conflicting Product B agent is included", () => {
    const included = { projects: ["product-a", "product-b"], agents: [...scope.agents, "product-b-checkout"] };
    expect(canApplySelection(included, ["product-b"], [])).toBe(false);
    expect(canApplySelection(included, ["product-b"], ["product-b"])).toBe(true);
  });
  it("does not count projects with no selected agents as applied", () => {
    expect(appliedSelection({ ...scope, projects: ["product-a", "product-b"] })).toEqual(scope);
    expect(canApplySelection({ ...scope, projects: ["product-a", "product-b"] }, ["product-b"], [])).toBe(true);
  });
});