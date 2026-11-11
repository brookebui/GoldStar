import { useState } from "react";
import { Check, GitMerge, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { proposals, productCount, type Proposal, type Triage } from "@/data/proposals";
import { AgentLabel } from "./AgentLabel";
import { StatusBadge } from "./StatusBadge";
import { Star } from "./Star";

type Decision = Triage;
const decisionLabel: Record<Decision, string> = { propose: "Proposed as new", extend: "Extending existing", cut: "Cut" };
const triageVerb: Record<Triage, string> = { propose: "Propose new", extend: "Extend existing", cut: "Cut" };

function Detail({ p, decision, onDecide }: { p: Proposal; decision: Decision | undefined; onDecide: (d: Decision | undefined) => void }) {
  return (
    <div key={p.id} className="animate-rise">
      <h2 className="gs-detail-title">{p.title}</h2>
      <p className="gs-secondary mt-4">{p.summary}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><dt className="gs-overline mb-1">The friction</dt><dd className="gs-body">{p.friction}</dd></div>
        <div><dt className="gs-overline mb-1">Why existing parts fall short</dt><dd className="gs-body">{p.constraint}</dd></div>
      </dl>
      <p className="mt-6 text-sm"><span className="font-medium text-gold-deep">Suggested: {triageVerb[p.suggested]}.</span> <span className="text-muted-foreground">{p.suggestedWhy}</span></p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {decision ? (
          <>
            <StatusBadge tone={decision === "cut" ? "neutral" : "positive"}><Check strokeWidth={2.4} />{decisionLabel[decision]}</StatusBadge>
            <Button size="sm" variant="ghost" onClick={() => onDecide(undefined)}>Undo</Button>
          </>
        ) : (
          <>
            <Button variant={p.suggested === "propose" ? "default" : "outline"} onClick={() => onDecide("propose")}><Star className="size-3.5" />Propose new</Button>
            <Button variant={p.suggested === "extend" ? "default" : "outline"} onClick={() => onDecide("extend")}><GitMerge />Extend {p.closest.name}</Button>
            <Button variant={p.suggested === "cut" ? "default" : "ghost"} onClick={() => onDecide("cut")}><Scissors />Cut</Button>
          </>
        )}
      </div>

      <section className="gs-section">
        <h3 className="gs-section-title mb-3">New pattern vs. closest existing</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="overflow-hidden rounded-lg border border-gold/30">
            <p className="gs-overline bg-gold-soft px-3 py-2 text-gold-deep">Emerging</p>
            <pre className="gs-code overflow-x-auto bg-card p-3">{p.pattern}</pre>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <p className="gs-overline bg-muted px-3 py-2 text-muted-foreground">Existing · {p.closest.name}</p>
            <pre className="gs-code overflow-x-auto bg-card p-3">{p.closest.code}</pre>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 text-sm">
          {p.differs.map((d) => <li key={d} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-gold" />{d}</li>)}
        </ul>
      </section>

      <section className="gs-section">
        <h3 className="gs-section-title mb-3">Where it appeared</h3>
        <ol className="space-y-3">
          {p.sightings.map((s, i) => (
            <li key={i} className="gs-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><AgentLabel id={s.agentId} className="text-sm font-medium" /><span className="text-xs text-muted-foreground">{s.project} · {s.file} · {s.when}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{s.note}</p>
              <pre className="gs-code mt-3 overflow-x-auto">{s.code}</pre>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export function Proposals() {
  const [activeId, setActiveId] = useState(proposals[0]!.id);
  const [decisions, setDecisions] = useState<Record<string, Decision | undefined>>({});
  const active = proposals.find((p) => p.id === activeId) ?? proposals[0]!;
  return (
    <div className="inbox-workspace grid h-dvh min-h-0 overflow-hidden">
      <section aria-label="Proposals" className="paper-grid flex min-h-0 min-w-0 flex-col border-r border-border">
        <header className="shrink-0 bg-background px-8 pb-6 pt-10">
          <h1 className="gs-page-title">Proposals</h1>
          <p className="gs-secondary mt-3">New patterns your agents keep inventing — candidates for the design system.</p>
        </header>
        <ul role="region" aria-label="Emerging patterns" tabIndex={0} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-8 pb-10">
          {proposals.map((p) => {
            const sel = p.id === activeId, d = decisions[p.id];
            return (
              <li key={p.id}>
                <Button variant="selection" size="content" onClick={() => setActiveId(p.id)} aria-pressed={sel} className="font-normal">
                  <div className="gs-overline mb-3 flex flex-wrap items-center gap-2">
                    <span>{p.closest.name}</span>
                    <span className={d ? "ml-auto" : "ml-auto text-gold-deep"}>{d ? decisionLabel[d] : triageVerb[p.suggested]}</span>
                  </div>
                  <h3 className="gs-card-title">{p.title}</h3>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span><b className="font-medium text-foreground">{p.sightings.length}</b> sightings</span>
                    <span className="size-0.5 rounded-full bg-muted-foreground" />
                    <span>{productCount(p)} {productCount(p) === 1 ? "product" : "products"}</span>
                  </div>
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-label="Proposal details" tabIndex={0} className={cn("min-h-0 min-w-0 overflow-y-auto overscroll-contain px-6 py-12 lg:px-14")}>
        <div className="max-w-3xl"><Detail p={active} decision={decisions[active.id]} onDecide={(d) => setDecisions((m) => ({ ...m, [active.id]: d }))} /></div>
      </section>
    </div>
  );
}
