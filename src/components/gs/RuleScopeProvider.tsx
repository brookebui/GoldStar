import { createContext, useContext, useState, type ReactNode } from "react";
import { canvasRules, initialRuleDrafts, type CanvasRule, type RuleDraft } from "@/data/canvas-rules";
import { scopeFromSelection, scopeForRule, type CanvasFilter } from "@/data/canvas-rules";
import { projects, type ScopeDraft } from "@/data/rule-scope";
import type { Suggestion } from "@/data/suggestions";
import { createStarRun, type StarRun } from "@/data/star-tracking";
import { journeyRules } from "@/data/rule-journey";

type ScopeContext = {
  rules: CanvasRule[];
  workspaceRules: CanvasRule[];
  includeExamples: boolean;
  setIncludeExamples: (value: boolean) => void;
  rulesFilter: CanvasFilter;
  setRulesFilter: (value: CanvasFilter) => void;
  rulesQuery: string;
  setRulesQuery: (value: string) => void;
  rulesNavCollapsed: boolean;
  setRulesNavCollapsed: (value: boolean | ((current: boolean) => boolean)) => void;
  scopes: Record<string, RuleDraft>;
  accepted: Record<string, ScopeDraft>;
  latestAcceptedId: string | null;
  verificationRuns: StarRun[];
  addExampleRun: (ruleId: string, agentId: string, passed: boolean) => void;
  archived: string[];
  projectCount: number;
  addProject: (name: string, description: string, inheritGlobal?: boolean) => string;
  removeProject: (id: string) => void;
  draftRule: (name: string, title: string, category: string) => string;
  archive: (id: string) => void;
  editRule: (id: string, patch: Partial<Pick<CanvasRule, "name" | "title" | "category" | "markdown">>) => void;
  update: (id: string, scope: RuleDraft) => void;
  accept: (suggestion: Suggestion, scope: ScopeDraft, markdown: string) => void;
};
const Context = createContext<ScopeContext | null>(null);
export function RuleScopeProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState(canvasRules);
  const [scopes, setScopes] = useState(initialRuleDrafts);
  const [accepted, setAccepted] = useState<Record<string, ScopeDraft>>({});
  const [latestAcceptedId, setLatestAcceptedId] = useState<string | null>(null);
  const [verificationRuns, setVerificationRuns] = useState<StarRun[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [rulesFilter, setRulesFilter] = useState<CanvasFilter>("all");
  const [rulesQuery, setRulesQuery] = useState("");
  const [rulesNavCollapsed, setRulesNavCollapsed] = useState(false);
  const [projectCount, setProjectCount] = useState(projects.length);
  const workspaceRules = journeyRules(rules, accepted, includeExamples).filter((rule) => !archived.includes(rule.id));
  return <Context.Provider value={{ rules, workspaceRules, includeExamples, setIncludeExamples, rulesFilter, setRulesFilter, rulesQuery, setRulesQuery, rulesNavCollapsed, setRulesNavCollapsed, scopes, accepted, latestAcceptedId, verificationRuns, archived, projectCount,
    addProject: (name, description, inheritGlobal = true) => {
      const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
      let id = base; let n = 2; while (projects.some((p) => p.id === id)) id = `${base}-${n++}`;
      // Session-only demo: project registry is extended in place so shared scope helpers see it.
      projects.push({ id, name: name.trim(), description: description.trim() || "New project", convention: "Shared design system", component: "@/components/ui/button" });
      if (!inheritGlobal) {
        // Isolated project: every global rule excludes it, so only directly wired rules apply.
        setScopes((current) => {
          const next = Object.fromEntries(Object.entries(current).map(([ruleId, d]) => [ruleId, d.scopeType === "global" ? { ...d, excludedProjects: [...d.excludedProjects, id] } : d]));
          setAccepted((acc) => Object.fromEntries(Object.entries(acc).map(([ruleId, a]) => { const d = next[ruleId]; return [ruleId, d ? scopeForRule(d) : a]; })));
          return next;
        });
      }
      setProjectCount(projects.length);
      return id;
    },
    removeProject: (id) => {
      const index = projects.findIndex((p) => p.id === id);
      if (index < 0) return;
      // Session-only demo: removing a project detaches every rule from it; local rules left without a project become inactive.
      projects.splice(index, 1);
      setRulesFilter((f) => f === id ? "all" : f);
      setScopes((current) => {
        const next = Object.fromEntries(Object.entries(current).map(([ruleId, d]) => [ruleId, { ...d, excludedProjects: d.excludedProjects.filter((p) => p !== id) }]));
        setAccepted((acc) => Object.fromEntries(Object.entries(acc).map(([ruleId, a]) => { const d = next[ruleId]; return [ruleId, d ? scopeForRule(d) : a]; })));
        return next;
      });
      setProjectCount(projects.length);
    },
    draftRule: (name, title, category) => {
      const id = `custom-${Date.now().toString(36)}`;
      setRules((current) => [...current, { id, name: name.trim(), title: title.trim(), convention: title.trim(), category: category.trim() || "Custom", scopeType: "local", targetProjectId: projects[0]?.id ?? "product-a" }]);
      setScopes((current) => ({ ...current, [id]: { scopeType: "local", targetProjectId: projects[0]?.id ?? "product-a", excludedProjects: projects.map((p) => p.id), excludedAgents: [] } }));
      setAccepted((current) => ({ ...current, [id]: { projects: [], agents: [] } }));
      return id;
    },
    editRule: (id, patch) => setRules((current) => current.map((rule) => rule.id === id ? { ...rule, ...patch } : rule)),
    archive: (id) => setArchived((current) => current.includes(id) ? current : [...current, id]),
    addExampleRun: (ruleId, agentId, passed) => {
      const draft = scopes[ruleId];
      const rule = rules.find((item) => item.id === ruleId);
      if (!draft || !rule || !Object.hasOwn(accepted, ruleId)) return;
      const scope = scopeForRule(draft);
      setVerificationRuns((history) => [...history, createStarRun(history, ruleId, agentId, scope, passed, rule.markdown ?? rule.convention)]);
    },
    update: (id, scope) => {
      setScopes((current) => ({ ...current, [id]: scope }));
      setAccepted((current) => Object.hasOwn(current, id) ? { ...current, [id]: scopeForRule(scope) } : current);
    },
    accept: (suggestion, scope, markdown) => {
      if (scope.agents.length === 0) return;
      const nextScope = scopeFromSelection(scope);
      setRules((current) => {
        const existing = current.find((rule) => rule.id === suggestion.id);
        const rule: CanvasRule = { id: suggestion.id, name: existing?.name ?? suggestion.title.replace(/\.$/, ""), title: suggestion.title, convention: suggestion.after, category: suggestion.ruleCategory, scopeType: nextScope.scopeType, targetProjectId: nextScope.targetProjectId, markdown };
        return existing ? current.map((item) => item.id === rule.id ? rule : item) : [...current, rule];
      });
      setScopes((current) => ({ ...current, [suggestion.id]: nextScope }));
      setAccepted((current) => ({ ...current, [suggestion.id]: structuredClone(scope) }));
      setArchived((current) => current.filter((id) => id !== suggestion.id));
      setLatestAcceptedId(suggestion.id);
    },
  }}>{children}</Context.Provider>;
}
export function useRuleScope() {
  const context = useContext(Context);
  if (!context) throw new Error("Rule scope must be used within its provider");
  return context;
}