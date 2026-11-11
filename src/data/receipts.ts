import { agents, canvasRule, projects, type ScopeDraft } from "./rule-scope";

/** One agent run. Kept separate from agent tools so one agent can have many runs. */
export type Execution = {
  id: string; label: string; agentId: string; task: string; when: string;
  output: string;
  /** Result of the verification check, only meaningful when the rule was delivered. */
  check: { name: string; passed: boolean; detail: string; line?: number };
  context: string[];
  trace: { role: "user" | "agent" | "system"; text: string }[];
};
export type Delivery = "delivered" | "not-targeted";
export type Followed = "followed" | "not-followed" | "not-evaluated";

/** Demo scope used until the user approves one on the Rule Canvas. */
export const demoScope: ScopeDraft = { projects: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"] };

const ruleLine = `[gold-star] ${canvasRule.title}`;
export const executions: Execution[] = [
  { id: "run_a1", label: "Run 01", agentId: "product-a-builder", task: "Add a save action to the account settings form", when: "Today, 10:42",
    output: `import { Button } from "@/components/ui/button";\n\n<Button type="submit">Save changes</Button>`,
    check: { name: "Button import check", passed: true, detail: "Every clickable action uses Button from @/components/ui/button." },
    context: ["system: Product A coding conventions", ruleLine, "user: Add a save action to the account settings form"],
    trace: [{ role: "user", text: "Add a save action to the account settings form." }, { role: "system", text: "Loaded 1 Gold Star rule into the task context." }, { role: "agent", text: "Added a submit Button below the form fields." }] },
  { id: "run_a2", label: "Run 02", agentId: "product-a-reviewer", task: "Add a primary call to action on the onboarding page", when: "Today, 11:05",
    output: `import { Button } from "@/components/ui/button";\n\n<Button size="lg">Start setup</Button>`,
    check: { name: "Button import check", passed: true, detail: "Every clickable action uses Button from @/components/ui/button." },
    context: ["system: Product A coding conventions", ruleLine, "user: Add a primary call to action on the onboarding page"],
    trace: [{ role: "user", text: "Add a primary call to action on the onboarding page." }, { role: "system", text: "Loaded 1 Gold Star rule into the task context." }, { role: "agent", text: "Added a large Button labelled “Start setup”." }] },
  { id: "run_a3", label: "Run 03", agentId: "product-a-builder", task: "Add an export action to the invoices table", when: "Today, 13:18",
    output: `<button\n  className="rounded-md bg-blue-600 px-4 py-2\n    text-white hover:bg-blue-700"\n>\n  Export CSV\n</button>`,
    check: { name: "Button import check", passed: false, line: 1, detail: "Found a native <button> with custom classes. Expected Button from @/components/ui/button." },
    context: ["system: Product A coding conventions", ruleLine, "user: Add an export action to the invoices table"],
    trace: [{ role: "user", text: "Add an export action to the invoices table." }, { role: "system", text: "Loaded 1 Gold Star rule into the task context." }, { role: "agent", text: "Added an “Export CSV” button to the table header." }] },
  { id: "run_b4", label: "Run 04", agentId: "product-b-checkout", task: "Add a checkout action to the cart drawer", when: "Today, 13:40",
    output: `import { ActionButton } from "@/commerce/ui/action-button";\n\n<ActionButton intent="buy">Checkout</ActionButton>`,
    check: { name: "Button import check", passed: false, detail: "Not run — this rule was not sent to this agent." },
    context: ["system: Product B commerce conventions", "user: Add a checkout action to the cart drawer"],
    trace: [{ role: "user", text: "Add a checkout action to the cart drawer." }, { role: "system", text: "No Gold Star rules matched this agent." }, { role: "agent", text: "Added an ActionButton using the commerce kit." }] },
];

export function deliveryFor(run: Execution, scope: ScopeDraft): Delivery {
  return scope.agents.includes(run.agentId) ? "delivered" : "not-targeted";
}
/** Followed is evaluated independently, and only for runs that received the rule. */
export function followedFor(run: Execution, scope: ScopeDraft): Followed {
  if (deliveryFor(run, scope) !== "delivered") return "not-evaluated";
  return run.check.passed ? "followed" : "not-followed";
}
export function agentOf(run: Execution) { return agents.find((a) => a.id === run.agentId); }
export function projectOf(run: Execution) { return projects.find((p) => p.id === agentOf(run)?.projectId); }
