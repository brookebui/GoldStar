import { canvasRules, initialRuleDrafts, scopeForRule, type CanvasRule } from "@/data/canvas-rules";
import { projects } from "@/data/rule-scope";

/** Built-in example rules only; session edits live in the browser and are never visible here. */
export const toRuleJson = (rule: CanvasRule) => {
  const draft = initialRuleDrafts[rule.id];
  const reach = draft ? scopeForRule(draft).projects : [];
  return { id: rule.id, name: rule.name, title: rule.title, category: rule.category, scope: rule.scopeType, projectIds: reach, projects: reach.map((id) => projects.find((p) => p.id === id)?.name ?? id), convention: rule.markdown ?? rule.convention };
};
export const exampleRules = () => canvasRules;
export const exampleProjects = () => projects.slice(0, 2).map((p) => ({ id: p.id, name: p.name, description: p.description, convention: p.convention }));
