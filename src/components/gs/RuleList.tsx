import { useMemo, useState } from "react";
import { Globe, MapPin, Plus, Search, SquarePen, X } from "lucide-react";
import { useRuleScope } from "@/components/gs/RuleScopeProvider";
import { RulesSidebar } from "./RulesSidebar";
import { CreateDialog } from "./RuleCanvas";
import { Badge } from "@/components/ui/badge";
import { ShareRuleButton } from "./ShareRuleDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { projects } from "@/data/rule-scope";
import { scopeForRule, isUnassigned, matchesRuleQuery, type CanvasRule } from "@/data/canvas-rules";
import { connectChange, cutChange, removeRuleChange, type WiringChange } from "@/data/canvas-wiring";


export function RuleList() {
  const { workspaceRules, scopes, accepted, update, archive, draftRule, editRule, addProject, rulesFilter: tab, setRulesFilter, rulesQuery } = useRuleScope();
  const [workspaceCreate, setWorkspaceCreate] = useState<"project" | "rule" | null>(null);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, setPending] = useState<WiringChange | null>(null);
  const live = workspaceRules.filter((r) => scopes[r.id] && matchesRuleQuery(r, rulesQuery));
  const reach = (r: CanvasRule) => { const draft = scopes[r.id]; return draft ? scopeForRule(draft).projects : []; };
  const scopeTypeLabel = (r: CanvasRule) => {
    const ps = reach(r);
    if (ps.length === 0) return "Inactive";
    return scopes[r.id]?.scopeType === "global" ? "Global" : "Local";
  };
  const appliesLabel = (r: CanvasRule) => {
    const ps = reach(r);
    if (ps.length === 0) return "None";
    if (scopes[r.id]?.scopeType === "global" && ps.length === projects.length) return "All projects";
    if (scopes[r.id]?.scopeType === "global") return `${ps.length} of ${projects.length} projects`;
    return projects.find((p) => p.id === ps[0])?.name ?? ps[0];
  };
  const scopeLabel = (r: CanvasRule) => {
    const type = scopeTypeLabel(r);
    const applies = appliesLabel(r);
    return type === "Inactive" ? type : `${type} · ${applies}`;
  };
  const project = projects.find((p) => p.id === tab);
  const connected = project ? live.filter((r) => reach(r).includes(project.id)) : [];
  const groups: { title: string; hint: string; items: CanvasRule[] }[] = project
    ? [
        { title: "Global rules", hint: "Inherited from Global", items: connected.filter((r) => scopes[r.id]?.scopeType === "global") },
        { title: "Project rules", hint: `Local to ${project.name}`, items: connected.filter((r) => scopes[r.id]?.scopeType === "local") },
      ]
    : tab === "global"
      ? [{ title: "Global rules", hint: "Apply to every project unless excluded", items: live.filter((r) => scopes[r.id]?.scopeType === "global") }]
      : tab === "local"
      ? [{ title: "Local rules", hint: "Attached to a single project", items: live.filter((r) => scopes[r.id]?.scopeType === "local") }]
      : tab === "unassigned"
      ? [{ title: "Unassigned rules", hint: "Not attached to any project", items: live.filter((r) => isUnassigned(scopes[r.id])) }]
      : [{ title: "All rules", hint: `${live.length} rule${live.length === 1 ? "" : "s"}`, items: live }];
  const open = live.find((r) => r.id === openId) ?? null;

  function remove(r: CanvasRule) {
    const draft = scopes[r.id];
    if (!draft) return;
    setPending(project ? cutChange(r.id, r.name, draft, project.id) : removeRuleChange(r.id, r.name, draft) ?? {
      ruleId: r.id,
      next: draft,
      title: `Archive ${r.name}?`,
      body: "This rule is not attached to any project. Archive it to remove it from Constellations.",
      action: "Archive rule",
      destructive: true,
      lastWire: true,
    });
  }
  const pendingAlreadyIdle = pending ? reach({ id: pending.ruleId } as CanvasRule).length === 0 : false;


  return <div className="flex h-dvh"><RulesSidebar view="list" onFilterChange={() => { setOpenId(null); setAdding(false); }} onToggleExamples={() => { setOpenId(null); setAdding(false); }} onDraftRule={() => setWorkspaceCreate("rule")} onAddProject={() => setWorkspaceCreate("project")} />
  <div className="min-w-0 flex-1 overflow-y-auto">
    <div className="mx-auto w-full max-w-6xl px-8 pb-10 pt-10">
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <h1 className="gs-section-title">{project?.name ?? groups[0]?.title}</h1>
          <p className="gs-secondary mt-3">{project ? `${project.description} · ${connected.length} connected rule${connected.length === 1 ? "" : "s"}` : groups[0]?.hint}</p>
        </div>
        {project && <div className="ml-auto flex gap-2"><Button variant="outline" size="sm" onClick={() => setCreating(true)}><SquarePen className="size-3.5" />New local rule</Button><Button size="sm" onClick={() => setAdding(true)}><Plus />Add rules</Button></div>}
      </header>
      {groups.map((g, i) => <section key={g.title} className={i === 0 ? "mt-6" : "mt-8"}>
        {project && <div className="mb-2 flex items-baseline gap-2"><h2 className="gs-overline">{g.title}</h2><span className="gs-caption">{g.hint}</span></div>}
        {g.items.length === 0 ? <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">No rules here yet.</p> :
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="gs-overline h-9 w-[32%] px-4">Rule</TableHead>
                <TableHead className="gs-overline h-9 w-[22%] border-l border-border px-4">Category</TableHead>
                <TableHead className="gs-overline h-9 w-[16%] border-l border-border px-4">Scope</TableHead>
                <TableHead className="gs-overline h-9 w-[26%] border-l border-border px-4">Applies to</TableHead>
                <TableHead className="w-10 border-l border-border px-2"><span className="sr-only">Remove</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {g.items.map((r) => (
                <TableRow key={r.id} className="group cursor-pointer" onClick={() => setOpenId(r.id)}>
                  <TableCell className="px-4 py-3">
                    <button type="button" className="flex w-full min-w-0 items-center gap-2.5 text-left" onClick={() => setOpenId(r.id)}>
                      {scopes[r.id]?.scopeType === "global" ? <Globe className="size-3.5 shrink-0 text-gold" /> : <MapPin className="size-3.5 shrink-0 text-muted-foreground" />}
                      <span className="gs-compact-label truncate">{r.name}</span>
                    </button>
                  </TableCell>
                  <TableCell className="border-l border-border px-3 py-3"><Badge variant="neutral" className="max-w-full truncate">{r.category}</Badge></TableCell>
                  <TableCell className="border-l border-border px-4 py-3 text-xs text-muted-foreground">{scopeTypeLabel(r)}</TableCell>
                  <TableCell className="border-l border-border px-4 py-3 text-xs text-muted-foreground"><span className="line-clamp-2">{appliesLabel(r)}</span></TableCell>
                  <TableCell className="border-l border-border px-2 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100" aria-label={project ? `Disconnect ${r.name} from ${project.name}` : `Remove ${r.name}`} onClick={() => remove(r)}><X className="size-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>}
      </section>)}
    </div>

    {project && <AddRulesDialog open={adding} onClose={() => setAdding(false)} projectId={project.id} projectName={project.name} candidates={live.filter((r) => Object.hasOwn(accepted, r.id) && !reach(r).includes(project.id))} scopeLabel={scopeLabel} onConnect={(ids) => { ids.forEach((id) => { const r = live.find((x) => x.id === id); const draft = scopes[id]; if (!r || !draft) return; const c = connectChange(id, r.name, draft, project.id); if (c) update(id, c.next); }); setAdding(false); }} />}
    {project && <NewRuleDialog open={creating} projectName={project.name} onClose={() => setCreating(false)} onCreate={(name, text, category) => { const id = draftRule(name, text, category); update(id, { scopeType: "local", targetProjectId: project.id, excludedProjects: [], excludedAgents: [] }); setCreating(false); }} />}
    <RuleSheet rule={open} scopeLabel={open ? scopeLabel(open) : ""} projectNames={open ? reach(open).map((id) => projects.find((p) => p.id === id)?.name ?? id) : []} onClose={() => setOpenId(null)} onSave={(patch) => open && editRule(open.id, patch)} />
    <AlertDialog open={Boolean(pending)} onOpenChange={(o) => { if (!o) setPending(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{pending?.title}</AlertDialogTitle><AlertDialogDescription>{pending?.body.replace(/Keep it in Canvas/g, "Keep it")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
      {pending?.lastWire && <AlertDialogAction className="border border-destructive bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20" onClick={() => { if (pending) { update(pending.ruleId, pending.next); archive(pending.ruleId); } setPending(null); }}>Archive rule</AlertDialogAction>}
      {pending && !pendingAlreadyIdle && <AlertDialogAction className={pending.lastWire ? undefined : pending.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined} onClick={() => { update(pending.ruleId, pending.next); setPending(null); }}>{pending.lastWire ? "Keep as inactive" : "Disconnect"}</AlertDialogAction>}
    </AlertDialogFooter></AlertDialogContent></AlertDialog>
    <CreateDialog kind={workspaceCreate} onClose={() => setWorkspaceCreate(null)} globalCount={live.filter((r) => scopes[r.id]?.scopeType === "global" && reach(r).length > 0).length} onCreate={(kind, a, b, c, inherit) => { if (kind === "project") setRulesFilter(addProject(a, b, inherit)); else { const id = draftRule(a, b, c); setRulesFilter("all"); setOpenId(id); } }} />
  </div></div>;
}

function AddRulesDialog({ open, onClose, projectName, candidates, scopeLabel, onConnect, projectId }: { open: boolean; onClose: () => void; projectId: string; projectName: string; candidates: CanvasRule[]; scopeLabel: (r: CanvasRule) => string; onConnect: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const shown = useMemo(() => candidates.filter((r) => `${r.name} ${r.category} ${r.title}`.toLowerCase().includes(query.toLowerCase())), [candidates, query]);
  const close = () => { setQuery(""); setPicked([]); onClose(); };
  return <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}><DialogContent className="max-w-lg">
    <DialogHeader><DialogTitle>Add rules to {projectName}</DialogTitle><DialogDescription>Connect accepted rules. Local rules from another project move to {projectName}.</DialogDescription></DialogHeader>
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rules" className="pl-9" aria-label="Search rules" /></div>
    <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
      {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">{candidates.length === 0 ? `Every accepted rule is already connected to ${projectName}.` : "No matching rules."}</li>}
      {shown.map((r) => { const id = `add-${projectId}-${r.id}`; const on = picked.includes(r.id); return <li key={r.id}><label htmlFor={id} className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-muted/40">
        <Checkbox id={id} checked={on} onCheckedChange={(v) => setPicked((c) => v ? [...c, r.id] : c.filter((x) => x !== r.id))} />
        <span className="min-w-0 flex-1"><span className="gs-compact-label block truncate">{r.name}</span><span className="gs-caption">{r.category} · {scopeLabel(r)}</span></span>
      </label></li>; })}
    </ul>
    <DialogFooter><Button variant="outline" onClick={close}>Cancel</Button><Button disabled={picked.length === 0} onClick={() => { onConnect(picked); setPicked([]); setQuery(""); }}>{picked.length > 1 ? `Connect ${picked.length} rules` : "Connect rule"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function NewRuleDialog({ open, projectName, onClose, onCreate }: { open: boolean; projectName: string; onClose: () => void; onCreate: (name: string, text: string, category: string) => void }) {
  const [name, setName] = useState(""); const [text, setText] = useState(""); const [category, setCategory] = useState("");
  const close = () => { setName(""); setText(""); setCategory(""); onClose(); };
  return <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}><DialogContent className="max-w-lg">
    <DialogHeader><DialogTitle>New local rule</DialogTitle><DialogDescription>Applies only to {projectName}.</DialogDescription></DialogHeader>
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (name.trim() && text.trim()) { onCreate(name, text, category); setName(""); setText(""); setCategory(""); } }}>
      <div className="space-y-1.5"><Label htmlFor="nr-name">Rule name</Label><Input id="nr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Form error copy" /></div>
      <div className="space-y-1.5"><Label htmlFor="nr-text">Rule</Label><Textarea id="nr-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="What should agents in this project do?" rows={3} /></div>
      <div className="space-y-1.5"><Label htmlFor="nr-cat">Category</Label><Input id="nr-cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Custom" /></div>
      <DialogFooter><Button type="button" variant="outline" onClick={close}>Cancel</Button><Button type="submit" disabled={!name.trim() || !text.trim()}>Create rule</Button></DialogFooter>
    </form>
  </DialogContent></Dialog>;
}

function RuleSheet({ rule, scopeLabel, projectNames, onClose, onSave }: { rule: CanvasRule | null; scopeLabel: string; projectNames: string[]; onClose: () => void; onSave: (patch: Partial<Pick<CanvasRule, "name" | "title" | "category">>) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: "", title: "", category: "" });
  const start = () => { if (rule) { setDraft({ name: rule.name, title: rule.title, category: rule.category }); setEditing(true); } };
  return <Sheet open={Boolean(rule)} onOpenChange={(o) => { if (!o) { setEditing(false); onClose(); } }}><SheetContent className="w-full overflow-y-auto sm:max-w-md">
    {rule && <>
      <SheetHeader><p className="gs-overline">Rule</p><SheetTitle className="gs-compact-title">{rule.name}</SheetTitle><SheetDescription>{rule.category} · {scopeLabel}</SheetDescription></SheetHeader>
      {editing ? <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (draft.name.trim() && draft.title.trim()) { onSave({ name: draft.name.trim(), title: draft.title.trim(), category: draft.category.trim() || "Custom" }); setEditing(false); } }}>
        <div className="space-y-1.5"><Label htmlFor="rs-name">Rule name</Label><Input id="rs-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="rs-title">Rule</Label><Textarea id="rs-title" rows={4} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
        <div className="space-y-1.5"><Label htmlFor="rs-cat">Category</Label><Input id="rs-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" size="sm">Save</Button></div>
      </form> : <div className="mt-6 space-y-6">
        <div><p className="gs-overline mb-2">Rule</p><p className="gs-secondary text-foreground">{rule.title}</p></div>
        <div><p className="gs-overline mb-2">Example</p><pre className="gs-code overflow-x-auto rounded-md bg-background p-3">{rule.convention}</pre></div>
        <div><p className="gs-overline mb-2">Connected projects</p>{projectNames.length ? <div className="flex flex-wrap gap-1.5">{projectNames.map((n) => <Badge key={n} variant="neutral">{n}</Badge>)}</div> : <p className="gs-caption">None — this rule is inactive.</p>}</div>
        <div className="flex gap-2"><Button variant="outline" size="sm" onClick={start}><SquarePen className="size-3.5" />Edit rule</Button><ShareRuleButton rule={{ id: rule.id, name: rule.name, markdown: rule.markdown ?? rule.title, global: scopeLabel.startsWith("Global"), projectNames }} /></div>
      </div>}
    </>}
  </SheetContent></Sheet>;
}
