import { ScopeTier } from "./ScopeTier";
import { projects, type ScopeDraft } from "@/data/rule-scope";
import type { RuleDraft } from "@/data/canvas-rules";

// The inspector reports where a rule lives; it never moves the rule. Scope changes happen on the
// canvas — drag a rule's dot onto a project or onto Global, or click a wire to cut it — so nothing
// in here is clickable.
export function ScopeSummary({ draft, scope }: { draft: RuleDraft; scope: ScopeDraft }) {
  const owner = projects.find((p) => p.id === draft.targetProjectId);
  const attached = scope.projects.length > 0;
  return (
    <div>
      <ScopeTier scopeType={draft.scopeType} />
      <p className="mt-2 text-xs text-muted-foreground">
        {draft.scopeType === "global"
          ? "Inherited across every project, except the ones cut off below."
          : attached
            ? `Attached to ${owner?.name ?? "one project"}.`
            : `Cut off from ${owner?.name ?? "its project"} — no project receives it.`}
      </p>
      {draft.scopeType === "global" && (
        <ul className="mt-3 space-y-1">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
              <span>{p.name}</span>
              <span className="text-xs text-muted-foreground">{scope.projects.includes(p.id) ? "Receives this rule" : "Cut off"}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">To change scope, drag this rule's dot onto a project or onto Global · click a wire to cut it.</p>
    </div>
  );
}
