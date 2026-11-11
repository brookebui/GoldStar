import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { exampleRules, toRuleJson } from "../example-data";

export default defineTool({
  name: "list_example_rules",
  title: "List example rules",
  description: "List Gold Star's built-in example rules, optionally filtered by scope or project id.",
  inputSchema: {
    scope: z.enum(["global", "local"]).optional().describe("Only rules with this scope."),
    project_id: z.string().max(80).optional().describe("Only rules that apply to this project id, e.g. product-a."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ scope, project_id }) => {
    const rules = exampleRules().map(toRuleJson).filter((r) => (!scope || r.scope === scope) && (!project_id || r.projectIds.includes(project_id)));
    const text = rules.length ? rules.map((r) => `${r.id}: ${r.name} (${r.scope}, ${r.category}) → ${r.projects.join(", ")}`).join("\n") : "No example rules match.";
    return { content: [{ type: "text", text }], structuredContent: { rules } };
  },
});
