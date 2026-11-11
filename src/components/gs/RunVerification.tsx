import { useState } from "react";
import { Check, ChevronDown, Minus, X, Play, Star as StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentProjectName, agents, projects, type ScopeDraft } from "@/data/rule-scope";
import { deliveryFor, executions, followedFor, type Execution } from "@/data/receipts";
import { StatusBadge } from "./StatusBadge";
import { Star } from "./Star";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRuleScope } from "./RuleScopeProvider";
import { starForAgents } from "@/data/star-tracking";

/** Verification is reported per project: the latest delivered run from any of its agents decides that project's star. */
function SessionVerification({ selected, scope, ruleId }: { selected: string | null; scope: ScopeDraft; ruleId: string }) {
  const { verificationRuns, addExampleRun } = useRuleScope();
  const [outcome, setOutcome] = useState("followed");
  const [openRun, setOpenRun] = useState<string | null>(null);
  const relevant = agents.filter((a) => selected === "rule" || selected === a.id || selected === a.projectId);
  const groups = projects
    .map((project) => ({ project, agentIds: relevant.filter((a) => a.projectId === project.id).map((a) => a.id) }))
    .filter((group) => group.agentIds.length > 0);
  const runs = verificationRuns.filter((run) => run.ruleId === ruleId && relevant.some((a) => a.id === run.agentId));
  const tracked = groups.filter((group) => group.agentIds.some((id) => scope.agents.includes(id)) || runs.some((run) => group.agentIds.includes(run.agentId)));
  const [projectId, setProjectId] = useState("");
  const target = groups.find((group) => group.project.id === projectId) ?? groups[0];
  const runAgent = target ? target.agentIds.find((id) => scope.agents.includes(id)) ?? target.agentIds[0] : undefined;
  return <section className="border-t border-border pt-4" aria-label="Rule star tracking">
    <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-medium">Was it followed?</h3><StatusBadge tone="neutral">Example runs</StatusBadge></div>
    <div className="mt-3" aria-live="polite">
      {tracked.map(({ project, agentIds }) => {
        const star = starForAgents(verificationRuns, ruleId, agentIds);
        return <div key={project.id} className="flex items-center gap-3 border-b border-border py-3">
          <StarIcon key={`${project.id}-${star.latest?.id}`} className={cn("size-7 shrink-0", star.state === "bright" ? "gs-earned-star fill-gold text-gold" : star.state === "dim" ? "fill-muted text-muted-foreground opacity-50" : "text-muted-foreground")} />
          <div className="min-w-0"><p className="text-sm font-medium">{project.name}</p><p className={cn("mt-0.5 text-xs", star.state === "dim" ? "text-destructive" : star.state === "bright" ? "text-gold" : "text-muted-foreground")}>{star.state === "bright" ? "Gold star earned · Latest run followed" : star.state === "dim" ? "Star dimmed · Latest run deviated" : "Awaiting first verified run"}</p>{star.earned > 0 && <p className="mt-1 text-xs text-muted-foreground">{star.earned} earned star{star.earned === 1 ? "" : "s"} in history</p>}{!agentIds.some((id) => scope.agents.includes(id)) && <p className="mt-1 text-xs text-muted-foreground">Currently excluded</p>}</div>
        </div>;
      })}
      {runs.length === 0 && <p className="mt-3 text-xs text-muted-foreground">No runs yet. No star earned.</p>}
    </div>
    <fieldset className="mt-4 space-y-2">
      <legend className="mb-2 text-xs font-medium text-muted-foreground">Simulate an example run</legend>
      <Select value={target?.project.id ?? ""} onValueChange={setProjectId}><SelectTrigger aria-label="Example run project" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{groups.map(({ project }) => <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>)}</SelectContent></Select>
      <Select value={outcome} onValueChange={setOutcome}><SelectTrigger aria-label="Example run outcome" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="followed">Followed the rule</SelectItem><SelectItem value="deviated">Deviated from the rule</SelectItem></SelectContent></Select>
      {target && !target.agentIds.some((id) => scope.agents.includes(id)) && <p className="text-xs text-muted-foreground">Not delivered · Excluded from current scope</p>}
      <Button variant="outline" size="sm" className="w-full" disabled={!runAgent} onClick={() => { if (runAgent) addExampleRun(ruleId, runAgent, outcome === "followed"); }}><Play />Simulate run</Button>
    </fieldset>
    <ul className="mt-4 space-y-1">{[...runs].reverse().map((run) => {
      const name = agentProjectName(run.agentId);
      const state = !run.delivered ? "Not delivered · Not evaluated" : run.passed ? "Followed · Star earned" : "Deviated · Star dimmed";
      return <li key={run.id}>
        <Button variant="ghost" className="h-auto w-full justify-start whitespace-normal px-0 py-2 text-left" aria-expanded={openRun === run.id} onClick={() => setOpenRun(openRun === run.id ? null : run.id)}>
          {run.delivered && run.passed ? <Star className="shrink-0" /> : run.delivered ? <X className="shrink-0 text-destructive" /> : <Minus className="shrink-0 text-muted-foreground" />}
          <span className="min-w-0 flex-1"><span className="block text-sm">{name} · Example {run.sequence}</span><span className="block text-xs text-muted-foreground">{state}</span></span><ChevronDown className={cn("shrink-0 transition-transform", openRun === run.id && "rotate-180")} />
        </Button>
        {openRun === run.id && <div className="space-y-2 pb-3 pl-6"><p className="text-xs text-muted-foreground">{!run.delivered ? "The rule was not in this project's scope. Its star is unchanged." : run.passed ? "Example check passed. This earned star stays in history." : "Example check failed. Earlier earned stars stay in history."}</p><pre className="whitespace-pre-wrap break-words rounded-md bg-background p-3 gs-code">{run.markdown}</pre></div>}
      </li>;
    })}</ul>
  </section>;
}

