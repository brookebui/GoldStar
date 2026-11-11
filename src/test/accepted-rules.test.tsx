import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RuleScopeProvider, useRuleScope } from "@/components/gs/RuleScopeProvider";
import { rulebookFor, scopeForRule, toggleRuleAgent } from "@/data/canvas-rules";
import { suggestions } from "@/data/suggestions";

describe("Accepted rule workspace", () => {
  it("acceptance starts without seeded stars and example runs stay in the session", () => {
    const { result } = renderHook(useRuleScope, { wrapper: RuleScopeProvider });
    const suggestion = suggestions.find((s) => s.id === "button-component");
    if (!suggestion) throw new Error("Missing Button suggestion");
    act(() => result.current.accept(suggestion, { projects: ["product-a"], agents: ["product-a-builder"] }, suggestion.proposedMarkdown));
    expect(result.current.verificationRuns).toEqual([]);
    act(() => result.current.addExampleRun(suggestion.id, "product-a-builder", true));
    expect(result.current.verificationRuns).toHaveLength(1);
    expect(result.current.verificationRuns[0]).toMatchObject({ ruleId: "button-component", delivered: true, passed: true, markdown: suggestion.proposedMarkdown });
    const draft = result.current.scopes[suggestion.id];
    if (!draft) throw new Error("Missing scope");
    act(() => result.current.update(suggestion.id, toggleRuleAgent(draft, "product-a-builder")));
    act(() => result.current.addExampleRun(suggestion.id, "product-a-builder", false));
    expect(result.current.verificationRuns.map((run) => run.delivered)).toEqual([true, false]);
  });
  it.each(suggestions)("preserves reusable instructions when accepting $id", (suggestion) => {
    const { result } = renderHook(useRuleScope, { wrapper: RuleScopeProvider });
    act(() => result.current.accept(suggestion, { projects: ["product-a"], agents: ["product-a-builder"] }, suggestion.proposedMarkdown));
    expect(result.current.rules.find((rule) => rule.id === suggestion.id)?.markdown).toBe(suggestion.proposedMarkdown);
  });
  it("starts with six accepted example rules in their current scopes", () => {
    const { result } = renderHook(useRuleScope, { wrapper: RuleScopeProvider });
    expect(result.current.rules.map((r) => r.id)).toEqual(["button-component", "design-tokens", "commerce-action-btn", "type-hierarchy", "workspace-empty-states", "checkout-copy"]);
    expect(rulebookFor("product-b", result.current.scopes, undefined, result.current.rules).map((r) => r.rule.id)).toEqual(["button-component", "design-tokens", "commerce-action-btn", "type-hierarchy", "checkout-copy"]);
  });
  it("accepts an Inbox rule with exactly the selected project, agent, and edited markdown", () => {
    const { result } = renderHook(useRuleScope, { wrapper: RuleScopeProvider });
    const suggestion = suggestions.find((s) => s.id === "spacing-tokens");
    if (!suggestion) throw new Error("Missing spacing suggestion");
    act(() => result.current.accept(suggestion, { projects: ["product-a"], agents: ["product-a-builder"] }, "# Use spacing tokens\n\nUse the 4px scale."));
    const scope = result.current.scopes[suggestion.id];
    if (!scope) throw new Error("Missing accepted scope");
    expect(scopeForRule(scope)).toEqual({ projects: ["product-a"], agents: ["product-a-builder"] });
    expect(result.current.rules.find((r) => r.id === suggestion.id)?.markdown).toBe("# Use spacing tokens\n\nUse the 4px scale.");
    expect(rulebookFor("product-a", result.current.scopes, "product-a-builder", result.current.rules).map((r) => r.rule.id)).toContain("spacing-tokens");
    expect(rulebookFor("product-a", result.current.scopes, "product-a-reviewer", result.current.rules).map((r) => r.rule.id)).not.toContain("spacing-tokens");
    expect(result.current.latestAcceptedId).toBe("spacing-tokens");
    act(() => result.current.update(suggestion.id, toggleRuleAgent(scope, "product-a-builder")));
    expect(result.current.accepted[suggestion.id]?.agents).toEqual([]);
  });
  it("updates agent scope immediately without another approval", () => {
    const { result } = renderHook(useRuleScope, { wrapper: RuleScopeProvider });
    const scope = result.current.scopes["button-component"];
    if (!scope) throw new Error("Missing Button scope");
    act(() => result.current.update("button-component", toggleRuleAgent(scope, "product-a-builder")));
    expect(rulebookFor("product-a", result.current.scopes, "product-a-builder", result.current.rules).map((r) => r.rule.id)).toEqual(["design-tokens", "type-hierarchy", "workspace-empty-states"]);
  });
});