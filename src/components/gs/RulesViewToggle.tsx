import { Link } from "@tanstack/react-router";
import { List, Network } from "lucide-react";
import { cn } from "@/lib/utils";

/** Canvas / List switch shared by both Rules views; the view lives in the URL so both stay one page. */
export function RulesViewToggle({ view }: { view: "canvas" | "list" }) {
  const item = (active: boolean) => cn("inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors", active ? "bg-gold-soft text-gold-deep" : "text-muted-foreground hover:text-foreground");
  return <div role="group" aria-label="Rules view" data-tour="rules-view" className="gs-rules-nav-view flex w-full items-center rounded-full border border-border bg-card p-0.5">
    <Link to="/canvas" search={{}} aria-label="Canvas" aria-pressed={view === "canvas"} className={item(view === "canvas")}><Network className="size-3.5" /><span className="gs-rules-nav-copy">Canvas</span></Link>
    <Link to="/canvas" search={{ view: "list" }} aria-label="List" aria-pressed={view === "list"} className={item(view === "list")}><List className="size-3.5" /><span className="gs-rules-nav-copy">List</span></Link>
  </div>;
}
