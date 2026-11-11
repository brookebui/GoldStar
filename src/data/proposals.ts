/** Emerging patterns: repeated deviations that may belong in the design system. */
export type ProposalSighting = { agentId: string; project: string; file: string; when: string; code: string; note: string };
/** Triage outcome, borrowed from design-system gap reviews: not every gap needs a new component. */
export type Triage = "propose" | "extend" | "cut";
export type Proposal = {
  id: string; title: string; summary: string; pattern: string;
  friction: string; constraint: string;
  suggested: Triage; suggestedWhy: string;
  closest: { name: string; code: string }; differs: string[];
  sightings: ProposalSighting[];
};

export const proposals: Proposal[] = [
  {
    id: "intent-button", title: "Intent-aware action button",
    summary: "Product B keeps reaching for an ActionButton with an intent prop (buy, confirm, destroy). It shows up in commerce flows the shared Button doesn't cover.",
    friction: "Checkout buttons double-submitted while payments settled, so agents kept hand-building a pending state.",
    constraint: "Button only changes how it looks. It has no idea that an action is a payment or can't be undone.",
    suggested: "propose", suggestedWhy: "This is new behaviour, not a new look, and it showed up in three separate flows.",
    pattern: `<ActionButton intent="buy" pending={isPaying}>\n  Checkout\n</ActionButton>`,
    closest: { name: "Button", code: `<Button variant="default">Checkout</Button>` },
    differs: ["Built-in pending state for payments", "Intent maps to analytics + confirmation", "Not a visual variant — a behavioural one"],
    sightings: [
      { agentId: "product-b-checkout", project: "Product B", file: "cart/CartDrawer.tsx", when: "Today", code: `<ActionButton intent="buy">Checkout</ActionButton>`, note: "Used for the main checkout action." },
      { agentId: "product-b-checkout", project: "Product B", file: "orders/CancelOrder.tsx", when: "Yesterday", code: `<ActionButton intent="destroy" confirm>Cancel order</ActionButton>`, note: "Intent triggered a confirm step." },
      { agentId: "product-b-checkout", project: "Product B", file: "subscriptions/Upgrade.tsx", when: "3 days ago", code: `<ActionButton intent="buy" pending>Upgrade</ActionButton>`, note: "Pending state while payment settles." },
    ],
  },
  {
    id: "inline-confirm", title: "Inline confirmation instead of a dialog",
    summary: "Agents in both products swapped modal confirmations for an inline “Are you sure?” row on low-risk actions.",
    friction: "A full-screen dialog felt too heavy for removing one row, and people lost their place in the list.",
    constraint: "AlertDialog is the only confirmation pattern, and it always takes over the screen.",
    suggested: "extend", suggestedWhy: "The confirm logic already exists in AlertDialog. It needs a lighter inline variant, not a separate component.",
    pattern: `<InlineConfirm onConfirm={remove}>\n  Remove member\n</InlineConfirm>`,
    closest: { name: "AlertDialog", code: `<AlertDialog>…</AlertDialog>` },
    differs: ["Keeps focus in place", "Lighter than a modal for reversible actions"],
    sightings: [
      { agentId: "product-a-reviewer", project: "Product A", file: "team/MemberRow.tsx", when: "2 days ago", code: `<InlineConfirm>Remove</InlineConfirm>`, note: "Replaced an AlertDialog after feedback." },
      { agentId: "product-b-checkout", project: "Product B", file: "cart/LineItem.tsx", when: "Last week", code: `<InlineConfirm>Remove item</InlineConfirm>`, note: "Same pattern, independently." },
    ],
  },
  {
    id: "photo-carousel", title: "Swipeable photo carousel",
    summary: "Agents hand-rolled a scroll-snap image carousel on product detail pages.",
    friction: "Product photos needed swiping on mobile, and nothing in the kit supported it.",
    constraint: "There's no carousel today, but the design-system team is already building one.",
    suggested: "cut", suggestedWhy: "It's already in progress elsewhere. Point the agents at the upcoming component instead of proposing a second one.",
    pattern: `<div className="flex snap-x overflow-x-auto">\n  {photos.map(…)}\n</div>`,
    closest: { name: "Carousel (in progress)", code: `<Carousel items={photos} />` },
    differs: ["Same goal as the upcoming component", "Missing keyboard and screen-reader support"],
    sightings: [
      { agentId: "product-b-checkout", project: "Product B", file: "product/Gallery.tsx", when: "4 days ago", code: `<div className="snap-x overflow-x-auto">…</div>`, note: "Built for the product gallery." },
    ],
  },
];

export function productCount(p: Proposal) { return new Set(p.sightings.map((s) => s.project)).size; }
