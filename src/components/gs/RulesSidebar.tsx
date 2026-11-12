import { Box, Globe, Layers, MapPin, PanelLeftClose, PanelLeftOpen, Search, SquarePen, Unlink } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { projects } from "@/data/rule-scope";
import { filteredRuleIds, type CanvasFilter } from "@/data/canvas-rules";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";
import { useRuleScope } from "./RuleScopeProvider";
import { RulesViewToggle } from "./RulesViewToggle";
import { ExampleRulesToggle } from "./ExampleRulesToggle";

type Props = { view: "canvas" | "list"; onFilterChange?: () => void; onToggleExamples?: () => void; onDraftRule: () => void; onAddProject: () => void };

/** Rules navigation shared by Canvas and List: search, view, scope/project filters and workspace actions. */
export function RulesSidebar({ view, onFilterChange, onToggleExamples, onDraftRule, onAddProject }: Props) {
  const { workspaceRules, scopes, rulesFilter, setRulesFilter, rulesQuery, setRulesQuery, rulesNavCollapsed, setRulesNavCollapsed } = useRuleScope();
  const count = (f: CanvasFilter) => filteredRuleIds(f, scopes, workspaceRules).length;
  const unassigned = count("unassigned");
  const pick = (f: CanvasFilter) => { setRulesFilter(f); onFilterChange?.(); };
  const item = (f: CanvasFilter, label: string, Icon: ComponentType<{ className?: string }>) => (
    <Tooltip key={f}><TooltipTrigger asChild>
      <button type="button" aria-pressed={rulesFilter === f} aria-label={label} onClick={() => pick(f)} className={cn("flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors", rulesFilter === f ? "bg-card text-gold shadow-soft" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground")}>
        <Icon className="size-4 shrink-0" /><span className="gs-rules-nav-copy min-w-0 flex-1 truncate text-left">{label}</span><span className="gs-rules-nav-copy font-mono text-[11px] text-muted-foreground">{count(f)}</span>
      </button>
    </TooltipTrigger>{rulesNavCollapsed && <TooltipContent side="right">{label} · {count(f)}</TooltipContent>}</Tooltip>
  );
  const filterIds = ["all", "global", "local", ...(unassigned > 0 ? ["unassigned"] : []), ...projects.map((p) => p.id)];
  useWebMCP({
    name: "list_rule_filters",
    description: "List the rule filters shown in the Rules sidebar with their rule counts, the active filter, and the search text.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () => runWebMCPTool("list_rule_filters", () => `Active: ${rulesFilter}${rulesQuery ? ` · search "${rulesQuery}"` : ""}\n` + filterIds.map((f) => `${f}: ${projects.find((p) => p.id === f)?.name ?? f} (${count(f)})`).join("\n")),
  });
  useWebMCP({
    name: "filter_rules",
    description: "Change which rules the Rules page shows: pick a filter id from list_rule_filters and/or set the search text.",
    inputSchema: { type: "object", properties: { filter: { type: "string", description: "Filter id, e.g. all, global, local, unassigned, or a project id." }, search: { type: "string", description: "Search text matched against rule name, title and category; empty clears it." } } },
    execute: (args: { filter?: unknown; search?: unknown }) => runWebMCPTool("filter_rules", () => {
      if (args.filter !== undefined && (typeof args.filter !== "string" || !filterIds.includes(args.filter))) throw new Error(`Unknown filter; expected one of ${filterIds.join(", ")}.`);
      if (args.search !== undefined && typeof args.search !== "string") throw new Error("Search must be text.");
      if (args.filter === undefined && args.search === undefined) throw new Error("Provide a filter or search.");
      if (typeof args.filter === "string") pick(args.filter);
      if (typeof args.search === "string") setRulesQuery(args.search);
      return "Rules view updated.";
    }),
  });
  const toggleLabel = rulesNavCollapsed ? "Expand Constellations" : "Collapse Constellations";
  return <TooltipProvider delayDuration={150}><aside data-collapsed={rulesNavCollapsed} aria-label="Rules navigation" className="gs-rules-nav paper-grid flex h-dvh shrink-0 flex-col border-r border-border">
    <div className="gs-rules-nav-header shrink-0 bg-background px-8 pb-6 pt-10">
      <div className="gs-rules-nav-header-row flex items-start justify-between gap-2">
        <h1 className="gs-rules-nav-copy gs-section-title">Constellations</h1>
        <Button type="button" variant="ghost" size="icon" aria-label={toggleLabel} aria-expanded={!rulesNavCollapsed} aria-controls="constellations-nav" title={toggleLabel} onClick={() => setRulesNavCollapsed((collapsed) => !collapsed)} className="size-8 shrink-0 text-muted-foreground">
          {rulesNavCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>
      <p className="gs-rules-nav-copy gs-secondary mt-3">Manage how your rules connect across projects.</p>
      <div className="gs-rules-nav-copy relative mt-6"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input value={rulesQuery} onChange={(e) => setRulesQuery(e.target.value)} placeholder="Search rules" aria-label="Search rules" className="h-8 pl-8 text-sm" /></div>
      <div className="mt-3"><RulesViewToggle view={view} /></div>
    </div>
    <nav id="constellations-nav" aria-label="Rule filters" className="gs-rules-nav-filters min-h-0 flex-1 space-y-5 overflow-y-auto px-8 pb-4">
      <div className="space-y-0.5">
        {item("all", "All rules", Layers)}
        <div data-tour="global-local" className="space-y-0.5">
          {item("global", "Global", Globe)}
          {item("local", "Local", MapPin)}
        </div>
        {unassigned > 0 && item("unassigned", "Unassigned", Unlink)}
      </div>
      <div className="space-y-0.5">
        <p className="gs-rules-nav-copy gs-overline px-2.5 pb-1">Projects</p>
        {projects.map((p) => item(p.id, p.name, Box))}
      </div>
    </nav>
    <div className="gs-rules-nav-footer shrink-0 flex flex-col space-y-2 border-t border-border bg-[#09090B] px-8 py-4">
      <Tooltip><TooltipTrigger asChild>
        <Button variant="outline" size="sm" className="gs-rules-nav-action w-full justify-start bg-[#09090B]" onClick={onDraftRule} aria-label="Draft rule"><SquarePen className="size-3.5" /><span className="gs-rules-nav-copy">Draft rule</span></Button>
      </TooltipTrigger>{rulesNavCollapsed && <TooltipContent side="right">Draft rule</TooltipContent>}</Tooltip>
      <Tooltip><TooltipTrigger asChild>
        <Button variant="outline" size="sm" className="gs-rules-nav-action w-full justify-start bg-[#09090B]" onClick={onAddProject} aria-label="Add project"><Box /><span className="gs-rules-nav-copy">Add project</span></Button>
      </TooltipTrigger>{rulesNavCollapsed && <TooltipContent side="right">Add project</TooltipContent>}</Tooltip>
      <ExampleRulesToggle onToggle={onToggleExamples} />
    </div>
  </aside></TooltipProvider>;
}
