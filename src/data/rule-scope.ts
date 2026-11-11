import { initialAgents } from "./agent-identity";
export type ScopeDraft = { projects: string[]; agents: string[] };
export const canvasRule = {
  id: "button-component",
  title: "Use the design system's Button component instead of creating custom buttons.",
  convention: 'import { Button } from "@/components/ui/button";\n\n<Button>Save changes</Button>',
};
export const projects = [
  { id: "product-a", name: "Product A", description: "Customer workspace", convention: "Shared design system", component: "@/components/ui/button" },
  { id: "product-b", name: "Product B", description: "Commerce storefront", convention: "Commerce UI kit", component: "@/commerce/ui/action-button" },
];
export const agents = initialAgents;
/** Agents carry no editable display name: their work is attributed to the project they belong to. */
export function agentProjectName(agentId: string): string {
  const agent = agents.find((a) => a.id === agentId);
  return projects.find((p) => p.id === agent?.projectId)?.name ?? agentId;
}
export const emptyScope: ScopeDraft = { projects: [], agents: [] };
export function setProjectScope(scope: ScopeDraft, id: string, include: boolean): ScopeDraft {
  const childIds = agents.filter((a) => a.projectId === id).map((a) => a.id);
  return {
    projects: include ? [...new Set([...scope.projects, id])] : scope.projects.filter((p) => p !== id),
    agents: include ? [...new Set([...scope.agents, ...childIds])] : scope.agents.filter((a) => !childIds.includes(a)),
  };
}
export function setAgentScope(scope: ScopeDraft, id: string, include: boolean): ScopeDraft {
  const agent = agents.find((a) => a.id === id);
  if (!agent || !scope.projects.includes(agent.projectId)) return scope;
  return { ...scope, agents: include ? [...new Set([...scope.agents, id])] : scope.agents.filter((a) => a !== id) };
}
export function hasConflict(scope: ScopeDraft) { return scope.projects.includes("product-b"); }
export function canApprove(scope: ScopeDraft) { return scope.projects.length > 0 && scope.agents.length > 0 && !hasConflict(scope); }