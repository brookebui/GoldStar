# Rule-level Share (lightweight first step)

Goal: turn one person's correction into a shared team standard. Start with a discreet Share action on an individual accepted rule; project/workspace rulebook sharing comes later.

## Where it appears
- Rules page inspector panel (Canvas and List rule details): small `Share` icon button in the rule header, next to the category/status pills.
- Proposed Rules detail panel: Share shows only after the rule is saved (lives in the "Rule saved" banner area), so unaccepted suggestions aren't shared as standards.

## Share modal (compact, dark, gold accents)
- Title: "Share rule" + subline "Align your team's agents on this rule so nobody has to correct it twice."
- Applies to: read-only list of projects receiving the rule (Global / project names, reusing the existing scope summary). Inactive rules say "Not attached to any project yet."
- Team link: read-only field + "Copy link" (links to the rule focused on the canvas). Labeled as a demo link since there are no accounts yet.
- Export for team: tabs `AGENTS.md` / `.cursorrules` / `Claude instructions`, each showing a formatted snippet of the rule's Markdown + scope, with "Copy". Shows "Copied" feedback.
- No teammate invites or avatars in this step.

## Later (not in this step)
- Project-level "Share rules" button in the Rules toolbar exporting a compiled project rulebook, with teammate avatar group.

## Technical details
- New `src/components/gs/ShareRuleDialog.tsx` (shadcn Dialog + Tabs) and pure `src/data/rule-export.ts` formatting each target from the shared accepted-rule markdown + scope resolver.
- Link = `/canvas?rule=<id>` using existing focus param; built from `window.location.origin` at click time.
- Tests: `rule-export.test.ts` — each format includes the rule markdown and correct project scope; Global lists all non-excluded projects; inactive rule reports no projects.
- Session-only, no backend; record in AGENTS.md.
