import { describe, expect, it } from "vitest";
import { createStarRun, starFor } from "@/data/star-tracking";

const scope = { projects: ["product-a"], agents: ["product-a-builder"] };
const first = createStarRun([], "button-component", "product-a-builder", scope, true, "Use Button");
const broken = createStarRun([first], "button-component", "product-a-builder", scope, false, "Use Button");

describe("Agent–rule stars", () => {
  it("has no earned star before a run follows the rule", () => {
    expect(starFor([], "button-component", "product-a-builder")).toMatchObject({ state: "waiting", earned: 0 });
  });
  it("brightens when a delivered run follows the rule", () => {
    expect(starFor([first], "button-component", "product-a-builder")).toMatchObject({ state: "bright", earned: 1 });
  });
  it("dims on a later deviation without erasing earlier earned stars", () => {
    expect(starFor([first, broken], "button-component", "product-a-builder")).toMatchObject({ state: "dim", earned: 1 });
  });
  it("does not dim when a later run never received the rule", () => {
    const excluded = createStarRun([first], "button-component", "product-a-builder", { projects: [], agents: [] }, false, "Use Button");
    expect(starFor([first, excluded], "button-component", "product-a-builder").state).toBe("bright");
  });
  it("brightens again after a recovery run", () => {
    const recovered = createStarRun([first, broken], "button-component", "product-a-builder", scope, true, "Use Button");
    expect(starFor([first, broken, recovered], "button-component", "product-a-builder")).toMatchObject({ state: "bright", earned: 2 });
  });
  it("keeps stars separate for each agent and each rule", () => {
    expect(starFor([first], "spacing-tokens", "product-a-builder").state).toBe("waiting");
    expect(starFor([first], "button-component", "product-a-reviewer").state).toBe("waiting");
  });
  it("keeps delivery and rule text as a run-time snapshot", () => {
    const changed = { ...scope, agents: [] };
    expect(changed.agents).toHaveLength(0);
    expect(first).toMatchObject({ delivered: true, markdown: "Use Button" });
    expect(starFor([first], "button-component", "product-a-builder").state).toBe("bright");
  });
});