/** Recent runs for the selected canvas node, showing whether the rule was delivered and followed. */
export function RunVerification({ selected, scope, ruleId = "button-component" }: { selected: string | null; scope: ScopeDraft; ruleId?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const { accepted } = useRuleScope();
  if (Object.hasOwn(accepted, ruleId)) return <SessionVerification selected={selected} scope={scope} ruleId={ruleId} />;
  const runs = executions.filter((run: Execution) => ruleId === "button-component" && (selected === "rule" || run.agentId === selected || agents.find((a) => a.id === run.agentId)?.projectId === selected));
  const followed = runs.filter((r) => followedFor(r, scope) === "followed").length;
  const delivered = runs.filter((r) => deliveryFor(r, scope) === "delivered").length;
  return <div className="border-t border-border pt-4">
    <h3 className="text-sm font-medium">Was it followed?</h3>
    <p className="mt-1 text-xs text-muted-foreground">{ruleId === "button-component" ? "Button convention · Example runs · Delivery simulated from current scope" : "No verification recorded for this rule"}</p>
    <p className="mt-1 text-xs text-muted-foreground">{runs.length === 0 ? "No runs yet." : `Followed in ${followed} of ${delivered} run${delivered === 1 ? "" : "s"} that received the rule.`}</p>
    {followed > 0 && <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="size-3" /> Gold star earned in {followed} run{followed === 1 ? "" : "s"} — the rule was followed.</p>}
    <ul className="mt-3 space-y-1">{runs.map((run) => {
      const state = followedFor(run, scope);
      const name = agentProjectName(run.agentId);
      const isOpen = open === run.id;
      return <li key={run.id}>
        <Button variant="ghost" type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : run.id)} className="h-auto w-full items-start justify-start whitespace-normal rounded-md px-0 py-2 text-left">
          <span className={cn("mt-0.5", state === "followed" ? "text-success" : state === "not-followed" ? "text-destructive" : "text-muted-foreground")}>{state === "followed" ? <Check className="size-3.5" /> : state === "not-followed" ? <X className="size-3.5" /> : <Minus className="size-3.5" />}</span>
          <span className="min-w-0 flex-1"><span className="block text-sm">{run.task}</span><span className="block text-xs text-muted-foreground">{name} · {run.when}</span><span className="mt-1 block text-xs text-muted-foreground">{deliveryFor(run, scope) === "delivered" ? "Delivered · " + (state === "followed" ? "Followed" : "Not followed") : "Excluded · Not delivered · Not evaluated"}</span></span>
          <ChevronDown className={cn("mt-1 size-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </Button>
        {isOpen && <div className="mb-2 space-y-2 pl-6">
          <StatusBadge tone={state === "followed" ? "positive" : state === "not-followed" ? "negative" : "neutral"}>{state === "followed" ? "Followed" : state === "not-followed" ? "Not followed" : "Not delivered"}</StatusBadge>
          {state === "followed" && <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="size-3" /> Gold star earned — {name} followed the rule in this run.</p>}
          <p className="text-xs leading-relaxed text-muted-foreground">{run.check.detail}</p>
          <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 gs-code leading-relaxed">{run.output}</pre>
        </div>}
      </li>;
    })}</ul>
  </div>;
}
