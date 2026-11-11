import { describe, expect, it } from "vitest";
import { canvasRules } from "@/data/canvas-rules";
import { initialCanvasView, journeyRules } from "@/data/rule-journey";

describe("Inbox to Canvas journey", () => {
  it("opens the normal canvas with all six example rules instead of an empty screen", () => {
    const view = initialCanvasView();
    expect(view.focusRule).toBe("all");
    expect(journeyRules(canvasRules, {}, view.includeExamples)).toHaveLength(6);
  });
  it("keeps an Inbox handoff focused on the accepted rule without examples", () => {
    const view = initialCanvasView("button-component");
    expect(view).toEqual({ includeExamples: false, focusRule: "button-component" });
    const accepted = { "button-component": { projects: ["product-a"], agents: ["product-a-builder"] } };
    expect(journeyRules(canvasRules, accepted, view.includeExamples).map((r) => r.id)).toEqual(["button-component"]);
    expect(journeyRules(canvasRules, accepted, true)).toHaveLength(6);
  });
});