import { useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { X, FileCode2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Suggestion, type SuggestionStatus, type Trace } from "@/data/suggestions";
import { PatternStrengthPill } from "./PatternStrengthPill";
import { Star, StarAvatar } from "./Star";
import { AgentLabel } from "./AgentLabel";
import { StatusBadge } from "./StatusBadge";
import { AcceptRulePopover } from "./AcceptRulePopover";
import { agents, agentProjectName, projects } from "@/data/rule-scope";
import { useRuleScope } from "./RuleScopeProvider";
import { acceptanceConflicts } from "@/data/acceptance-conflicts";
import { ProposedRuleEditor } from "./ProposedRuleEditor";
import { ShareRuleButton } from "./ShareRuleDialog";

export const drafts = new Map<string, string>();

// Chips sit on one row with the show-all button, so trace ages read compactly here.
function compactWhen(when: string) {
  return when
    .replace(/(\d+)\s*hours?\s*ago/, "$1h")
    .replace(/(\d+)\s*days?\s*ago/, "$1d")
    .replace(/(\d+)\s*weeks?\s*ago/, "$1wk")
    .replace("Yesterday", "1d")
    .replace("Last week", "1wk")
    .replace("Today", "today");
}

// The compliance note stays hidden behind a link until the reader asks for it.
// Radix unmounts the confirmation when it closes, so this resets on every reopen.
function AcceptanceDisclaimer() {
  const [revealed, setRevealed] = useState(false);
  if (revealed) return <span>Rule acceptance does not confirm agent compliance.</span>;
  return (
    <button type="button" onClick={() => setRevealed(true)}
      className="underline underline-offset-2 transition-colors hover:text-foreground">
      View disclaimer
    </button>
  );
}

function TraceView({ t }: { t: Trace }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {t.lines.map((l, i) => (
        <li key={i} className="relative animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <span className={cn("absolute -left-[25px] top-1.5 size-2.5 rounded-full border-2 border-background",
            l.flag === "correction" ? "bg-gold" : l.flag === "violation" ? "bg-destructive" : l.role === "user" ? "bg-foreground" : "bg-muted-foreground/40")} />
          <div className="gs-overline mb-1 flex flex-wrap items-center gap-2">
            {l.role === "user" ? "You" : agentProjectName(t.agentId)}
            {l.flag === "correction" && <StatusBadge tone="pending">Correction</StatusBadge>}
            {l.flag === "violation" && <StatusBadge tone="negative">Drift</StatusBadge>}
          </div>
          <p className={cn("gs-body", l.flag === "correction" && "font-display text-lg italic leading-snug")}>{l.text}</p>
          {l.code && <pre className="gs-code mt-2 overflow-x-auto rounded-md bg-muted px-3 py-2 text-foreground">{l.code}</pre>}
        </li>
      ))}
    </ol>
  );
}

