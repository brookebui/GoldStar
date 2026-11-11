export type ExportFormat = "agents" | "cursor" | "claude";
export type ShareableRule = { id: string; name: string; markdown: string; projectNames: string[]; global: boolean };

export function scopeLine(rule: ShareableRule): string {
  if (rule.projectNames.length === 0) return "Not attached to any project yet.";
  return `${rule.global ? "Global" : "Local"} · applies to ${rule.projectNames.join(", ")}`;
}

export function exportRule(rule: ShareableRule, format: ExportFormat): string {
  const body = rule.markdown.trim();
  const scope = scopeLine(rule);
  if (format === "cursor") return `# ${rule.name}\n# Scope: ${scope}\n\n${body}\n`;
  if (format === "claude") return `<rule name="${rule.name}">\nScope: ${scope}\n\n${body}\n</rule>\n`;
  return `## ${rule.name}\n\n_Scope: ${scope}_\n\n${body}\n`;
}

export function ruleLink(origin: string, id: string): string {
  return `${origin}/canvas?rule=${encodeURIComponent(id)}`;
}
