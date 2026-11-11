import { projects } from "./rule-scope";
import { scopeForRule, type RuleDraft } from "./canvas-rules";

export type WiringChange = { ruleId: string; next: RuleDraft; title: string; body: string; action: string; destructive?: boolean; lastWire?: boolean };
const name = (id: string) => projects.find((p) => p.id === id)?.name ?? id;

/** Connect a rule to a project or to the global inheritance junction. Returns null when nothing would change. */
export function connectChange(ruleId: string, ruleName: string, draft: RuleDraft, target: string): WiringChange | null {
  if (target === "inheritance") {
    if (draft.scopeType === "global" && draft.excludedProjects.length === 0) return null;
    return { ruleId, next: { ...draft, scopeType: "global", excludedProjects: [] }, title: `Make ${ruleName} a global rule?`, body: "Global rules apply to all projects. Every project, and every agent working in it, will follow this rule.", action: "Apply globally" };
  }
  if (!projects.some((p) => p.id === target)) return null;
  if (scopeForRule(draft).projects.includes(target)) return null;
  if (draft.scopeType === "global") return { ruleId, next: { ...draft, excludedProjects: draft.excludedProjects.filter((id) => id !== target) }, title: `Attach ${ruleName} to ${name(target)}?`, body: `This global rule will now also apply to ${name(target)}. Agents working in ${name(target)} will follow it.`, action: "Attach rule" };
  return { ruleId, next: { ...draft, scopeType: "local", targetProjectId: target, excludedProjects: [] }, title: `Attach ${ruleName} to ${name(target)}?`, body: `This is a local rule, so it will be attached only to ${name(target)}. ${draft.targetProjectId !== target ? `${name(draft.targetProjectId)} will no longer follow it.` : ""}`.trim(), action: "Attach rule" };
}

/** Cut a wire between a rule and a project (or the global junction). */
export function cutChange(ruleId: string, ruleName: string, draft: RuleDraft, other: string): WiringChange | null {
  if (other === "inheritance") return { ruleId, next: { ...draft, excludedProjects: projects.map((p) => p.id) }, title: `Disconnect ${ruleName} from all projects?`, body: "No project will follow this global rule anymore, so the rule will become inactive. Keep it in Canvas to rewire it later, or archive it.", action: "Keep in Canvas", destructive: true, lastWire: true };
  const current = scopeForRule(draft).projects;
  if (!current.includes(other)) return null;
  if (current.length === 1) return { ruleId, next: { ...draft, excludedProjects: [...draft.excludedProjects, other] }, title: `Disconnect ${ruleName} from ${name(other)}?`, body: `${name(other)} will stop following this rule. Because this is its only project, the rule will become inactive. Keep it in Canvas as an inactive rule you can rewire later, or archive it.`, action: "Keep in Canvas", destructive: true, lastWire: true };
  return { ruleId, next: { ...draft, excludedProjects: [...draft.excludedProjects, other] }, title: `Cut ${ruleName} from ${name(other)}?`, body: `${name(other)} will not follow this rule anymore. Agents working in ${name(other)} stop receiving it.`, action: "Cut wire", destructive: true };
}

/** Wire styling: scope hue when nothing is selected, gold spotlight / dim when something is. */
export function edgeClasses(scopeType: "global" | "local", selected: boolean, related: boolean): string {
  if (selected) return `scope-edge ${related ? "edge-spotlight" : "edge-muted"}`;
  return `scope-edge edge-included ${scopeType === "global" ? "edge-global" : "edge-local"}`;
}

/** Detach a rule from every project at once — the panel's alternative to cutting each wire. */
export function removeRuleChange(ruleId: string, ruleName: string, draft: RuleDraft): WiringChange | null {
  const current = scopeForRule(draft).projects;
  if (current.length === 0) return null;
  const next: RuleDraft = { ...draft, excludedProjects: [...new Set([...draft.excludedProjects, ...current])] };
  if (current.length === projects.length) return { ruleId, next, title: `Disconnect ${ruleName} from all projects?`, body: "No project will follow this global rule anymore, so the rule will become inactive. Keep it in Canvas to rewire it later, or archive it.", action: "Keep in Canvas", destructive: true, lastWire: true };
  const where = current.map(name).join(current.length === 1 ? "" : current.length === 2 ? " and " : ", ");
  return { ruleId, next, title: `Disconnect ${ruleName} from ${where}?`, body: `${where} will stop following this rule. Because ${current.length === 1 ? "this is its only project" : "these are its only projects"}, the rule will become inactive. Keep it in Canvas as an inactive rule you can rewire later, or archive it.`, action: "Keep in Canvas", destructive: true, lastWire: true };
}
