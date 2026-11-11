import { createFileRoute } from "@tanstack/react-router";
import { RuleCanvas } from "@/components/gs/RuleCanvas";
import { RuleList } from "@/components/gs/RuleList";

export const Route = createFileRoute("/canvas")({
  validateSearch: (search: Record<string, unknown>): { rule?: string; view?: "list" } => ({ ...(typeof search["rule"] === "string" ? { rule: search["rule"] } : {}), ...(search["view"] === "list" ? { view: "list" as const } : {}) }),
  head: () => ({
    meta: [
      { title: "Rule Canvas — Gold Star" },
      { name: "description", content: "Explore accepted rules, adjust project and agent scope, and review example verification in Gold Star’s constellation workspace." },
      { property: "og:title", content: "Rule Canvas — Gold Star" },
      { property: "og:description", content: "Explore accepted rules, adjust project and agent scope, and review example verification in Gold Star’s constellation workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const { view } = Route.useSearch();
  return view === "list" ? <RuleList /> : <RuleCanvas />;
}
