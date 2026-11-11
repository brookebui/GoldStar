import { RulesSidebar } from "./RulesSidebar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { ReactFlow, ReactFlowProvider, Handle, Position, useNodeConnections, useNodesState, useReactFlow, ConnectionMode, type Node, type NodeProps, type BuiltInEdge, type Connection } from "@xyflow/react";
import { ChevronRight, FileText, Upload, X, Minus, Plus, Maximize, Box, Bot, Globe, Layers, SquarePen, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { agents, agentProjectName, projects } from "@/data/rule-scope";
import { ShareRuleButton } from "./ShareRuleDialog";
import { canvasRules, scopeForRule, filteredRuleIds, matchesRuleQuery, rulebookFor } from "@/data/canvas-rules";
import { useRuleScope } from "./RuleScopeProvider";
import { Star, StarAvatar } from "./Star";
import { CanvasStarBurst, sparksFromPoint, type CanvasSpark } from "./CanvasStarBurst";
import nightSky from "@/assets/constellation-sky.jpg";
import { StatusBadge } from "./StatusBadge";
import { RunVerification } from "./RunVerification";
import { AgentLabel } from "./AgentLabel";
import { ScopeSummary } from "./ScopeSummary";
import { initialCanvasView } from "@/data/rule-journey";
import { starFor } from "@/data/star-tracking";
import { connectChange, cutChange, edgeClasses, removeRuleChange, type WiringChange } from "@/data/canvas-wiring";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type CanvasNode = Node<{ kind: "rule" | "project" | "agent" | "junction"; label: string; subtitle: string; global?: boolean; dim?: boolean; hint?: boolean | undefined; status?: string | undefined; starState?: "waiting" | "bright" | "dim" | undefined; exploding?: boolean }, "object">;
function ObjectNode({ data, selected }: NodeProps<CanvasNode>) {
  const incoming = useNodeConnections({ handleType: "target" });
  const outgoing = useNodeConnections({ handleType: "source" });
  const targetClass = incoming.length || data.kind === "project" || data.kind === "rule" ? undefined : "opacity-0";
  const sourceClass = outgoing.length || data.kind === "rule" || data.kind === "project" ? undefined : "opacity-0";
  if (data.kind === "junction") return <TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><div className={cn("canvas-junction", data.hint && "canvas-junction-drop")} aria-label="Global rule junction"><Handle type="target" position={Position.Top} /><Handle type="source" position={Position.Bottom} className="opacity-0" /><span className="gs-overline canvas-junction-label pointer-events-none absolute left-1/2 top-1/2 mt-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/75 px-2.5 py-1">{data.hint ? "Drop here to make global" : data.label}</span></div></TooltipTrigger><TooltipContent side="bottom" className="max-w-64 text-center">Global rules reach every project through here. Drag a rule's dot onto it to make that rule global — click a wire above it to detach that rule from all projects.</TooltipContent></Tooltip></TooltipProvider>;
  const Icon = data.kind === "rule" ? data.global ? Globe : Star : data.kind === "project" ? Box : Bot;
  return <div className={cn("canvas-object canvas-hierarchy-object p-4", selected && "canvas-selected canvas-included", data.dim && "canvas-dimmed", data.global && "canvas-global-rule", data.kind === "rule" && data.global === false && "canvas-local-rule", data.exploding && "canvas-explode")}>
    {!(data.kind === "rule" && data.global) && <Handle type="target" position={Position.Top} className={targetClass} />}
    <div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-gold-deep" /><span className="gs-overline">{data.kind === "rule" ? data.global ? "Global" : "Local" : data.kind}</span></div>
    <div className="flex items-center gap-3">{data.global && <StarAvatar className="size-12 shrink-0" />}<p className="gs-compact-label">{data.label}</p></div>
    <p className="mt-2 text-xs text-muted-foreground">{data.subtitle}</p>
    {data.status && <StatusBadge className="gs-node-badge mt-3" tone={data.starState === "dim" ? "negative" : data.starState === "bright" ? "positive" : "neutral"}>{data.starState && data.starState !== "waiting" && <Star className={cn("size-3", data.starState === "dim" && "opacity-30")} />}{data.status}</StatusBadge>}
    {data.kind !== "agent" && <Handle type="source" position={Position.Bottom} className={sourceClass} />}
  </div>;
}
const nodeTypes = { object: ObjectNode };
export function CreateDialog({ kind, onClose, onCreate, globalCount }: { kind: "project" | "rule" | null; onClose: () => void; onCreate: (kind: "project" | "rule", name: string, body: string, category: string, inherit: boolean) => void; globalCount: number }) {
  const [name, setName] = useState(""); const [body, setBody] = useState(""); const [category, setCategory] = useState(""); const [files, setFiles] = useState<File[]>([]); const [inherit, setInherit] = useState(true);
  useEffect(() => { if (kind) { setName(""); setBody(""); setCategory(""); setFiles([]); setInherit(true); } }, [kind]);
  const isRule = kind === "rule";
  const valid = !isRule || (name.trim().length > 0 && body.trim().length > 0);
  return <Dialog open={Boolean(kind)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>{isRule ? "Draft your own rule" : "Add a project"}</DialogTitle><DialogDescription>{isRule ? "Write a convention you already know you want. It lands on the canvas inactive — drag it to a project or Global to apply it." : "Add a codebase where agents work. Choose whether it starts with your Global rules or only rules you wire to it."}</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!valid || !kind) return; onCreate(kind, isRule ? name : name.trim() || "Untitled project", isRule ? body : files.length ? `${files.length} file${files.length === 1 ? "" : "s"} uploaded` : "", category, inherit); onClose(); }}>
      <div className="space-y-1.5"><Label htmlFor="create-name">{isRule ? "Rule name" : <>Project name <span className="text-muted-foreground">(optional)</span></>}</Label><Input id="create-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={isRule ? "e.g. Form field labels" : "e.g. Payments service"} /></div>
      {isRule ? <><div className="space-y-1.5"><Label htmlFor="create-body">Rule</Label><Textarea id="create-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="e.g. Every form input needs a visible label." /></div><div className="space-y-1.5"><Label htmlFor="create-category">Category <span className="text-muted-foreground">(optional)</span></Label><Input id="create-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Accessibility" /></div>
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">Looking for rules learned from agent corrections? <Link to="/" className="text-gold underline-offset-2 hover:underline" onClick={onClose}>Review Proposed Rules</Link></p></>
        : <div className="space-y-1.5"><Label htmlFor="create-files">Project files</Label>
          <label htmlFor="create-files" className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-gold hover:bg-muted/50"><Upload className="size-5 text-gold" /><span className="text-sm font-medium">Upload project files</span><span className="text-xs text-muted-foreground">Config, style guides, or components agents should know about</span></label>
          <input id="create-files" type="file" multiple className="sr-only" onChange={(e) => { const picked = Array.from(e.target.files ?? []); setFiles((current) => [...current, ...picked.filter((f) => !current.some((c) => c.name === f.name))]); e.target.value = ""; }} />
          {files.length > 0 && <ul className="space-y-1">{files.map((f) => <li key={f.name} className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs"><FileText className="size-3.5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate">{f.name}</span><button type="button" aria-label={`Remove ${f.name}`} className="text-muted-foreground hover:text-foreground" onClick={() => setFiles((current) => current.filter((c) => c.name !== f.name))}><X className="size-3.5" /></button></li>)}</ul>}
          <p className="text-xs text-muted-foreground">Files stay in this session only — nothing is stored yet.</p></div>}
      {!isRule && <label htmlFor="create-inherit" className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5"><Checkbox id="create-inherit" className="mt-0.5" checked={inherit} onCheckedChange={(v) => setInherit(v === true)} /><span className="space-y-0.5"><span className="block text-sm font-medium">Inherit Global rules <span className="font-normal text-muted-foreground">({globalCount} active)</span></span><span className="block text-xs text-muted-foreground">{inherit ? "Automatically applies your organization's standards to this project." : "Local rules only — the project starts isolated with no wires attached."}</span></span></label>}
      <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!valid}>{isRule ? "Add to canvas" : "Add project"}</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}
const layoutNodes: CanvasNode[] = [
  ...canvasRules.map((rule): CanvasNode => {
    const peers = canvasRules.filter((item) => item.scopeType === rule.scopeType && (rule.scopeType === "global" || item.targetProjectId === rule.targetProjectId));
    const index = peers.findIndex((item) => item.id === rule.id);
    return { id: rule.id, type: "object", position: rule.scopeType === "global" ? { x: 100 + index * 285, y: 0 } : { x: rule.targetProjectId === "product-a" ? 95 : 560, y: 565 + index * 180 }, data: { kind: "rule", label: rule.name, subtitle: rule.category } };
  }),
  { id: "inheritance", type: "object", selectable: false, draggable: false, connectable: false, position: { x: 345, y: 250 }, data: { kind: "junction", label: "Global inheritance", subtitle: "" } },
  ...projects.map((p, i): CanvasNode => ({ id: p.id, type: "object", position: { x: 95 + i * 465, y: 355 }, data: { kind: "project", label: p.name, subtitle: p.description } })),
];
function CanvasWorkspace() {
  const search = useSearch({ from: "/canvas" });
  const { rulesFilter: filter, setRulesFilter: setFilter, rulesQuery, rules, workspaceRules, includeExamples, setIncludeExamples, scopes, update, accepted, verificationRuns, archived, archive, projectCount, addProject, removeProject, draftRule } = useRuleScope();
  const [removing, setRemoving] = useState<{ id: string; name: string; rules: string[] } | null>(null);
  const [creating, setCreating] = useState<"project" | "rule" | null>(null);
  const [bursting, setBursting] = useState<string | null>(null);
  const [sparks, setSparks] = useState<CanvasSpark[]>([]);
  const burstTimers = useRef<number[]>([]);
  useEffect(() => () => burstTimers.current.forEach(clearTimeout), []);
  const isInactive = (id: string) => { const d = scopes[id]; return Boolean(d && scopeForRule(d).projects.length === 0); };
  const initialView = initialCanvasView(search.rule);
  useEffect(() => {
    if (search.rule) setIncludeExamples(false);
  }, [search.rule, setIncludeExamples]);
  const [selected, setSelected] = useState<string | null>(search.rule ?? null);
  const [focusRule, setFocusRule] = useState(initialView.focusRule);
  const [wiring, setWiring] = useState(false);
  const [positions, setPositions, onNodesChange] = useNodesState<CanvasNode>(layoutNodes);
  useEffect(() => {
    setPositions((current) => [...current, ...rules.filter((item) => !current.some((node) => node.id === item.id)).map((item): CanvasNode => ({ id: item.id, type: "object", position: { x: 0, y: 0 }, data: { kind: "rule", label: item.name, subtitle: item.category } }))]);
  }, [rules, setPositions]);
  useEffect(() => {
    setPositions((current) => [...current, ...projects.filter((p) => !current.some((node) => node.id === p.id)).map((p): CanvasNode => { const i = projects.indexOf(p); return { id: p.id, type: "object", position: { x: 95 + (i + 1) * 465, y: 355 }, data: { kind: "project", label: p.name, subtitle: p.description } }; })]);
  }, [projectCount, setPositions]);
  const flow = useReactFlow();
  const surfaceRef = useRef<HTMLElement>(null);
  const verificationRef = useRef<HTMLDivElement>(null);
  const visibleRules = filteredRuleIds(filter, scopes, workspaceRules).filter((id) => matchesRuleQuery(workspaceRules.find((r) => r.id === id)!, rulesQuery)).filter((id) => focusRule === "all" || id === focusRule);
  const rule = rules.find((r) => r.id === selected);
  const project = projects.find((p) => p.id === selected);
  const agent = agents.find((a) => a.id === selected);
  const currentScope = rule ? scopes[rule.id] : undefined;
  const scope = currentScope ? scopeForRule(currentScope) : undefined;
  const focusedScopeState = scopes[focusRule];
  const focusedScope = focusRule !== "all" && focusedScopeState ? scopeForRule(focusedScopeState) : undefined;
  const visibleProjects = projects.filter((p) => (filter === "all" || filter === "global" || filter === "local" || filter === p.id) && (focusedScope || (filter === "all" && focusRule === "all") || visibleRules.some((id) => { const d = scopes[id]; return d && scopeForRule(d).projects.includes(p.id); }))).map((p) => p.id);
  const related = new Set<string>();
  if (rule && currentScope) { related.add(rule.id); const s = scopeForRule(currentScope); s.projects.forEach((id) => related.add(id)); s.agents.forEach((id) => related.add(id)); }
  if (project || agent) { const pid = project?.id ?? agent?.projectId ?? ""; related.add(pid); (agent ? [agent] : agents.filter((a) => a.projectId === pid)).forEach((a) => related.add(a.id)); rulebookFor(pid, scopes, agent?.id, rules).forEach((entry) => related.add(entry.rule.id)); }
  const globalsVisible = visibleRules.some((id) => scopes[id]?.scopeType === "global");
  if (globalsVisible && selected) related.add("inheritance");
  const visibleKey = `${visibleRules.join(",")}:${visibleProjects.join(",")}:${selected ? "open" : "closed"}`;
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    let timer: ReturnType<typeof setTimeout>;
    const fit = () => { clearTimeout(timer); timer = setTimeout(() => { void flow.fitView({ padding: 0.16, duration: 200 }); }, 100); };
    const observer = new ResizeObserver(fit); observer.observe(surface); fit();
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [flow, visibleKey]);
  const nodes = useMemo(() => positions.map((node) => {
    const item = rules.find((r) => r.id === node.id);
    const identity = agents.find((a) => a.id === node.id);
    const d = item ? scopes[item.id] : undefined;
    const global = d?.scopeType === "global";
    const hidden = bursting === node.id ? false : item && archived.includes(item.id) ? true : item ? !visibleRules.includes(item.id) : identity ? !visibleProjects.includes(identity.projectId) : node.id === "inheritance" ? !globalsVisible || Boolean(focusedScope) : !visibleProjects.includes(node.id);
    const localCount = identity ? workspaceRules.filter((r) => scopes[r.id]?.scopeType === "local" && scopes[r.id]?.targetProjectId === identity.projectId).length : 0;
    const excluded = focusedScope && (identity ? !focusedScope.agents.includes(identity.id) : node.data.kind === "project" ? !focusedScope.projects.includes(node.id) : false);
    const defaultPosition = item && d && !global ? { x: d.targetProjectId === "product-a" ? 95 : 560, y: 565 + workspaceRules.filter((r) => scopes[r.id]?.scopeType === "local" && scopes[r.id]?.targetProjectId === d.targetProjectId).findIndex((r) => r.id === item.id) * 180 } : item && global ? { x: 100 + workspaceRules.filter((r) => scopes[r.id]?.scopeType === "global").findIndex((r) => r.id === item.id) * 285, y: 0 } : identity ? { ...node.position, y: 805 + Math.max(0, localCount - 1) * 180 } : node.position;
    const initial = layoutNodes.find((n) => n.id === node.id);
    const focusedPosition = item ? { x: 327.5, y: 0 } : identity ? { x: node.position.x, y: 560 } : node.data.kind === "project" ? { x: node.position.x, y: 300 } : defaultPosition;
    const position = initial && (node.position.x !== initial.position.x || node.position.y !== initial.position.y) ? node.position : focusedScope ? focusedPosition : defaultPosition;
    const starState = identity && focusedScope && accepted[focusRule] ? starFor(verificationRuns, focusRule, identity.id).state : undefined;
    return { ...node, position, hidden, selected: selected === node.id, ariaLabel: `${node.data.kind}: ${identity ? agentProjectName(identity.id) : node.data.label}`, data: { ...node.data, exploding: bursting === node.id, label: identity ? agentProjectName(identity.id) : item?.name ?? node.data.label, subtitle: identity?.tool ?? (item && d ? isInactive(item.id) ? `${item.category} · Unassigned` : global ? `${item.category} · All projects` : `${item.category} · ${projects.find((p) => p.id === d.targetProjectId)?.name}` : node.data.subtitle), global, starState, dim: Boolean(excluded || (item && isInactive(item.id)) || selected && !related.has(node.id)), hint: node.id === "inheritance" ? wiring : undefined, status: excluded ? "Excluded from this rule" : starState ? starState === "bright" ? "Star earned" : starState === "dim" ? "Deviated · Star dimmed" : "Awaiting a run" : item ? isInactive(item.id) ? "Inactive · No projects" : accepted[item.id] ? "Accepted" : "Example" : node.data.kind === "project" ? `${rulebookFor(node.id, scopes, undefined, workspaceRules).length} rules` : undefined } };
  }), [positions, rules, scopes, projectCount, agents, selected, visibleKey, includeExamples, accepted, verificationRuns, wiring, bursting]);
  const edges: BuiltInEdge[] = [];
  function addEdge(source: string, target: string, ruleId?: string, stepPosition?: number) {
    const scopeType = ruleId ? scopes[ruleId]?.scopeType ?? "global" : "global";
    edges.push({ id: `${source}-${target}`, source, target, interactionWidth: 18, type: "smoothstep", pathOptions: stepPosition === undefined ? {} : { stepPosition }, data: { ruleId }, className: edgeClasses(scopeType, Boolean(selected), related.has(source) && related.has(target)) });
  }
  // Global wires share one entry point, so without this they bend at the same height and stack into one doubled line.
  const globalLanes = visibleRules.filter((id) => scopes[id]?.scopeType === "global" && !isInactive(id));
  const laneOf = (id: string) => globalLanes.length < 2 ? 0.5 : 0.18 + (0.64 * globalLanes.indexOf(id)) / (globalLanes.length - 1);
  visibleRules.forEach((id) => { const d = scopes[id]; if (!d || isInactive(id)) return; if (focusedScope) focusedScope.projects.filter((pid) => visibleProjects.includes(pid)).forEach((pid) => addEdge(id, pid, id)); else if (d.scopeType === "global") addEdge(id, "inheritance", id, laneOf(id)); else if (visibleProjects.includes(d.targetProjectId)) addEdge(d.targetProjectId, id, id); });
  if (globalsVisible && !focusedScope) visibleProjects.filter((pid) => visibleRules.some((rid) => { const d = scopes[rid]; return d?.scopeType === "global" && scopeForRule(d).projects.includes(pid); })).forEach((id) => addEdge("inheritance", id));
  function resetView() { setFocusRule("all"); setSelected(null); }
  const [pending, setPending] = useState<WiringChange | null>(null);
  function explode(nodeId: string, onDone: () => void, collapse = true) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const surface = surfaceRef.current;
    const nodeEl = surface?.querySelector(`.react-flow__node[data-id="${CSS.escape(nodeId)}"]`);
    if (reduce || !surface || !nodeEl) { onDone(); return; }
    const nodeBox = nodeEl.getBoundingClientRect();
    const surfaceBox = surface.getBoundingClientRect();
    setSparks(sparksFromPoint(nodeBox.left - surfaceBox.left + nodeBox.width / 2, nodeBox.top - surfaceBox.top + nodeBox.height / 2));
    if (collapse) setBursting(nodeId);
    burstTimers.current.push(window.setTimeout(() => { onDone(); setBursting(null); }, collapse ? 520 : 180));
    burstTimers.current.push(window.setTimeout(() => setSparks([]), 1100));
  }
  function wire(a: string, b: string, cut: boolean) {
    const r = rules.find((item) => item.id === a) ?? rules.find((item) => item.id === b);
    const d = r ? scopes[r.id] : undefined;
    if (!r || !d) return;
    const other = r.id === a ? b : a;
    setPending(cut ? cutChange(r.id, r.name, d, other) : connectChange(r.id, r.name, d, other));
  }
  function connect(connection: Connection) { wire(connection.source, connection.target, false); }
  const rulebook = project || agent ? rulebookFor(project?.id ?? agent?.projectId ?? "", scopes, agent?.id, workspaceRules) : [];
  const verificationRuleId = rule?.id ?? (focusRule !== "all" ? focusRule : "button-component");
  const verificationScopeState = scopes[verificationRuleId];
  const verificationScope = verificationScopeState ? scopeForRule(verificationScopeState) : { projects: [], agents: [] };
  return <div className="canvas-page flex"><RulesSidebar view="canvas" onFilterChange={resetView} onDraftRule={() => setCreating("rule")} onAddProject={() => setCreating("project")} onToggleExamples={resetView} />
    <div className="flex min-w-0 flex-1 flex-col"><div className="canvas-workspace grid flex-1" data-inspector={selected ? "open" : "closed"}>
      <section ref={surfaceRef} className="canvas-surface relative min-w-0" aria-label="Rule scope canvas">
        <img src={nightSky} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onConnect={connect} connectionMode={ConnectionMode.Loose} onConnectStart={(_, params) => setWiring(Boolean(params.nodeId && rules.some((r) => r.id === params.nodeId)))} onConnectEnd={() => setWiring(false)} onNodeClick={(_, node) => { if (node.id !== "inheritance") { setSelected(node.id); } }} onPaneClick={() => { setSelected(null); }} onEdgeClick={(_, edge) => { if (edge.data?.["ruleId"]) wire(edge.source, edge.target, true); }} onEdgesDelete={(deleted) => { const edge = deleted.find((e) => e.data?.["ruleId"]); if (edge) wire(edge.source, edge.target, true); }} deleteKeyCode={null} fitView fitViewOptions={{ padding: 0.16 }} minZoom={0.2} maxZoom={1.7} proOptions={{ hideAttribution: true }} />
        <CanvasStarBurst sparks={sparks} />
        {visibleRules.length === 0 && <div className="absolute inset-x-0 top-20 flex flex-col items-center gap-4 text-center"><p className="text-sm text-muted-foreground">{workspaceRules.length === 0 ? "No rules accepted yet" : "No rules in this view"}</p><Button variant="outline" asChild><Link to="/">Review Learning Inbox</Link></Button></div>}
        <div className="absolute bottom-5 left-5 z-10 flex items-center rounded-full border border-border bg-card/70 p-0.5 opacity-70 shadow-soft backdrop-blur transition-opacity hover:opacity-100 focus-within:opacity-100"><Button variant="ghost" size="icon" title="Zoom out" aria-label="Zoom out" onClick={() => flow.zoomOut()}><Minus /></Button><Button variant="ghost" size="icon" title="Fit canvas" aria-label="Fit canvas" onClick={() => flow.fitView({ padding: 0.16, duration: 200 })}><Maximize /></Button><Button variant="ghost" size="icon" title="Zoom in" aria-label="Zoom in" onClick={() => flow.zoomIn()}><Plus /></Button><span className="mx-1 h-4 border-l border-border" /><TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label="Canvas help"><CircleHelp /></Button></TooltipTrigger><TooltipContent side="top" align="start" sideOffset={10} className="max-w-72 space-y-2 border border-border bg-card p-3 text-foreground shadow-soft"><p className="text-sm font-medium">Canvas connections</p><p>Drag a rule's dot onto a project to attach it, or onto Global to apply it everywhere.</p><p>Click a wire to detach it.</p><p className="text-muted-foreground">Cream wires are global, blue wires are local.</p></TooltipContent></Tooltip></TooltipProvider></div>
      </section>
      <AlertDialog open={Boolean(pending)} onOpenChange={(open) => { if (!open) setPending(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{pending?.title}</AlertDialogTitle><AlertDialogDescription>{pending?.body}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>{pending?.lastWire && <AlertDialogAction className="border border-destructive bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20" onClick={() => { if (!pending) return; const change = pending; setPending(null); explode(change.ruleId, () => { update(change.ruleId, change.next); archive(change.ruleId); if (selected === change.ruleId) setSelected(null); if (focusRule === change.ruleId) setFocusRule("all"); }, true); }}>Archive rule</AlertDialogAction>}<AlertDialogAction className={pending?.destructive && !pending.lastWire ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined} onClick={() => { if (!pending) return; const change = pending; setPending(null); if (change.destructive) explode(change.ruleId, () => update(change.ruleId, change.next), false); else update(change.ruleId, change.next); }}>{pending?.action}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={Boolean(removing)} onOpenChange={(open) => { if (!open) setRemoving(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle><AlertDialogDescription>{removing && removing.rules.length > 0 ? `${removing.name} will be removed from the canvas, and the ${removing.rules.length} rule${removing.rules.length === 1 ? "" : "s"} attached to it will be removed from this project. Agents in ${removing.name} stop receiving them. Rules attached only to this project will become inactive.` : `${removing?.name} will be removed from the canvas. No rules are attached to it.`}</AlertDialogDescription></AlertDialogHeader>{removing && removing.rules.length > 0 && <ul className="rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">{removing.rules.map((name) => <li key={name} className="py-0.5">{name}</li>)}</ul>}<AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (!removing) return; const gone = removing; setRemoving(null); explode(gone.id, () => { removeProject(gone.id); if (filter === gone.id) setFilter("all"); setSelected(null); }, true); }}>Remove project</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <CreateDialog kind={creating} onClose={() => setCreating(null)} globalCount={rules.filter((r) => !archived.includes(r.id) && scopes[r.id]?.scopeType === "global" && scopeForRule(scopes[r.id]!).projects.length > 0).length} onCreate={(kind, a, b, c, inherit) => { const id = kind === "project" ? addProject(a, b, inherit) : draftRule(a, b, c); setFocusRule("all"); setFilter("all"); setSelected(id); }} />
      <aside className="flex min-w-0 flex-col border-l border-border bg-card" aria-label="Contextual inspector" hidden={!selected}>
        <div className="border-b border-border p-5"><p className="gs-overline mb-2">{rule ? "Rule" : project ? "Project" : "Agent"}</p><h2 className="gs-compact-title">{rule?.name ?? project?.name ?? (agent ? agentProjectName(agent.id) : undefined)}</h2>{rule ? <div className="mt-2 flex flex-wrap items-center gap-2"><Badge variant="neutral">{rule.category}</Badge>{isInactive(rule.id) ? <StatusBadge tone="neutral">Inactive · Drag to a project or Global to reactivate</StatusBadge> : <StatusBadge tone="positive">Active</StatusBadge>}<ShareRuleButton className="ml-auto" rule={{ id: rule.id, name: rule.name, markdown: rule.markdown ?? rule.title, global: scopes[rule.id]?.scopeType === "global", projectNames: scopes[rule.id] ? scopeForRule(scopes[rule.id]!).projects.map((pid) => projects.find((p) => p.id === pid)?.name ?? pid) : [] }} /></div> : <p className="mt-2 text-xs text-muted-foreground">{project?.description ?? `${projects.find((p) => p.id === agent?.projectId)?.name} · Claude`}</p>}{rule && currentScope && !isInactive(rule.id) && <Button variant="outline" size="sm" className="mt-4 border-destructive bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20 hover:text-destructive" onClick={() => { const change = removeRuleChange(rule.id, rule.name, currentScope); if (change) setPending(change); }}><X />Remove rule</Button>}{project && <Button variant="outline" size="sm" className="mt-4 border-destructive bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20 hover:text-destructive" onClick={() => setRemoving({ id: project.id, name: project.name, rules: rulebookFor(project.id, scopes, undefined, workspaceRules).map((e) => e.rule.name) })}><X />Remove project</Button>}{agent && <><p className="mt-3 text-sm text-muted-foreground">{agent.description}</p><AgentLabel id={agent.id} className="mt-2 block text-xs text-muted-foreground" /></>}</div>
        <div className="flex-1 space-y-6 p-5">
          {rule && currentScope && scope && <>
            <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => verificationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>Run verification</Button></div>
            <section><h3 className="mb-2 text-sm font-medium">Rule</h3><p className="text-sm leading-relaxed">{rule.title}</p><pre className="mt-3 whitespace-pre-wrap break-words rounded-md bg-background p-3 gs-code">{rule.markdown ?? rule.convention}</pre></section>
            <section><h3 className="mb-3 text-sm font-medium">Scope</h3><ScopeSummary draft={currentScope} scope={scope} /></section>
          </>}
          {(project || agent) && <section><h3 className="mb-3 flex items-center gap-2 text-sm font-medium"><Layers className="size-4 text-gold" />{project ? "Compiled rulebook" : "Active rules"}</h3>{rulebook.length === 0 && <p className="text-xs text-muted-foreground">No rules in this scope.</p>}{rulebook.map((entry) => <div key={entry.rule.id} className="border-b border-border py-3"><Button variant="ghost" className="h-auto w-full justify-between whitespace-normal px-0 text-left" onClick={() => setSelected(entry.rule.id)}>{entry.rule.name}<ChevronRight /></Button><div className="mt-2 flex flex-wrap gap-1"><StatusBadge tone="neutral">{entry.inherited ? "Inherited · Global" : "Local"}</StatusBadge><StatusBadge tone="positive">Active</StatusBadge></div></div>)}</section>}
          <div ref={verificationRef}><RunVerification selected={rule ? "rule" : selected} ruleId={verificationRuleId} scope={verificationScope} /></div>
        </div>
        {rule && scope && <div className="border-t border-border p-5"><p className="text-xs text-muted-foreground">Applied to {scope.projects.length === projects.length ? "all projects" : `${scope.projects.length} project${scope.projects.length === 1 ? "" : "s"}`}. Every agent in a project follows its rules.</p></div>}
      </aside>
    </div>
  </div></div>;
}
export function RuleCanvas() { return <ReactFlowProvider><CanvasWorkspace /></ReactFlowProvider>; }
