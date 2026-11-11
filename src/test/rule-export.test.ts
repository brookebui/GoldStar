import { describe, expect, it } from "vitest";
import { exportRule, ruleLink, scopeLine } from "@/data/rule-export";
const rule = { id: "button", name: "Button convention", markdown: "Use the shared Button.", projectNames: ["Product A", "Product C"], global: true };
describe("rule export", () => {
  it("every format includes the rule markdown and its projects", () => {
    for (const f of ["agents", "cursor", "claude"] as const) {
      const out = exportRule(rule, f);
      expect(out).toContain("Use the shared Button.");
      expect(out).toContain("Product A, Product C");
    }
  });
  it("global rules are labeled Global", () => expect(scopeLine(rule)).toBe("Global · applies to Product A, Product C"));
  it("inactive rules report no projects", () => expect(scopeLine({ ...rule, projectNames: [] })).toBe("Not attached to any project yet."));
  it("links focus the rule on the canvas", () => expect(ruleLink("https://x.app", "button")).toBe("https://x.app/canvas?rule=button"));
});
