<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Anchor acceptance confirmation to the non-scrolling details section with a scoped Radix dialog portal; this keeps the blur and confirmation above that panel instead of inline or centered over the whole app.
- Store reusable proposed Markdown separately from suggestion titles and evidence rationale; display and accept the same saved content so detection summaries never become agent instructions by accident.
- Render proposed rules with react-markdown without raw HTML; keep unsaved editor changes local and commit to the session rule only on Save, so Cancel cannot affect acceptance.
- Inbox trace expansion reads complete example evidence collections from suggestion data; label them as examples so invented sessions cannot be mistaken for imported logs.
- Gold Star UI components live in `src/components/gs/`; mock data in `src/data/` until a backend exists — keeps UI swappable to real data later.
- App shell (sidebar nav) wraps `<Outlet />` in `__root.tsx`; each nav section is its own route file.
- Sidebar collapse state stays in AppShell for session-only continuity between tabs; initialize it consistently during SSR and hydration to avoid layout shifts.
- Rules views share one RulesSidebar with filter/search in root context, replacing any top toolbar so both views stay in sync.
- Rule Canvas uses React Flow with pure scope helpers and accepted rules/current scopes in root context; Inbox acceptance shares selected targets and markdown, and canvas edits update that session state immediately without backend persistence.
- Overview edges use a shared global-inheritance junction and project-local branches; selection spotlights rule-specific connections to avoid a multi-rule hairball.
- Rule Canvas shows only rule and project tiers (agents follow their project's rules and are not canvas targets); single-rule focus uses a centered rule above the project tier with direct rule-to-project paths, without the overview junction or duplicate spotlight edges, to keep the Inbox handoff clear.
- Place seeded canvas rules by scope and their index among scope peers, never by fixed dataset positions, so extra demo rules stay in their global or project tier.
- Canvas cards show a top connection dot only when something sits above them: global rules have none, local rules and projects keep theirs.
- The canvas inspector reports scope only (tier + projects that receive it); scope changes by dragging or cutting wires, never from the panel.
- Compile project and agent rulebooks and filters from the shared accepted-rule collection and current scope resolver; newly accepted Inbox rules must be included without separate canvas approval.
- Verification must be rule-specific; the existing example runs verify only the Button rule and must not imply adherence to other rules.
- Run verification (demo delivery from current scope, Followed from each run's check independently) lives at the bottom of the Rule Canvas side panel; /receipts redirects there. Example runs stay rule-specific and separate from agents, and acceptance never implies actual delivery.
- Share the generated brand avatar through StarAvatar and use a bundled sky image beneath React Flow; this keeps branding consistent and preserves map interactions without embedding reference screenshots.
- Agent work is attributed to its project: agent records carry no editable display name, and every surface labels an agent's work with the project it belongs to.
- Use global gs-* typography/foundation classes, Button selection variants, and Badge status variants across product screens; compact Canvas labels remain explicit exceptions for map density.
- Proposals is shelved from main navigation; retain its route, UI, and session-only decisions so it can be revisited without rebuilding.
- Inbox acceptance blocks projects with a conflicting convention (seeded Button/commerce case): they are disabled and excluded even under Global, so a rule never silently overrides an approved local convention; only projects with selected agents count as applied, and the confirmation links to that rule's canvas verification.
- Normal canvas entry shows the example hierarchy; explicit Inbox rule links hide examples and focus that accepted rule. Focused views retain disconnected excluded targets, link back to original correction evidence, and scope edits update Inbox confirmation to preserve one session-wide journey.
- Track new verification runs in root session state with rule-text and delivery snapshots; latest delivered run determines each project–rule star, while earned history survives deviations and scope edits. Seeded verification stays separate from newly accepted rules so acceptance never grants a star.
- Canvas Add project / Draft rule are session-only; new projects join the shared registry, drafted rules start inactive.
- Rules views share root scope and example visibility, filtering the same workspace rules so toggles and edits survive view switches.
- Rule share exports come from pure helpers in src/data/rule-export.ts so formats stay testable.
