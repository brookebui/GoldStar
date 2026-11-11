import { describe, expect, it } from "vitest";
import { demoScope, deliveryFor, executions, followedFor } from "@/data/receipts";

const run = (id: string) => executions.find((e) => e.id === id)!;
describe("Receipts statuses", () => {
  it("Agents 1 and 2 are delivered and followed", () => {
    for (const id of ["run_a1", "run_a2"]) {
      expect(deliveryFor(run(id), demoScope)).toBe("delivered");
      expect(followedFor(run(id), demoScope)).toBe("followed");
    }
  });
  it("Agent 3 is delivered but not followed", () => {
    expect(deliveryFor(run("run_a3"), demoScope)).toBe("delivered");
    expect(followedFor(run("run_a3"), demoScope)).toBe("not-followed");
  });
  it("Agent 4 in Product B is not targeted, not failed", () => {
    expect(deliveryFor(run("run_b4"), demoScope)).toBe("not-targeted");
    expect(followedFor(run("run_b4"), demoScope)).toBe("not-evaluated");
  });
  it("removing the builder from scope makes its runs not targeted", () => {
    const scope = { projects: ["product-a"], agents: ["product-a-reviewer"] };
    expect(deliveryFor(run("run_a3"), scope)).toBe("not-targeted");
  });
  it("one agent can own multiple runs", () => {
    expect(executions.filter((e) => e.agentId === "product-a-builder")).toHaveLength(2);
  });
});