export function EvidencePanel({ s, status, onStatus, initialEditing = false }: { initialEditing?: boolean; s: Suggestion; status: SuggestionStatus; onStatus: (status: SuggestionStatus) => void }) {
  const [active, setActive] = useState(0);
  const [showAllTraces, setShowAllTraces] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationContainer, setConfirmationContainer] = useState<HTMLElement | null>(null);
  const viewConfirmationRef = useRef<HTMLButtonElement>(null);
  const previewCount = Math.min(3, s.evidence.length);
  const visibleTraces = showAllTraces ? s.evidence : s.evidence.slice(0, previewCount);
  const { accept, accepted, rules } = useRuleScope();
  const appliedTo = accepted[s.id];
  const trace = s.evidence[Math.min(active, s.evidence.length - 1)];
  if (!trace) return null;

  const appliedProjects = appliedTo ? projects.filter((p) => appliedTo.projects.includes(p.id)) : [];

  return (
    <div key={s.id} ref={(node) => { const section = node?.closest<HTMLElement>('section[aria-label="Rule details"]') ?? null; setConfirmationContainer((current) => current === section ? current : section); }} className="animate-rise flex min-h-full w-full flex-col">
      <div className="max-w-3xl flex-1">
      <h2 className="gs-detail-title">{s.summary ?? s.title}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{s.ruleCategory}</Badge>
        <PatternStrengthPill s={s} />
      </div>

      {status === "accepted" && (
        <div role="status" className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-border bg-muted/40 px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground"><Star className="size-3.5 shrink-0" /> Rule saved</span>
          {appliedTo && <span className="text-xs text-muted-foreground">{appliedProjects.length === projects.length ? "All projects" : appliedProjects.map((p) => p.name).join(", ")}</span>}
          <ShareRuleButton className="ml-auto" rule={{ id: s.id, name: s.summary ?? s.title, markdown: drafts.get(s.id) ?? s.proposedMarkdown, global: appliedProjects.length === projects.length, projectNames: appliedProjects.map((p) => p.name) }} /><Button variant="link" size="sm" className="text-success hover:text-success" ref={viewConfirmationRef} onClick={() => setConfirmationOpen(true)}>View confirmation</Button>
        </div>
      )}

      <div className="mt-6"><ProposedRuleEditor initialEditing={initialEditing} key={s.id} markdown={drafts.get(s.id) ?? s.proposedMarkdown} onSave={(value) => drafts.set(s.id, value)} />
      </div>

      {status === "accepted" && (<>
        <DialogPrimitive.Root open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        {confirmationContainer && <DialogPrimitive.Portal container={confirmationContainer}>
        <DialogPrimitive.Overlay className="gs-acceptance-backdrop absolute inset-0 z-20" />
        <DialogPrimitive.Content className="gs-acceptance-confirmation absolute left-1/2 top-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-popover p-5 shadow-soft focus:outline-none" onCloseAutoFocus={(event) => { event.preventDefault(); (viewConfirmationRef.current ?? confirmationContainer.querySelector<HTMLElement>('button'))?.focus(); }}>
          <DialogPrimitive.Close asChild><Button variant="ghost" size="icon" aria-label="Close confirmation" className="absolute right-2 top-2"><X className="size-4" /></Button></DialogPrimitive.Close>
          <div className="flex flex-col items-center gap-2">
            <StarAvatar className="gs-dancing-star size-12" />
            <DialogPrimitive.Title className="gs-section-title text-center">Rule saved to scope</DialogPrimitive.Title>
          </div>
          {appliedTo && (
            <div className="mt-7 space-y-1.5">
              <p className="text-sm text-foreground">
                Applied to <span className="font-medium">{appliedProjects.length === projects.length ? "all projects" : `${appliedProjects.length} project${appliedProjects.length === 1 ? "" : "s"}`}</span>:
              </p>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
                <ul className="space-y-1">
                  {appliedProjects.map((p) => (
                    <li key={p.id} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{p.name}</span>{" — "}{p.description}
                    </li>
                  ))}
                </ul>
              </div>
               {acceptanceConflicts(s.id, rules).filter((c) => !appliedTo.projects.includes(c.project.id)).map(({ project }) => <p key={project.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{project.name} excluded</span> — its Commerce Action Button convention is preserved.</p>)}
            </div>
          )}
          <div className="mt-7 flex justify-center"><Button asChild><Link to="/canvas" search={{ rule: s.id }}>Review rule</Link></Button></div>
          <DialogPrimitive.Description className="gs-caption pt-1.5 text-center"><AcceptanceDisclaimer /></DialogPrimitive.Description>
        </DialogPrimitive.Content>
        </DialogPrimitive.Portal>}
        </DialogPrimitive.Root>
      </>
      )}

      <section className="gs-section">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <h3 className="gs-section-title">Trace evidence</h3>
        </div>
        <div id={`traces-${s.id}`} className="mb-5 flex flex-wrap items-center gap-2">
          {visibleTraces.map((t, i) => (
            <Button variant="outline" key={t.id} aria-pressed={i === active} onClick={() => setActive(i)}
              className={cn("flex h-auto shrink-0 items-center gap-2 px-3 py-2 text-left text-xs transition-all",
                i === active ? "border-gold bg-card shadow-soft" : "border-border text-muted-foreground hover:border-foreground/30")}>
              <FileCode2 className="size-3.5" strokeWidth={1.6} />
              <span><span className="block font-medium text-foreground">{t.file.split("/").pop()}</span>{agentProjectName(t.agentId)} · {compactWhen(t.when)}</span>
            </Button>
          ))}
          {s.evidence.length > previewCount && (
            <Button variant="outline" size="sm" aria-expanded={showAllTraces} aria-controls={`traces-${s.id}`}
              className={cn("shrink-0 gap-2 border-dashed text-xs", showAllTraces && "border-solid")}
              onClick={() => { if (showAllTraces && active >= previewCount) setActive(0); setShowAllTraces((value) => !value); }}>
              {showAllTraces ? <ChevronUp /> : <ChevronDown />}
              {showAllTraces ? "Show fewer traces" : "Show all traces"}
              {!showAllTraces && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">+{s.evidence.length - previewCount} more</span>}
            </Button>
          )}
        </div>
        <div className="gs-panel p-5">
          <div className="mb-3"><AgentLabel id={trace.agentId} className="block text-sm font-medium text-foreground" /><p className="text-xs text-muted-foreground">{agents.find((agent) => agent.id === trace.agentId)?.tool}</p></div>
          <p className="gs-caption mb-5 break-words font-mono">{projects.find((project) => project.id === trace.project)?.name} / {trace.file} <span className="ml-2 opacity-60">#{trace.id}</span></p>
          <TraceView key={trace.id} t={trace} />
        </div>
      </section>
      </div>

      {status !== "accepted" && (
        <div className="sticky bottom-0 z-10 -mx-6 mt-8 flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-6 py-4 lg:-mx-14 lg:px-14">
          {status === "dismissed" ? (
            <span className="text-sm text-muted-foreground">Dismissed. <Button variant="link" size="sm" onClick={() => onStatus("pending")}>Undo</Button></span>
          ) : (<>
            <AcceptRulePopover key={s.id} s={s} onAccept={(picked) => { accept(s, picked, drafts.get(s.id) ?? s.proposedMarkdown); onStatus("accepted"); setConfirmationOpen(true); }} />
            <Button variant="outline" onClick={() => onStatus("dismissed")} className="gap-2 border-border text-muted-foreground shadow-none"><X className="size-4" /> Dismiss</Button>
          </>)}
        </div>
      )}
    </div>
  );
}
