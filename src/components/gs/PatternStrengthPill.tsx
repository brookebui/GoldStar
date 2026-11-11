import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { patternStrength, type Suggestion } from "@/data/suggestions";

/**
 * Gold pattern-strength pill with an info popover beneath it.
 * Opens on hover (mouse), click/tap, and keyboard focus; closes on
 * pointer leave, blur, Escape, or outside interaction.
 */
export function PatternStrengthPill({ s }: { s: Suggestion }) {
  const strong = s.confidence >= 0.85;
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Radix returns focus to the trigger when the popover closes; that
  // programmatic focus must not reopen it, so ignore focus briefly after close.
  const ignoreFocusUntil = useRef(0);
  // While the pointer rests on the trigger, a click's toggle-off is ignored:
  // hover already opened the popover, so the click must not instantly close it.
  const hovering = useRef(false);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const close = () => {
    ignoreFocusUntil.current = Date.now() + 250;
    setOpen(false);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(close, 120);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { if (o) setOpen(true); else if (!hovering.current) close(); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${patternStrength(s.confidence)} — about pattern strength`}
          onPointerEnter={(e) => { if (e.pointerType === "mouse") { hovering.current = true; openNow(); } }}
          onPointerLeave={(e) => { if (e.pointerType === "mouse") { hovering.current = false; closeSoon(); } }}
          // Open on keyboard focus only; programmatic focus (e.g. Radix focus
          // return after close) is suppressed by ignoreFocusUntil.
          onFocus={(e) => Date.now() >= ignoreFocusUntil.current && e.target.matches(":focus-visible") && openNow()}
          onBlur={closeSoon}
          className={cn(badgeVariants({ variant: strong ? "pending" : "outline" }), "cursor-help outline-none focus-visible:ring-2 focus-visible:ring-ring")}
        >
          {patternStrength(s.confidence)}
          <Info aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={9}
        // Keep focus on the pill: autofocusing the content would blur the
        // trigger, and the blur handler would immediately close the popover.
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerEnter={(e) => e.pointerType === "mouse" && openNow()}
        onPointerLeave={(e) => e.pointerType === "mouse" && closeSoon()}
        className="w-[260px] rounded-lg border-border bg-card p-4 text-card-foreground shadow-lift"
      >
        {/* Speech-bubble pointer: rotated square sharing the popover's fill and border so it reads as one surface. */}
        <span aria-hidden="true" className="absolute -top-[5.5px] left-14 size-2.5 rotate-45 rounded-[2px] border-l border-t border-border bg-card" />
        <p className="gs-overline">About pattern strength</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {strong
            ? "Strong patterns are based on recurring, consistent corrections across multiple agent runs."
            : "Emerging patterns are based on corrections that are starting to recur, but aren't consistent yet."}
        </p>
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{s.occurrences}</span> correction{s.occurrences === 1 ? "" : "s"}
          </span>
          <span>
            <span className="font-medium text-foreground">{s.traces}</span> trace{s.traces === 1 ? "" : "s"}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
