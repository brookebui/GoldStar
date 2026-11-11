import { Box, Globe } from "lucide-react";
import type { RuleDraft } from "@/data/canvas-rules";

// A rule lives in exactly one scope, so only that one is named here. The other tier is not
// listed, because showing both made the pair look like tabs you could click between.
export function ScopeTier({ scopeType }: { scopeType: RuleDraft["scopeType"] }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
      {scopeType === "global" ? (
        <>
          <Globe className="size-3.5 shrink-0 text-gold" />
          <span>Global</span>
        </>
      ) : (
        <>
          <Box className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Local</span>
        </>
      )}
    </div>
  );
}
