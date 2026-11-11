import { describe, expect, it } from "vitest";
import { connectChange, cutChange, edgeClasses, removeRuleChange } from "@/data/canvas-wiring";
import { scopeForRule } from "@/data/canvas-rules";
const local = { scopeType: "local" as const, targetProjectId: "product-a", excludedProjects: [], excludedAgents: [] };
const global = { ...local, scopeType: "global" as const };
describe("canvas wiring", () => {
  it("dragging a rule to Global applies it to all projects", () => {
    expect(scopeForRule(connectChange("r", "R", local, "inheritance")!.next).projects).toEqual(["product-a", "product-b"]);
  });
  it("attaching a local rule to another project moves it there only", () => {
    expect(scopeForRule(connectChange("r", "R", local, "product-b")!.next).projects).toEqual(["product-b"]);
  });
  it("cutting a wire stops that project following the rule", () => {
    expect(scopeForRule(cutChange("r", "R", global, "product-b")!.next).projects).toEqual(["product-a"]);
  });
  it("connecting an already-attached project changes nothing", () => {
    expect(connectChange("r", "R", global, "product-a")).toBeNull();
  });
});
describe("cutting the last wire", () => {
  it("offers keep-in-canvas and leaves the rule with no projects", () => {
    const change = cutChange("r", "R", { scopeType: "local", targetProjectId: "product-a", excludedProjects: [], excludedAgents: [] }, "product-a")!;
    expect(change.lastWire).toBe(true);
    expect(change.action).toBe("Keep in Canvas");
    expect(scopeForRule(change.next).projects).toEqual([]);
  });
  it("cutting one of several projects is not a last-wire cut", () => {
    expect(cutChange("r", "R", { scopeType: "global", targetProjectId: "product-a", excludedProjects: [], excludedAgents: [] }, "product-b")!.lastWire).toBeUndefined();
  });
});
describe("removing a rule from the panel", () => {
  it("detaches a global rule from every project and asks to keep or archive", () => {
    const change = removeRuleChange("r", "R", global)!;
    expect(change.title).toBe("Disconnect R from all projects?");
    expect(change.action).toBe("Keep in Canvas");
    expect(change.lastWire).toBe(true);
    expect(scopeForRule(change.next).projects).toEqual([]);
  });
  it("detaches a local rule from its only project with the last-wire warning", () => {
    const change = removeRuleChange("r", "R", local)!;
    expect(change.title).toBe("Disconnect R from Product A?");
    expect(change.body).toContain("this is its only project");
    expect(change.body).toContain("become inactive");
    expect(scopeForRule(change.next).projects).toEqual([]);
  });
  it("offers nothing for a rule already attached to no project", () => {
    expect(removeRuleChange("r", "R", { scopeType: "local", targetProjectId: "product-a", excludedProjects: ["product-a"], excludedAgents: [] })).toBeNull();
  });
});
describe("wire colors", () => {
  it("gives global wires the inheritance hue and local wires their own", () => {
    expect(edgeClasses("global", false, false)).toContain("edge-global");
    expect(edgeClasses("local", false, false)).toContain("edge-local");
  });
  it("keeps the gold spotlight and dim states when a rule is selected", () => {
    expect(edgeClasses("local", true, true)).toBe("scope-edge edge-spotlight");
    expect(edgeClasses("global", true, false)).toBe("scope-edge edge-muted");
  });
});
