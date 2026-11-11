import { defineTool } from "@lovable.dev/mcp-js";
import { exampleProjects } from "../example-data";

export default defineTool({
  name: "list_example_projects",
  title: "List example projects",
  description: "List the built-in example projects that Gold Star rules apply to.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const list = exampleProjects();
    return { content: [{ type: "text", text: list.map((p) => `${p.id}: ${p.name} — ${p.description}`).join("\n") }], structuredContent: { projects: list } };
  },
});
