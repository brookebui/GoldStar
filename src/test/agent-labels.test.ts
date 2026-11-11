import { describe, expect, it } from "vitest";
import { agentProjectName, agents, projects } from "@/data/rule-scope";
import { createStarRun, starForAgents, type StarRun } from "@/data/star-tracking";

const scope = { projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] };

describe("Project attribution", () => {
  it("labels every agent with the name of the project it belongs to", () => {
    for (const agent of agents) {
      expect(agentProjectName(agent.id)).toBe(projects.find((p) => p.id === agent.projectId)?.name);
    }
  });

  it("never shows a job-title agent name", () => {
    expect(agentProjectName("product-a-builder")).toBe("Product A");
    expect(agentProjectName("product-b-checkout")).toBe("Product B");
    expect(agentProjectName("unknown-agent")).toBe("unknown-agent");
  });
});

describe("Project star tracking", () => {
  const runs: StarRun[] = [
    createStarRun([], "button-component", "product-a-builder", scope, true, "# Use Button"),
    createStarRun([], "button-component", "product-a-reviewer", scope, true, "# Use Button"),
  ];

  it("earns one star for a project from runs by any of its agents", () => {
    const star = starForAgents(runs, "button-component", ["product-a-builder", "product-a-reviewer"]);
    expect(star.state).toBe("bright");
    expect(star.earned).toBe(2);
  });

  it("dims the project star when its latest run deviates", () => {
    const deviated = createStarRun(runs, "button-component", "product-a-reviewer", scope, false, "# Use Button");
    const star = starForAgents([...runs, deviated], "button-component", ["product-a-builder", "product-a-reviewer"]);
    expect(star.state).toBe("dim");
    expect(star.earned).toBe(2);
  });

  it("ignores other projects' runs", () => {
    expect(starForAgents(runs, "button-component", ["product-b-developer"]).state).toBe("waiting");
  });
});
