import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { agents, projects } from "@/data/rule-scope";
import type { Suggestion } from "@/data/suggestions";
import { useRuleScope } from "./RuleScopeProvider";
import { acceptanceConflicts, appliedSelection, canApplySelection } from "@/data/acceptance-conflicts";

/** Rules apply to projects; every agent working in a selected project follows them. */
export function AcceptRulePopover({ s, onAccept }: { s: Suggestion; onAccept: (picked: { projects: string[]; agents: string[] }) => void }) {
  const { rules } = useRuleScope();
  const conflicts = acceptanceConflicts(s.id, rules);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>(s.scope);
  const [global, setGlobal] = useState(false);
  const blocked = conflicts.map((c) => c.project.id);
  const picked = (global ? projects.map((p) => p.id) : chosen).filter((id) => !blocked.includes(id));
  const selection = { projects: picked, agents: agents.filter((a) => picked.includes(a.projectId)).map((a) => a.id) };
  const toggleProject = (id: string, on: boolean) => {
    setReviewed((current) => current.filter((item) => item !== id));
    setChosen((p) => on ? [...new Set([...p, id])] : p.filter((x) => x !== id));
  };
  const label = global ? "Apply globally" : picked.length === 1 ? `Apply to ${projects.find((p) => p.id === picked[0])?.name}` : `Apply to ${picked.length} projects`;
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) { setChosen(s.scope); setGlobal(false); setReviewed([]); } }}>
      <PopoverTrigger asChild><Button className="gap-2"><Check className="size-4" /> Accept rule</Button></PopoverTrigger>
      <PopoverContent align="start" className="flex w-96 max-w-[calc(100vw-2rem)] max-h-[min(70dvh,var(--radix-popover-content-available-height))] flex-col overflow-hidden p-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <p className="gs-card-title">Apply this rule to</p>
          <p className="gs-caption mt-1">All agents in a selected project follow its rules.</p>
          <label className="mt-4 flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm font-medium">
            <Checkbox checked={global} onCheckedChange={(v) => { setGlobal(v === true); setReviewed([]); }} aria-label="Global rule" />
            Global rule<span className="text-xs font-normal text-muted-foreground">All projects</span>
          </label>
          {global && <p className="gs-caption mt-2">Global applies this rule to every project, so individual projects can't be selected.{blocked.length > 0 && " Projects with a conflicting convention stay excluded."}</p>}
          <p className="gs-overline mt-4">{global ? "Included by global" : "Or choose projects"}</p>
          <div className="mt-2 space-y-4">
            {projects.map((p) => {
              const conflict = conflicts.find((item) => item.project.id === p.id);
              const on = picked.includes(p.id);
              return (
                <div key={p.id} aria-label={conflict ? `${p.name} conflict` : undefined}>
                  <label className={`flex items-center gap-2 text-sm font-medium ${global || conflict ? "opacity-50" : s.scope.includes(p.id) ? "" : "text-muted-foreground"}`}>
                    <Checkbox disabled={global || !!conflict} checked={on} onCheckedChange={(v) => toggleProject(p.id, v === true)} />
                    {p.name}<span className="text-xs font-normal text-muted-foreground">{p.description}</span>
                    {s.scope.includes(p.id) ? <span className="ml-auto text-xs text-gold-deep">Suggested</span> : <span className="ml-auto text-xs text-muted-foreground">Not suggested</span>}
                  </label>
                  {conflict && <p className="mt-2 pl-6 text-xs text-muted-foreground">Conflicting convention · Uses {conflict.existing.name}</p>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-popover px-5 py-3">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button size="sm" disabled={!canApplySelection(selection, conflicts.map((c) => c.project.id), reviewed)} onClick={() => { setOpen(false); onAccept(appliedSelection(selection)); }}>{label}</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
