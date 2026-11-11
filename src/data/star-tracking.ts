import type { ScopeDraft } from "./rule-scope";

export type StarRun = {
  id: string;
  ruleId: string;
  agentId: string;
  sequence: number;
  delivered: boolean;
  passed: boolean;
  markdown: string;
};
export type StarState = "waiting" | "bright" | "dim";

/** Arrival order and delivery are recorded at run time, not recomputed after scope edits. */
export function createStarRun(history: StarRun[], ruleId: string, agentId: string, scope: ScopeDraft, passed: boolean, markdown: string): StarRun {
  const sequence = history.reduce((max, run) => Math.max(max, run.sequence), 0) + 1;
  return { id: `example-${sequence}`, sequence, ruleId, agentId, delivered: scope.agents.includes(agentId), passed, markdown };
}

/** Star state for a whole project: the latest delivered run from any of its agents decides it. */
export function starForAgents(history: StarRun[], ruleId: string, agentIds: string[]) {
  const delivered = history.filter((run) => run.ruleId === ruleId && agentIds.includes(run.agentId) && run.delivered);
  const latest = delivered.reduce<StarRun | undefined>((last, run) => !last || run.sequence > last.sequence ? run : last, undefined);
  const state: StarState = !latest ? "waiting" : latest.passed ? "bright" : "dim";
  return { state, earned: delivered.filter((run) => run.passed).length, latest };
}

export function starFor(history: StarRun[], ruleId: string, agentId: string) {
  return starForAgents(history, ruleId, [agentId]);
}