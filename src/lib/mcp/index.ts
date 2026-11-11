import { defineMcp } from "@lovable.dev/mcp-js";
import listExampleRules from "./tools/list-example-rules";
import getExampleRule from "./tools/get-example-rule";
import listExampleProjects from "./tools/list-example-projects";

export default defineMcp({
  name: "gold-star-2-0",
  title: "Gold Star 2.0",
  version: "0.1.0",
  instructions: "Read Gold Star's built-in example coding rules and projects, and export a rule for AGENTS.md, .cursorrules, or Claude. Session edits made in the app are not available.",
  tools: [listExampleRules, getExampleRule, listExampleProjects],
});
