import { Switch } from "@/components/ui/switch";
import { useRuleScope } from "./RuleScopeProvider";

export function ExampleRulesToggle({ onToggle }: { onToggle?: (() => void) | undefined }) {
  const { includeExamples, setIncludeExamples } = useRuleScope();
  return (
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
  );
}
