import type { CanvasRule } from "./canvas-rules";
import type { ScopeDraft } from "./rule-scope";

export function initialCanvasView(ruleId?: string) {
  return { includeExamples: !ruleId, focusRule: ruleId ?? "all" };
}

export function journeyRules(rules: CanvasRule[], accepted: Record<string, ScopeDraft>, includeExamples: boolean) {
  return includeExamples ? rules : rules.filter((rule) => Object.hasOwn(accepted, rule.id));
}