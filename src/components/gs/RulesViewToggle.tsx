import { Link } from "@tanstack/react-router";
import { List, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  view: "canvas" | "list";
  collapsed?: boolean;
};

/** Canvas / List active slider switch shared by both Rules views; supports compressed vertical layout when sidebar is collapsed. */
export function RulesViewToggle({ view, collapsed = false }: Props) {
  if (collapsed) {
    return (
      <TooltipProvider delayDuration={150}>
        <div
          role="group"
          aria-label="Rules view"
          className="gs-rules-nav-view relative mx-auto flex h-[64px] w-8 flex-col items-center justify-between rounded-full border border-border bg-card p-0.5 shadow-xs"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 size-7 rounded-full bg-gold-soft shadow-soft transition-transform duration-200 ease-out"
            style={{
              transform: view === "list" ? "translateY(32px)" : "translateY(0px)",
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/canvas"
                search={{}}
                aria-label="Canvas view"
                aria-pressed={view === "canvas"}
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-hidden",
                  view === "canvas" ? "text-gold-deep" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Network className="size-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Canvas view</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/canvas"
                search={{ view: "list" }}
                aria-label="List view"
                aria-pressed={view === "list"}
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-hidden",
                  view === "list" ? "text-gold-deep" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="size-3.5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">List view</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div
      role="group"
      aria-label="Rules view"
      className="gs-rules-nav-view relative flex h-8 w-full items-center rounded-full border border-border bg-card p-0.5 shadow-xs"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 rounded-full bg-gold-soft shadow-soft transition-transform duration-200 ease-out"
        style={{
          width: "calc(50% - 2px)",
          transform: view === "list" ? "translateX(100%)" : "translateX(0px)",
        }}
      />
      <Link
        to="/canvas"
        search={{}}
        aria-label="Canvas view"
        aria-pressed={view === "canvas"}
        className={cn(
          "relative z-10 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-hidden",
          view === "canvas" ? "text-gold-deep" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Network className="size-3.5" />
        <span className="gs-rules-nav-copy">Canvas</span>
      </Link>
      <Link
        to="/canvas"
        search={{ view: "list" }}
        aria-label="List view"
        aria-pressed={view === "list"}
        className={cn(
          "relative z-10 inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-hidden",
          view === "list" ? "text-gold-deep" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="size-3.5" />
        <span className="gs-rules-nav-copy">List</span>
      </Link>
    </div>
  );
}
