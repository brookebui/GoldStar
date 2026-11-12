# ⭐ Gold Star

> **Keeping design consistent in an AI-driven world.**

As designers and engineers increasingly collaborate with AI coding agents, maintaining consistency across products becomes exponentially harder. **Gold Star** learns from agent traces, turning repeated design corrections into reusable rules that help teams maintain consistent design patterns, components, and conventions across projects.

**Less repetitive feedback. More consistent design. Better human–AI collaboration.**

---

> [!NOTE]  
> **Prototype & Proof-of-Concept Notice**  
> Gold Star is currently an interactive functional prototype. The client application demonstrates the complete product workflow—trace evidence extraction, rule proposition, canvas-based scope wiring, verification stars, and rule exports. The underlying persistent backend, live agent log telemetry ingestion, and continuous integration hooks are mock/session-based and planned for future implementation.

---

## 🌟 The Challenge

AI coding assistants are brilliant at writing code quickly, but they lack long-term memory across projects and repositories. Design teams find themselves:
- **Repeating the same corrections** in chat over and over (*"Don't use raw hex colors"*, *"Use our DS Button component"*, *"Follow our 8pt spacing grid"*).
- **Fragmenting design systems** when agents invent local workarounds instead of reusing established patterns.
- **Lacking governance** to see which agents and projects actually follow approved design rules.

## ✨ How Gold Star Works

```
  [ AI Agent Traces ] 
          │
          ▼
  [ Pattern Detection ] ──► Extracts repeated human corrections across sessions
          │
          ▼
  [ Proposed Rules Inbox ] ──► Review rationale, view trace evidence, accept or edit
          │
          ▼
  [ Constellations Canvas ] ──► Wire rules visually to Global or specific Projects
          │
          ▼
  [ Rule Export & Verification ] ──► Export to AGENTS.md / .cursorrules & track earned Stars
```

### 1. Proposed Rules Inbox
Gold Star analyzes agent transcripts and flags repeated manual corrections. Instead of getting lost in chat logs, they surface in an actionable Inbox showing:
- **Trace Evidence**: Real examples from agent sessions showing the mistake and the human correction.
- **Pattern Strength**: Frequency metrics indicating how widespread the inconsistency is.
- **Suggested Rule Markdown**: Pre-drafted, battle-tested guidelines ready for acceptance.

### 2. Constellations Canvas
A node-based visual workspace powered by React Flow:
- **Global Tier**: Rules attached to the Global junction automatically apply across the entire workspace.
- **Project Tier**: Local rules wire directly to individual target projects (e.g., Marketing Site, Web App, Checkout).
- **Conflict Prevention**: Built-in guardrails detect conflicting local conventions and prevent silent overrides.

### 3. Universal Rule Export & Sharing
Rules are only useful if agents actually read them. Gold Star provides one-click sharing and export into industry-standard agent configuration formats:
- `AGENTS.md` & `CLAUDE.md`
- `.cursorrules`
- System prompts & agent tool descriptions
- Direct Markdown copy

### 4. Verification & Star Tracking
Acceptance doesn't automatically mean adherence. Gold Star tracks rule verification runs:
- Verifies rule compliance independently per project.
- Projects earn lasting **Gold Stars** as they demonstrate verified adherence over time.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack SSR with Vite & Nitro)
- **UI Library**: [React 19](https://react.dev/) + [Radix UI](https://www.radix-ui.com/) primitives
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with OkLCH custom color tokens
- **Graph & Canvas**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library (20 test suites, 90+ tests)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later recommended
- **npm**: `v10.x` or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brookebui/GoldStar.git
   cd GoldStar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.

4. Run the automated test suite:
   ```bash
   npm run test
   ```

---

## 🗺️ Roadmap & Implementation Plan

To evolve this prototype into a production-ready design governance engine, the following infrastructure will be implemented:

- [ ] **Agent Log Connectors**: Real-time webhook and MCP integrations for Cursor, Claude Code, GitHub Copilot, and custom agent harnesses.
- [ ] **LLM Evaluation Engine**: Automated LLM-as-a-judge pipelines that evaluate agent PRs against active project rulebooks.
- [ ] **Persistence Layer**: Database schema (PostgreSQL / Supabase) for multi-tenant team workspaces, audit logs, and versioned rules.
- [ ] **Automated CI/CD Bot**: GitHub Action that lints incoming pull requests against the project's compiled Gold Star rulebook.
- [ ] **Figma & Token Sync**: Two-way synchronization between Figma Variables / Tokens Studio and Gold Star rules.

---

## 📄 License

MIT © [Brooke Bui](https://github.com/brookebui)
