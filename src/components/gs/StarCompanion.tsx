import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { filterSuggestions, suggestions } from "@/data/suggestions";
import { AcceptRulePopover } from "./AcceptRulePopover";
import { drafts } from "./EvidencePanel";
import { useRuleScope } from "./RuleScopeProvider";
import { SuggestionCardContent } from "./SuggestionCard";
import companionAvatar from "@/assets/gold-star-companion.png";
import nightSky from "@/assets/constellation-sky.jpg";

export function StarCompanion() {
  const [open, setOpen] = useState(false);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<string | null>(null);
  const [dismissedAlert, setDismissedAlert] = useState<string | null>(null);
  const { accept, accepted, statuses, setStatus } = useRuleScope();
  const pending = filterSuggestions(suggestions, statuses, "pending", "").filter(
    (suggestion) => !Object.hasOwn(accepted, suggestion.id),
  );
  const [previousCount, setPreviousCount] = useState(pending.length);
  const [arrival, setArrival] = useState(0);
  if (pending.length !== previousCount) {
    setPreviousCount(pending.length);
    if (pending.length > previousCount) setArrival((value) => value + 1);
  }
  const topPattern = pending.reduce<(typeof pending)[number] | undefined>(
    (top, suggestion) => !top || suggestion.confidence > top.confidence ? suggestion : top,
    undefined,
  );

  const alertKey = topPattern ? `${topPattern.id}:${topPattern.occurrences}` : null;
  const alertCopy: Record<string, string> = {
    "button-component": "Noticing repeated custom buttons. Want to make this a rule?",
    "spacing-tokens": "Noticing repeated spacing fixes. Want to make this a rule?",
    "sentence-case": "Noticing repeated label corrections. Want to make this a rule?",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {!open && topPattern && dismissedAlert !== alertKey && (
        <div
          role="status"
          className="fixed bottom-32 right-4 z-40 w-[min(220px,calc(100vw-2rem))] rounded-2xl border border-gold/30 bg-card p-3 shadow-lg after:absolute after:-bottom-2 after:right-5 after:size-4 after:rotate-45 after:border-b after:border-r after:border-gold/30 after:bg-card"
        >
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-0.5 top-0.5 text-muted-foreground"
            aria-label="Dismiss pattern alert"
            onClick={() => setDismissedAlert(alertKey)}
          >
            <X className="size-3" />
          </Button>
          <p className="pr-5 text-sm leading-relaxed">{alertCopy[topPattern.id] ?? `Noticing ${topPattern.summary ?? topPattern.title}. Want to make this a rule?`}</p>
          <div className="mt-3 flex flex-col gap-1">
            <Button size="sm" className="w-full" onClick={() => {
              setHighlightedSuggestion(topPattern.id);
              setDismissedAlert(alertKey);
              setOpen(true);
            }}>Review suggestion</Button>
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setDismissedAlert(alertKey)}>Not now</Button>
          </div>
        </div>
      )}
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-14 right-4 z-40 size-14 border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
          onClick={() => setHighlightedSuggestion(null)}
          aria-label={`Gold Star suggestions (${pending.length} pending)`}
        >
          <span key={arrival} className="gs-companion-arrival block size-full" data-paused={open}>
            <img src={companionAvatar} alt="" className="gs-companion-float size-full object-contain" />
          </span>
          {pending.length > 0 && <span aria-hidden="true" className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border-2 border-background bg-gold text-xs font-semibold text-primary-foreground">{pending.length}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        sideOffset={10}
        className="z-50 max-h-[var(--radix-popover-content-available-height)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto"
        style={{ backgroundImage: `url(${nightSky})`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-label="Gold Star suggestions"
      >
        <h2 className="mb-3 font-medium">Suggested rules</h2>
        {pending.length === 0 && <p className="gs-caption" role="status">No pending suggestions.</p>}
        <ul className="space-y-2">
          {pending.map((suggestion) => (
            <li
              key={suggestion.id}
              className={`rounded-lg border bg-card p-4 ${highlightedSuggestion === suggestion.id ? "border-gold shadow-soft" : "border-border"}`}
              aria-current={highlightedSuggestion === suggestion.id ? "true" : undefined}
              ref={(node) => { if (node && highlightedSuggestion === suggestion.id) node.scrollIntoView({ block: "nearest" }); }}
            >
              <Link
                to="/"
                search={{ rule: suggestion.id }}
                onClick={() => setOpen(false)}
                className="block rounded-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:[&_h3]:text-gold"
              >
                <SuggestionCardContent s={suggestion} />
              </Link>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AcceptRulePopover
                  s={suggestion}
                  onAccept={(scope) => {
                    accept(suggestion, scope, drafts.get(suggestion.id) ?? suggestion.proposedMarkdown);
                    setOpen(false);
                  }}
                />
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/" search={{ rule: suggestion.id, edit: true }} onClick={() => setOpen(false)}>Edit</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setStatus(suggestion.id, "dismissed")}>Dismiss</Button>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
