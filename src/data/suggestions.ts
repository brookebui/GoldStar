export type TraceLine = { role: "user" | "agent"; text: string; code?: string; flag?: "violation" | "correction" };
export type Trace = { id: string; agentId: string; project: string; file: string; when: string; lines: TraceLine[] };
export type RuleCategory = "Color" | "Typography" | "Components" | "Spacing" | "Voice and copy" | "Misc";
export const ruleCategories: RuleCategory[] = ["Color", "Typography", "Components", "Spacing", "Voice and copy", "Misc"];

export type Suggestion = {
  id: string; title: string; summary?: string; rationale: string; occurrences: number; traces: number;
  confidence: number; scope: string[]; agents: string[]; category: string; ruleCategory: RuleCategory; featured?: boolean;
  before: string; after: string; proposedMarkdown: string; evidence: Trace[];
};

export const suggestions: Suggestion[] = [
  {
    id: "button-component", featured: true, category: "Components", ruleCategory: "Components",
    title: "Use the design system's Button component instead of creating custom buttons.",
    summary: "Custom buttons instead of shared Button",
    rationale: "You've corrected hand-rolled <button> elements with ad-hoc Tailwind classes 14 times across 9 sessions. Every fix replaced them with <Button> from @/components/ui/button.",
    occurrences: 14, traces: 9, confidence: 0.94, scope: ["product-a"], agents: ["product-a-builder", "product-a-reviewer"],
    before: `<button className="px-4 py-2 rounded-md\n  bg-blue-600 text-white hover:bg-blue-700">\n  Save changes\n</button>`,
    after: `import { Button } from "@/components/ui/button";\n\n<Button variant="primary">Save changes</Button>`,
    proposedMarkdown: `For every UI action that needs a button:

- Import \`Button\` from \`@/components/ui/button\` and use it instead of a raw \`<button>\` element.
- Choose an existing variant and size for the action. Use \`destructive\` for destructive actions, \`outline\` or \`secondary\` for secondary actions, and \`ghost\` or \`link\` for quiet actions.
- Preserve the action's event handler, button type, disabled state, and accessible label.
- Do not recreate button styling with custom colors, gradients, spacing, or inline styles. If no existing variant fits, ask before introducing a new one.

\`\`\`tsx
import { Button } from "@/components/ui/button";

<Button type="submit">Save changes</Button>
<Button variant="destructive" onClick={deleteProject}>
  Delete project
</Button>
\`\`\``,
    evidence: [
      { id: "tr_8f21", agentId: "product-a-builder", project: "product-a", file: "settings/ProfileForm.tsx", when: "2 hours ago", lines: [
        { role: "user", text: "Add a save button to the profile form." },
        { role: "agent", text: "Added a submit button at the bottom of the form.", code: `<button className="bg-indigo-600 text-white px-4 py-2 rounded">Save</button>`, flag: "violation" },
        { role: "user", text: "Please use our Button component, not a raw button. We have variants for this.", flag: "correction" },
        { role: "agent", text: "Replaced with the shared component.", code: `<Button variant="primary" type="submit">Save</Button>` },
      ]},
      { id: "tr_7c09", agentId: "product-a-reviewer", project: "product-a", file: "components/PricingCard.tsx", when: "Yesterday", lines: [
        { role: "user", text: "Make the 'Start trial' CTA more prominent." },
        { role: "agent", text: "Styled a larger custom button with a gradient.", code: `<button style={{ background: "linear-gradient(...)" }}>Start trial</button>`, flag: "violation" },
        { role: "user", text: "Again — Button component, size=\"lg\". Don't invent new button styles.", flag: "correction" },
        { role: "agent", text: "Switched to the design system.", code: `<Button size="lg">Start trial</Button>` },
      ]},
      { id: "tr_6a44", agentId: "product-a-builder", project: "product-a", file: "billing/InvoiceRow.tsx", when: "3 days ago", lines: [
        { role: "agent", text: "Added a download action to each invoice.", code: `<button className="text-sm underline">Download</button>`, flag: "violation" },
        { role: "user", text: "Use <Button variant=\"link\">.", flag: "correction" },
      ]},
      { id: "tr_btn_04", agentId: "product-a-builder", project: "product-a", file: "settings/TeamForm.tsx", when: "4 days ago", lines: [
        { role: "agent", text: "Added an invite action.", code: `<button className="px-4 py-2">Invite member</button>`, flag: "violation" },
        { role: "user", text: "Use our Button component for the invite action too.", flag: "correction" },
        { role: "agent", text: "Replaced the custom button.", code: `<Button>Invite member</Button>` },
      ]},
      { id: "tr_btn_05", agentId: "product-a-reviewer", project: "product-a", file: "projects/DeleteDialog.tsx", when: "5 days ago", lines: [
        { role: "agent", text: "Added a red delete button.", code: `<button className="bg-red-600">Delete project</button>`, flag: "violation" },
        { role: "user", text: "Our Button already has a destructive variant. Use that.", flag: "correction" },
        { role: "agent", text: "Updated the destructive action.", code: `<Button variant="destructive">Delete project</Button>` },
      ]},
      { id: "tr_btn_06", agentId: "product-a-builder", project: "product-a", file: "search/EmptyResults.tsx", when: "Last week", lines: [
        { role: "agent", text: "Added a reset action to the empty state.", code: `<button className="border px-3 py-2">Reset filters</button>`, flag: "violation" },
        { role: "user", text: "Please use Button with the outline variant instead of styling another button.", flag: "correction" },
        { role: "agent", text: "Switched to the shared outline variant.", code: `<Button variant="outline">Reset filters</Button>` },
      ]},
      { id: "tr_btn_07", agentId: "product-a-reviewer", project: "product-a", file: "onboarding/Welcome.tsx", when: "Last week", lines: [
        { role: "agent", text: "Created the continue action.", code: `<button className="rounded px-6 py-3">Continue</button>`, flag: "violation" },
        { role: "user", text: "Keep the shared Button and use size lg for this step.", flag: "correction" },
        { role: "agent", text: "Used the existing large size.", code: `<Button size="lg">Continue</Button>` },
      ]},
      { id: "tr_btn_08", agentId: "product-a-builder", project: "product-a", file: "files/FileActions.tsx", when: "2 weeks ago", lines: [
        { role: "agent", text: "Added a secondary rename action.", code: `<button className="bg-gray-100 px-3 py-2">Rename</button>`, flag: "violation" },
        { role: "user", text: "Use the secondary Button variant. No custom button styles.", flag: "correction" },
        { role: "agent", text: "Reused the design system variant.", code: `<Button variant="secondary">Rename</Button>` },
      ]},
      { id: "tr_btn_09", agentId: "product-a-reviewer", project: "product-a", file: "notifications/NotificationRow.tsx", when: "2 weeks ago", lines: [
        { role: "agent", text: "Added a quiet dismiss action.", code: `<button className="text-sm">Dismiss</button>`, flag: "violation" },
        { role: "user", text: "Even quiet actions should use Button. Use the ghost variant here.", flag: "correction" },
        { role: "agent", text: "Replaced it with the shared component.", code: `<Button variant="ghost" size="sm">Dismiss</Button>` },
      ]},
    ],
  },
  {
    id: "spacing-tokens", category: "Tokens", ruleCategory: "Spacing",
    title: "Use spacing tokens instead of arbitrary pixel values.",
    summary: "Off-scale spacing values",
    rationale: "Arbitrary values like p-[13px] and mt-[22px] were replaced with the 4px scale in 8 corrections.",
    occurrences: 8, traces: 6, confidence: 0.81, scope: ["product-a"], agents: ["product-a-builder"],
    before: `<div className="p-[13px] mt-[22px]">`, after: `<div className="p-3 mt-6">`,
    proposedMarkdown: `When setting padding, margins, or gaps:

- Use the project's existing spacing tokens on its 4px scale, expressed through standard Tailwind spacing utilities.
- Replace arbitrary pixel values with the nearest appropriate scale step: \`p-[13px]\` → \`p-3\`, \`mt-[22px]\` → \`mt-6\`, and \`gap-[7px]\` → \`gap-2\`.
- Reuse the spacing of comparable layouts and components rather than introducing a one-off value.
- Do not add arbitrary spacing utilities or inline pixel spacing. Ask before making an exception when the existing scale cannot meet a layout requirement.

\`\`\`tsx
<div className="p-3 mt-6 flex gap-2">
  {children}
</div>
\`\`\``,
    evidence: [
      { id: "tr_5d12", agentId: "product-a-builder", project: "product-a", file: "layout/Sidebar.tsx", when: "Today", lines: [
        { role: "agent", text: "Tightened the sidebar padding.", code: `className="px-[13px] py-[9px]"`, flag: "violation" },
        { role: "user", text: "Stick to our spacing scale — px-3 py-2.", flag: "correction" },
      ]},
      { id: "tr_4b77", agentId: "product-a-builder", project: "product-a", file: "charts/Legend.tsx", when: "4 days ago", lines: [
        { role: "agent", text: "Added a gap between legend items.", code: `className="gap-[7px]"`, flag: "violation" },
        { role: "user", text: "No arbitrary values. gap-2.", flag: "correction" },
      ]},
      { id: "tr_space_03", agentId: "product-a-builder", project: "product-a", file: "settings/Section.tsx", when: "5 days ago", lines: [
        { role: "agent", text: "Added separation between sections.", code: `className="mt-[22px]"`, flag: "violation" },
        { role: "user", text: "Use mt-6 from our spacing scale.", flag: "correction" },
      ]},
      { id: "tr_space_04", agentId: "product-a-builder", project: "product-a", file: "projects/ProjectCard.tsx", when: "Last week", lines: [
        { role: "agent", text: "Adjusted the card padding.", code: `className="p-[13px]"`, flag: "violation" },
        { role: "user", text: "Keep card padding on the scale: p-3.", flag: "correction" },
      ]},
      { id: "tr_space_05", agentId: "product-a-builder", project: "product-a", file: "forms/FieldGroup.tsx", when: "Last week", lines: [
        { role: "agent", text: "Spaced the form fields.", code: `className="space-y-[15px]"`, flag: "violation" },
        { role: "user", text: "Use space-y-4 instead of a custom pixel value.", flag: "correction" },
      ]},
      { id: "tr_space_06", agentId: "product-a-builder", project: "product-a", file: "layout/PageHeader.tsx", when: "2 weeks ago", lines: [
        { role: "agent", text: "Added space beneath the page title.", code: `className="mb-[19px]"`, flag: "violation" },
        { role: "user", text: "Use mb-5 so this stays on our 4px scale.", flag: "correction" },
      ]},
    ],
  },
  {
    id: "sentence-case", category: "Voice & copy", ruleCategory: "Voice and copy",
    title: "Write UI labels in sentence case.",
    summary: "Title case in UI labels",
    rationale: "Title Case labels (\"Create New Project\") were rewritten to sentence case in 6 sessions.",
    occurrences: 6, traces: 5, confidence: 0.72, scope: ["product-a"], agents: ["product-a-reviewer"],
    before: `"Create New Project"`, after: `"Create new project"`,
    proposedMarkdown: `When writing or updating visible UI labels, including buttons, navigation links, and form actions:

- Capitalize the first word and keep subsequent words lowercase unless they are proper nouns or acronyms.
- Preserve the established capitalization of product names, people, and acronyms such as API.
- Apply the same casing to labels in every state of an action, including loading and disabled states.
- Do not capitalize every word or change code identifiers to match visible label casing.

Examples:

- \`Create New Project\` → \`Create new project\`
- \`Save Account Settings\` → \`Save account settings\`
- \`Manage API Keys\` → \`Manage API keys\``,
    evidence: [
      { id: "tr_3e90", agentId: "product-a-reviewer", project: "product-a", file: "nav/Header.tsx", when: "Last week", lines: [
        { role: "agent", text: "Added the nav link.", code: `<Link>Get Started Today</Link>`, flag: "violation" },
        { role: "user", text: "Sentence case for labels, please: \"Get started today\".", flag: "correction" },
      ]},
      { id: "tr_copy_02", agentId: "product-a-reviewer", project: "product-a", file: "projects/NewProject.tsx", when: "Last week", lines: [
        { role: "agent", text: "Updated the primary label.", code: `"Create New Project"`, flag: "violation" },
        { role: "user", text: "Use sentence case: Create new project.", flag: "correction" },
      ]},
      { id: "tr_copy_03", agentId: "product-a-reviewer", project: "product-a", file: "settings/Account.tsx", when: "2 weeks ago", lines: [
        { role: "agent", text: "Added the account action.", code: `"Save Account Settings"`, flag: "violation" },
        { role: "user", text: "Sentence case please: Save account settings.", flag: "correction" },
      ]},
      { id: "tr_copy_04", agentId: "product-a-reviewer", project: "product-a", file: "search/Filters.tsx", when: "2 weeks ago", lines: [
        { role: "agent", text: "Named the filter action.", code: `"Clear All Filters"`, flag: "violation" },
        { role: "user", text: "Keep labels in sentence case: Clear all filters.", flag: "correction" },
      ]},
      { id: "tr_copy_05", agentId: "product-a-reviewer", project: "product-a", file: "team/InviteDialog.tsx", when: "3 weeks ago", lines: [
        { role: "agent", text: "Added the invitation heading.", code: `"Invite Team Members"`, flag: "violation" },
        { role: "user", text: "Use Invite team members, not title case.", flag: "correction" },
      ]},
    ],
  },
];

/** Plain-language strength label shown instead of a raw percentage. */
export function patternStrength(confidence: number) { return confidence >= 0.85 ? "Strong pattern" : "Emerging pattern"; }
export function patternStrengthReason(s: Pick<Suggestion, "confidence" | "occurrences" | "traces">) {
  return s.confidence >= 0.85
    ? `You made this same fix ${s.occurrences} times across ${s.traces} sessions, almost always the same way. It's ready to become a rule.`
    : `You made this fix ${s.occurrences} times across ${s.traces} sessions, but not always the same way. Worth reviewing before it becomes a rule.`;
}

export type SuggestionStatus = "pending" | "accepted" | "dismissed";
/** Inbox list: matches the chosen status tab and a case-insensitive search over title, category and rationale. */
export function filterSuggestions(list: Suggestion[], statuses: Record<string, SuggestionStatus>, tab: SuggestionStatus, query: string, category: RuleCategory | "All" = "All") {
  const q = query.trim().toLowerCase();
  return list.filter((s) => (statuses[s.id] ?? "pending") === tab
    && (category === "All" || s.ruleCategory === category)
    && (!q || [s.title, s.category, s.rationale].some((t) => t.toLowerCase().includes(q))));
}
