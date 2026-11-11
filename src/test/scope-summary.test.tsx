import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ScopeSummary } from "@/components/gs/ScopeSummary";
import type { RuleDraft } from "@/data/canvas-rules";

afterEach(cleanup);

const globalDraft: RuleDraft = { scopeType: "global", targetProjectId: "product-a", excludedProjects: ["product-b"], excludedAgents: [] };
const localDraft: RuleDraft = { scopeType: "local", targetProjectId: "product-a", excludedProjects: [], excludedAgents: [] };

describe("Rule scope summary in the inspector", () => {
  it("reports a global rule's projects without offering a project switcher", () => {
    const { container } = render(<ScopeSummary draft={globalDraft} scope={{ projects: ["product-a"], agents: [] }} />);
    expect(screen.getByText("Product A").textContent).toBe("Product A");
    expect(screen.getByText("Receives this rule")).toBeTruthy();
    expect(screen.getByText("Cut off")).toBeTruthy();
    expect(container.querySelector("button, select, input, [role='combobox']")).toBeNull();
  });

  it("names only the project a local rule belongs to", () => {
    const { container } = render(<ScopeSummary draft={localDraft} scope={{ projects: ["product-a"], agents: [] }} />);
    expect(screen.getByText("Attached to Product A.")).toBeTruthy();
    expect(screen.queryByText("Product B")).toBeNull();
    expect(container.querySelector("button, select, input, [role='combobox']")).toBeNull();
  });

  it("says so when a local rule is cut off from its own project", () => {
    render(<ScopeSummary draft={localDraft} scope={{ projects: [], agents: [] }} />);
    expect(screen.getByText("Cut off from Product A — no project receives it.")).toBeTruthy();
  });
});
