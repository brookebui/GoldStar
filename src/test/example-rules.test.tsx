import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RuleScopeProvider, useRuleScope } from "@/components/gs/RuleScopeProvider";
import { RuleList } from "@/components/gs/RuleList";
import { ExampleRulesToggle } from "@/components/gs/ExampleRulesToggle";

vi.mock("@/components/gs/RulesViewToggle", () => ({ RulesViewToggle: () => null }));
afterEach(cleanup);

function Workspace() {
  const [view, setView] = useState("canvas");
  const { workspaceRules, draftRule } = useRuleScope();
  return <>
    <button onClick={() => setView(view === "canvas" ? "list" : "canvas")}>Switch view</button>
    <button onClick={() => draftRule("Custom rule", "Use visible labels", "Accessibility")}>Create custom rule</button>
    <output data-testid="rule-count">{workspaceRules.length}</output>
    {view === "list" ? <RuleList /> : <ExampleRulesToggle />}
  </>;
}

describe("Shared example-rule visibility", () => {
  it("hides all six examples in List and stays off when returning to Canvas", () => {
    render(<RuleScopeProvider><Workspace /></RuleScopeProvider>);
    expect(screen.getByTestId("rule-count").textContent).toBe("6");
    fireEvent.click(screen.getByRole("switch", { name: "Example rules" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch view" }));
    expect(screen.getByTestId("rule-count").textContent).toBe("0");
    expect(screen.queryByText("Button convention")).toBeNull();
    expect(screen.getByRole("switch", { name: "Example rules" })).toHaveAttribute("aria-checked", "false");
    fireEvent.click(screen.getByRole("button", { name: "Switch view" }));
    expect(screen.getByTestId("rule-count").textContent).toBe("0");
    expect(screen.getByRole("switch", { name: "Example rules" })).toHaveAttribute("aria-checked", "false");
  });

  it("restores examples from List and preserves that setting in Canvas", () => {
    render(<RuleScopeProvider><Workspace /></RuleScopeProvider>);
    fireEvent.click(screen.getByRole("switch", { name: "Example rules" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch view" }));
    fireEvent.click(screen.getByRole("switch", { name: "Example rules" }));
    expect(screen.getByTestId("rule-count").textContent).toBe("6");
    expect(screen.getByText("Button convention")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Switch view" }));
    expect(screen.getByRole("switch", { name: "Example rules" })).toHaveAttribute("aria-checked", "true");
  });

  it("keeps custom rules visible while examples are off", () => {
    render(<RuleScopeProvider><Workspace /></RuleScopeProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Create custom rule" }));
    fireEvent.click(screen.getByRole("switch", { name: "Example rules" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch view" }));
    expect(screen.getByTestId("rule-count").textContent).toBe("1");
    expect(screen.getByText("Custom rule")).toBeTruthy();
    expect(screen.queryByText("Button convention")).toBeNull();
  });

  it("shows demo purposes tooltip for example rules toggle", async () => {
    render(<RuleScopeProvider><Workspace /></RuleScopeProvider>);
    const toggle = screen.getByRole("switch", { name: "Example rules" });
    fireEvent.focus(toggle);
    expect(await screen.findByText("For demo purposes only")).toBeTruthy();
  });
});