export type Agent = { id: string; projectId: string; tool: string; description: string };
/** Agents are identified by their project: every surface labels an agent's work with the project it belongs to. */
export const initialAgents: Agent[] = [
  { id: "product-a-builder", projectId: "product-a", tool: "Claude", description: "Builds interface layouts and actions using the shared design system." },
  { id: "product-a-reviewer", projectId: "product-a", tool: "Claude", description: "Reviews interface consistency, wording, and design-system usage." },
  { id: "product-b-developer", projectId: "product-b", tool: "Claude", description: "Develops reusable storefront components with the commerce UI kit." },
  { id: "product-b-checkout", projectId: "product-b", tool: "Claude", description: "Builds cart and checkout interactions for the storefront." },
];
