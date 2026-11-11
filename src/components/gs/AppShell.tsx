import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Inbox, LayoutGrid, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { StarAvatar } from "./Star";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const nav = [
  { to: "/", label: "Proposed Rules", icon: Inbox, count: 3 },
  { to: "/canvas", label: "Constellations", icon: LayoutGrid },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  return (
    <TooltipProvider delayDuration={150}><div className="flex min-h-screen bg-background">
      <aside data-collapsed={collapsed} className="gs-sidebar sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-6">
        <Link to="/" className="gs-brand mb-5 flex items-center gap-2 px-2" aria-label="Gold Star home">
          <StarAvatar className="size-12 shrink-0" />
          <span className="gs-sidebar-label brand-wordmark whitespace-nowrap font-brand text-xl font-medium leading-normal text-gold">Gold Star</span>
        </Link>
        <nav id="gold-star-nav" aria-label="Main navigation" className="flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon, ...rest }) => (
            <Tooltip key={to}><TooltipTrigger asChild><Link to={to} activeOptions={{ exact: true }}
              aria-label={label} className="group flex h-10 items-center gap-2.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-card data-[status=active]:text-gold data-[status=active]:shadow-soft">
              <Icon className="size-4 transition-transform group-hover:scale-110" strokeWidth={1.6} />
              <span className="gs-sidebar-label flex-1 whitespace-nowrap">{label}</span>
              {"count" in rest && <span className="gs-sidebar-label rounded-full bg-gold-soft px-1.5 font-mono text-[10px] text-gold-deep">{rest.count}</span>}
            </Link></TooltipTrigger>{collapsed && <TooltipContent side="right">{label}{"count" in rest ? ` · ${rest.count}` : ""}</TooltipContent>}</Tooltip>
          ))}
        </nav>
        <footer className="mt-auto flex flex-col gap-3 pt-6">
        <div className={collapsed ? "flex justify-center" : "flex justify-end"}>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" aria-label={toggleLabel} aria-expanded={!collapsed} aria-controls="gold-star-nav" onClick={() => setCollapsed((value) => !value)} className="text-muted-foreground">
            {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button></TooltipTrigger><TooltipContent side="right">{toggleLabel}</TooltipContent></Tooltip>
        </div>
        </footer>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div></TooltipProvider>
  );
}
