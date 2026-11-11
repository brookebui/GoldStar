import { agents, projects, type ScopeDraft } from "./rule-scope";

export type CanvasRule = { id: string; name: string; title: string; convention: string; category: string; scopeType: "global" | "local"; targetProjectId?: string; markdown?: string };
export const canvasRules: CanvasRule[] = [
  { id: "button-component", name: "Button convention", title: "Use the design system's Button component instead of creating custom buttons.", convention: 'import { Button } from "@/components/ui/button";\n\n<Button>Save changes</Button>', category: "Components", scopeType: "global" },
  { id: "design-tokens", name: "Semantic color tokens", title: "Reference semantic CSS tokens instead of hardcoded hex values.", convention: ".action {\n  color: var(--gold);\n  background: var(--muted);\n}", category: "Color", scopeType: "global" },
  { id: "commerce-action-btn", name: "Commerce Action Button", title: "Use @/commerce/ui/action-button with required checkout telemetry.", convention: 'import { ActionButton } from "@/commerce/ui/action-button";\n\n<ActionButton intent="buy" telemetry="checkout">\n  Checkout\n</ActionButton>', category: "Components", scopeType: "local", targetProjectId: "product-b" },
  { id: "type-hierarchy", name: "Typography hierarchy", title: "Use the design system's heading and body styles instead of ad hoc font sizes and weights.", convention: '<h2 className="text-heading">Account settings</h2>\n<p className="text-body">Manage your preferences.</p>', category: "Typography", scopeType: "global" },
  { id: "workspace-empty-states", name: "Workspace empty states", title: "In Product A, give empty workspaces a clear next step using the shared EmptyState component.", convention: '<EmptyState\n  title="No projects yet"\n  action={<Button>Create project</Button>}\n/>', category: "Components", scopeType: "local", targetProjectId: "product-a" },
  { id: "checkout-copy", name: "Checkout action copy", title: "In Product B, use specific purchase actions such as \"Place order\" instead of generic labels like \"Submit\".", convention: '<ActionButton intent="buy" telemetry="checkout">\n  Place order\n</ActionButton>', category: "Voice and copy", scopeType: "local", targetProjectId: "product-b" },
];
export type RuleDraft = { scopeType: "global" | "local"; targetProjectId: string; excludedProjects: string[]; excludedAgents: string[] };
export const initialRuleDrafts: Record<string, RuleDraft> = Object.fromEntries(canvasRules.map((rule) => [rule.id, { scopeType: rule.scopeType, targetProjectId: rule.targetProjectId ?? "product-a", excludedProjects: [], excludedAgents: [] }]));
export function scopeForRule(draft: RuleDraft): ScopeDraft {
  const included = projects.filter((p) => (draft.scopeType === "global" || p.id === draft.targetProjectId) && !draft.excludedProjects.includes(p.id)).map((p) => p.id);
  return { projects: included, agents: agents.filter((a) => included.includes(a.projectId) && !draft.excludedAgents.includes(a.id)).map((a) => a.id) };
}
export function canApproveRule(_rule: CanvasRule, draft: RuleDraft) { return scopeForRule(draft).agents.length > 0; }
export function scopeFromSelection(scope: ScopeDraft): RuleDraft {
  return { scopeType: scope.projects.length === 1 ? "local" : "global", targetProjectId: scope.projects[0] ?? "product-a", excludedProjects: projects.filter((p) => !scope.projects.includes(p.id)).map((p) => p.id), excludedAgents: agents.filter((a) => !scope.agents.includes(a.id)).map((a) => a.id) };
}
export function toggleRuleProject(draft: RuleDraft, id: string): RuleDraft { return { ...draft, excludedProjects: draft.excludedProjects.includes(id) ? draft.excludedProjects.filter((p) => p !== id) : [...draft.excludedProjects, id] }; }
export function toggleRuleAgent(draft: RuleDraft, id: string): RuleDraft { return { ...draft, excludedAgents: draft.excludedAgents.includes(id) ? draft.excludedAgents.filter((a) => a !== id) : [...draft.excludedAgents, id] }; }
export function rulebookFor(projectId: string, drafts: Record<string, RuleDraft>, agentId?: string, rules: CanvasRule[] = canvasRules) {
  return rules.flatMap((rule) => {
    const draft = drafts[rule.id];
    if (!draft) return [];
    const scope = scopeForRule(draft);
    if (!scope.projects.includes(projectId) || (agentId && !scope.agents.includes(agentId))) return [];
    return [{ rule, inherited: draft.scopeType === "global" }];
  });
}
export type CanvasFilter = "all" | "global" | "local" | "unassigned" | (string & {});
export function isUnassigned(draft: RuleDraft | undefined) { return Boolean(draft && scopeForRule(draft).projects.length === 0); }
export function matchesRuleQuery(rule: CanvasRule, query: string) { const q = query.trim().toLowerCase(); return !q || `${rule.name} ${rule.title} ${rule.category}`.toLowerCase().includes(q); }
export function filteredRuleIds(filter: CanvasFilter, drafts: Record<string, RuleDraft>, rules: CanvasRule[] = canvasRules): string[] {
  return rules.filter((rule) => {
    const draft = drafts[rule.id];
    if (!draft) return false;
    return filter === "all" || (filter === "unassigned" ? isUnassigned(draft) : filter === "global" ? draft.scopeType === "global" : filter === "local" ? draft.scopeType === "local" : scopeForRule(draft).projects.includes(filter));
  }).map((rule) => rule.id);
}