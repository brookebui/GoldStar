import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ListFilter, Search } from "lucide-react";
import { filterSuggestions, ruleCategories, suggestions, type RuleCategory, type SuggestionStatus } from "@/data/suggestions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SuggestionCard } from "@/components/gs/SuggestionCard";
import { EvidencePanel } from "@/components/gs/EvidencePanel";
import { useRuleScope } from "@/components/gs/RuleScopeProvider";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { rule?: string; edit?: boolean } => typeof search["rule"] === "string" ? { rule: search["rule"], edit: search["edit"] === true } : {},
  head: () => ({
    meta: [
      { title: "Learning Inbox — Gold Star" },
      { name: "description", content: "Review rules Gold Star learned from your repeated corrections to AI agents." },
      { property: "og:title", content: "Learning Inbox — Gold Star" },
      { property: "og:description", content: "Review rules learned from your repeated corrections to AI agents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Inbox,
});

function Inbox() {
  const search = Route.useSearch();
  return <InboxView key={JSON.stringify(search)} search={search} />;
}

function InboxView({ search }: { search: { rule?: string; edit?: boolean } }) {
  const { accepted, statuses, setStatus } = useRuleScope();
  const [selectedId, setSelectedId] = useState(search.rule ?? suggestions[0]?.id);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SuggestionStatus>(search.rule && accepted[search.rule] ? "accepted" : search.rule ? statuses[search.rule] ?? "pending" : "pending");
  const [category, setCategory] = useState<RuleCategory | "All">("All");
  const currentStatuses: Record<string, SuggestionStatus> = { ...statuses, ...Object.fromEntries(Object.keys(accepted).map((id) => [id, "accepted" as const])) };
  const visible = filterSuggestions(suggestions, currentStatuses, tab, query, category);
  const count = (t: SuggestionStatus) => filterSuggestions(suggestions, currentStatuses, t, "").length;
  const selected = suggestions.find((s) => s.id === selectedId) ?? suggestions[0];
  if (!selected) return null;
  return (
    <div className="inbox-workspace grid h-dvh min-h-0 overflow-hidden">
      <section aria-label="Learning Inbox" className="paper-grid flex min-h-0 min-w-0 flex-col border-r border-border">
        <header className="shrink-0 bg-background px-8 pb-6 pt-10">
        <h1 className="gs-section-title">Proposed Rules</h1>
        <p className="gs-secondary mt-3">Patterns we noticed in how you correct your agents.</p>
        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rules" aria-label="Search rules" className="pl-9" />
        </div>
        <div role="group" aria-label="Filter by status" className="mt-3 flex gap-1.5">
          {(["pending", "accepted", "dismissed"] as const).map((t) => (
            <Button key={t} size="sm" variant={tab === t ? "secondary" : "ghost"} aria-pressed={tab === t} onClick={() => setTab(t)} className="flex-1 capitalize">
              {t}<span className="ml-1 text-xs text-muted-foreground">{count(t)}</span>
            </Button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="mt-3 gap-2" aria-label="Filter by category">
              <ListFilter className="size-3.5" /> {category === "All" ? "All categories" : category}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1.5">
            <div role="radiogroup" aria-label="Rule category">
              {(["All", ...ruleCategories] as const).map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={category === c}
                  onClick={() => setCategory(c)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Check className={`size-3.5 ${category === c ? "text-gold-deep" : "invisible"}`} />
                  {c === "All" ? "All categories" : c}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        </header>
        <div role="region" aria-label="Suggested rules" tabIndex={0} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-8 pb-10">
          {visible.length === 0 && <p className="gs-secondary py-10 text-center">{query ? "No rules match your search." : category !== "All" ? `No ${tab} ${category.toLowerCase()} rules yet.` : `No ${tab} rules yet.`}</p>}
          {visible.map((s, i) => (
            <SuggestionCard key={s.id} s={s} index={i} selected={s.id === selectedId} onSelect={() => setSelectedId(s.id)} />
          ))}
        </div>
      </section>
      <section aria-label="Rule details" className="relative isolate min-h-0 min-w-0 overflow-hidden"><div tabIndex={0} className="h-full overflow-y-auto overscroll-contain px-6 pb-0 pt-12 lg:px-14"><EvidencePanel key={selected.id} s={selected} status={currentStatuses[selected.id] ?? "pending"} initialEditing={search.edit === true && search.rule === selected.id} onStatus={(st) => setStatus(selected.id, st)} /></div></section>
    </div>
  );
}
