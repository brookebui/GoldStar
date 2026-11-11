import { agentProjectName } from "@/data/rule-scope";

/** Read-only attribution: an agent's work is labelled by the project it belongs to. */
export function AgentLabel({ id, className }: { id: string; className?: string }) {
  return <span className={className}>{agentProjectName(id)}</span>;
}
