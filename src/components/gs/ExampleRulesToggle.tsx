import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRuleScope } from "./RuleScopeProvider";

export function ExampleRulesToggle({ onToggle }: { onToggle?: (() => void) | undefined }) {
  const { includeExamples, setIncludeExamples, rulesNavCollapsed } = useRuleScope();
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="gs-rules-nav-examples flex h-8 w-full cursor-pointer items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="gs-rules-nav-copy">Example rules</span>
            <Switch
              checked={includeExamples}
              aria-label="Example rules"
              onCheckedChange={(on) => {
                setIncludeExamples(on);
                onToggle?.();
              }}
            />
          </label>
        </TooltipTrigger>
        <TooltipContent side={rulesNavCollapsed ? "right" : "top"}>
          For demo purposes only
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
