import { describe, expect, it } from "vitest";
import { canvasRules, initialRuleDrafts, scopeForRule, rulebookFor, filteredRuleIds, canApproveRule, toggleRuleProject, toggleRuleAgent } from "@/data/canvas-rules";

function draftFor(id: string) {
  const draft = initialRuleDrafts[id];
  if (!draft) throw new Error(`Missing demo draft ${id}`);
  return draft;
}

describe("Hierarchical rule scopes", () => {
  it("inherits global color tokens across both projects and all four Claude agents", () => {
    expect(scopeForRule(draftFor("design-tokens"))).toEqual({ projects: ["product-a", "product-b"], agents: ["product-a-builder", "product-a-reviewer", "product-b-developer", "product-b-checkout"] });
  });
  it("keeps the Commerce Action Button local to Product B", () => {
    expect(scopeForRule(draftFor("commerce-action-btn")).projects).toEqual(["product-b"]);
    expect(rulebookFor("product-a", initialRuleDrafts).map((entry) => entry.rule.id)).not.toContain("commerce-action-btn");
  });
  it("allows the global Button rule across both projects without conflict blocking", () => {
    const rule = canvasRules[0];
    if (!rule) throw new Error("Missing demo Button rule");
    expect(canApproveRule(rule, draftFor(rule.id))).toBe(true);
    expect(canApproveRule(rule, { ...draftFor(rule.id), excludedProjects: ["product-a", "product-b"] })).toBe(false);
    expect(canApproveRule(rule, toggleRuleProject(draftFor(rule.id), "product-b"))).toBe(true);
  });
  it("filters global and project views independently", () => {
    expect(filteredRuleIds("global", initialRuleDrafts)).toEqual(["button-component", "design-tokens", "type-hierarchy"]);
    expect(filteredRuleIds("product-a", initialRuleDrafts)).toEqual(["button-component", "design-tokens", "type-hierarchy", "workspace-empty-states"]);
    expect(filteredRuleIds("product-b", initialRuleDrafts)).toEqual(["button-component", "design-tokens", "commerce-action-btn", "type-hierarchy", "checkout-copy"]);
  });
  it("excludes an individual agent without excluding its project", () => {
    const draft = toggleRuleAgent(draftFor("design-tokens"), "product-a-builder");
    expect(scopeForRule(draft).projects).toEqual(["product-a", "product-b"]);
    expect(scopeForRule(draft).agents).toEqual(["product-a-reviewer", "product-b-developer", "product-b-checkout"]);
    expect(rulebookFor("product-a", { ...initialRuleDrafts, "design-tokens": draft }, "product-a-builder").map((entry) => entry.rule.id)).toEqual(["button-component", "type-hierarchy", "workspace-empty-states"]);
  });
  it("switches a global rule to a single local project", () => {
    expect(scopeForRule({ ...draftFor("design-tokens"), scopeType: "local", targetProjectId: "product-a" }).projects).toEqual(["product-a"]);
  });
  it("inherits the new typography rule across both projects and all four agents", () => {
    expect(scopeForRule(draftFor("type-hierarchy"))).toEqual({ projects: ["product-a", "product-b"], agents: ["product-a-builder", "product-a-reviewer", "product-b-developer", "product-b-checkout"] });
  });
  it("keeps workspace empty states within Product A", () => {
    expect(scopeForRule(draftFor("workspace-empty-states"))).toEqual({ projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] });
  });
  it("keeps checkout action copy within Product B", () => {
    expect(scopeForRule(draftFor("checkout-copy"))).toEqual({ projects: ["product-b"], agents: ["product-b-developer", "product-b-checkout"] });
  });
});
describe("unassigned filter", () => {
  it("lists only rules attached to no project", () => {
    const drafts = { ...initialRuleDrafts, "checkout-copy": { ...initialRuleDrafts["checkout-copy"]!, excludedProjects: ["product-b"] } };
    expect(filteredRuleIds("unassigned", initialRuleDrafts)).toEqual([]);
    expect(filteredRuleIds("unassigned", drafts)).toEqual(["checkout-copy"]);
  });
});
