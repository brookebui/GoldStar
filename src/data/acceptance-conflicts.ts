import type { CanvasRule } from "./canvas-rules";
import { agents, projects, type ScopeDraft } from "./rule-scope";

/** The seeded Button example conflicts with the approved commerce convention. */
export function acceptanceConflicts(ruleId: string, rules: CanvasRule[]) {
  if (ruleId !== "button-component") return [];
  const existing = rules.find((rule) => rule.id === "commerce-action-btn");
  const project = projects.find((item) => item.id === "product-b");
  return existing && project ? [{ project, existing }] : [];
}

export function appliedSelection(scope: ScopeDraft): ScopeDraft {
  const selectedAgents = agents.filter((agent) => scope.agents.includes(agent.id) && scope.projects.includes(agent.projectId));
  return { projects: projects.filter((project) => selectedAgents.some((agent) => agent.projectId === project.id)).map((project) => project.id), agents: selectedAgents.map((agent) => agent.id) };
}

export function canApplySelection(scope: ScopeDraft, conflictingProjectIds: string[], reviewedProjectIds: string[]) {
  const applied = appliedSelection(scope);
  return applied.agents.length > 0 && conflictingProjectIds.every((id) => !applied.projects.includes(id) || reviewedProjectIds.includes(id));
}