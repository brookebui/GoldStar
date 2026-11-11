import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { exportRule, type ExportFormat } from "@/data/rule-export";
import { exampleRules, toRuleJson } from "../example-data";

export default defineTool({
  name: "get_example_rule",
  title: "Get example rule",
  description: "Get one built-in example rule, optionally formatted for AGENTS.md, .cursorrules, or Claude instructions.",
  inputSchema: {
    id: z.string().min(1).max(80).describe("Rule id from list_example_rules."),
    format: z.enum(["agents", "cursor", "claude"]).optional().describe("Export format for the rule text."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id, format }) => {
    const rule = exampleRules().find((r) => r.id === id);
    if (!rule) throw new ToolError(`Unknown rule id "${id}".`);
    const json = toRuleJson(rule);
    const text = format ? exportRule({ id: json.id, name: json.name, markdown: `${json.title}\n\n${json.convention}`, projectNames: json.projects, global: json.scope === "global" }, format as ExportFormat) : `${json.name}\n${json.title}\n\n${json.convention}`;
    return { content: [{ type: "text", text }], structuredContent: { rule: json } };
  },
});
