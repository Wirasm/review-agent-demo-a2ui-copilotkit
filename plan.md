# Code Review Agent Demo — Implementation Plan

## Stack

| Concern              | Choice                                     | Version                  |
| -------------------- | ------------------------------------------ | ------------------------ |
| Frontend             | Next.js + CopilotKit + Tailwind            | 16.1.6 / 1.51.3 / 4.1.18 |
| Backend              | Python + LangGraph + CopilotKit Python SDK | 3.12 / 1.0.7 / 0.1.77    |
| Package mgr (JS)     | bun                                        | —                        |
| Package mgr (Python) | UV                                         | —                        |
| LLM                  | OpenAI GPT-4o                              | openai 2.16.0            |
| GitHub auth          | Personal Access Token                      | —                        |
| Agent serving        | `langgraph dev` (inmem server, port 8123)  | langgraph-cli 0.4.12     |
| Transport            | AG-UI (implicit via CopilotKit)            | —                        |

## Project Structure

```
review-agent-demo-a2ui-copilotkit/
├── .gitignore
├── .env                              # OPENAI_API_KEY, GITHUB_TOKEN
├── agentic-ui-stack.md               # (already exists)
├── server/
│   ├── pyproject.toml
│   ├── .python-version               # 3.12
│   ├── langgraph.json                # LangGraph CLI config
│   ├── review_agent/
│   │   ├── __init__.py
│   │   ├── graph.py                  # LangGraph StateGraph definition
│   │   ├── state.py                  # AgentState TypedDict
│   │   ├── tools.py                  # GitHub API tools + OpenAI analysis
│   │   └── prompts.py                # System prompt
│   └── .env                          # Symlink or copy of root .env
├── client/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── .env.local                    # LANGGRAPH_DEPLOYMENT_URL
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # CopilotKit provider
│   │   │   ├── page.tsx              # Chat UI + all hook registrations
│   │   │   ├── globals.css           # Tailwind import
│   │   │   └── api/
│   │   │       └── copilotkit/
│   │   │           └── route.ts      # CopilotKit runtime → LangGraph
│   │   ├── components/
│   │   │   ├── review-summary.tsx    # PR overview card
│   │   │   ├── finding-card.tsx      # Individual finding card
│   │   │   └── action-dialog.tsx     # HITL approval dialog
│   │   └── lib/
│   │       └── types.ts              # Shared TypeScript types
│   └── bun.lockb
└── README.md
```

## Pinned Dependencies

### Python (`server/pyproject.toml`)

```toml
[project]
name = "review-agent"
version = "0.1.0"
requires-python = ">=3.10,<3.13"
dependencies = [
    "copilotkit==0.1.77",
    "langgraph==1.0.7",
    "langchain-openai==1.1.7",
    "langsmith==0.6.7",
    "langgraph-cli[inmem]==0.4.12",
    "langgraph-api==0.7.13",
    "httpx==0.28.1",
    "python-dotenv==1.2.1",
    "openai==2.16.0",
]
```

### JavaScript (`client/package.json`)

```json
{
  "dependencies": {
    "@copilotkit/react-core": "1.51.3",
    "@copilotkit/react-ui": "1.51.3",
    "@copilotkit/runtime": "1.51.3",
    "next": "16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.1.18",
    "tailwindcss": "4.1.18",
    "typescript": "5.9.3",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

## Environment Variables

Root `.env` (shared):

```
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=ghp_...
```

`client/.env.local`:

```
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8123
LANGSMITH_API_KEY=
```

`server/.env` — copy of root `.env`

## Implementation Steps

### Phase 1: Scaffolding

1. **Init git repo** at project root
2. **Create `.gitignore`** — node_modules, .next, .env, .env.local, **pycache**, .venv, \*.pyc
3. **Create root `.env`** — placeholder for OPENAI_API_KEY and GITHUB_TOKEN

### Phase 2: Python Server

4. **Create `server/pyproject.toml`** — with pinned deps above
5. **Create `server/.python-version`** — `3.12`
6. **Create `server/langgraph.json`**

   ```json
   {
     "python_version": "3.12",
     "dependencies": ["."],
     "package_manager": "uv",
     "graphs": {
       "review_agent": "./review_agent/graph.py:graph"
     },
     "env": ".env"
   }
   ```

7. **Create `server/review_agent/state.py`** — Agent state

   ```python
   class AgentState(CopilotKitState):
       pr_url: str
       pr_title: str
       pr_author: str
       findings: list[dict]
       summary: str
   ```

8. **Create `server/review_agent/prompts.py`** — System prompt
   - Senior code reviewer persona
   - Workflow: fetch PR → analyze → render findings via frontend tools → ask user for action → execute
   - Explicit frontend tool names: `render_review_summary`, `render_finding`, `request_review_action`

9. **Create `server/review_agent/tools.py`** — Four backend tools
   - `fetch_pr_diff(pr_url: str) -> str` — GitHub API for PR metadata + diff (truncated to 30k chars)
   - `analyze_diff(pr_title: str, diff: str) -> str` — GPT-4o structured analysis → JSON findings
   - `post_github_review(pr_url: str, review_body: str) -> str` — POST review to PR
   - `create_github_issue(repo_url: str, title: str, body: str) -> str` — Create issue
   - Uses `httpx` + `GITHUB_TOKEN`, `openai` client for analysis

10. **Create `server/review_agent/graph.py`** — LangGraph StateGraph
    - `StateGraph(AgentState)` with `CopilotKitMiddleware`
    - `chat_node` — binds all tools (backend + frontend from CopilotKit state), invokes model
    - `tool_node` — `ToolNode` for execution
    - Edges: `chat_node` → `tool_node` (if tool call) or `END`; `tool_node` → `chat_node`
    - Exports compiled `graph`

11. **Run `uv sync`** in `server/`

### Phase 3: Next.js Client

12. **Scaffold Next.js** in `client/` via `bunx create-next-app`
13. **Install CopilotKit**: `bun add @copilotkit/react-core@1.51.3 @copilotkit/react-ui@1.51.3 @copilotkit/runtime@1.51.3`

14. **Create `client/src/lib/types.ts`**

    ```typescript
    export type Severity = "critical" | "warning" | "info" | "suggestion";
    export type Finding = {
      severity: Severity;
      file: string;
      line: number;
      title: string;
      description: string;
      code_snippet: string;
      suggestion: string;
    };
    ```

15. **Create `client/src/app/api/copilotkit/route.ts`**
    - `CopilotRuntime` with `LangGraphAgent` → `http://localhost:8123`
    - `ExperimentalEmptyAdapter` (agent handles LLM calls)
    - Graph ID: `review_agent`

16. **Create `client/src/app/layout.tsx`**
    - `<CopilotKit runtimeUrl="/api/copilotkit" agent="review_agent">`
    - Import `@copilotkit/react-ui/styles.css`

17. **Create `client/src/components/review-summary.tsx`**
    - Props: prTitle, prAuthor, criticalCount, warningCount, infoCount, suggestionCount, summary
    - Styled card with colored severity badges

18. **Create `client/src/components/finding-card.tsx`**
    - Props: severity, file, line, title, description, codeSnippet, suggestion
    - Severity badge, file path, code `<pre>` block, suggestion box

19. **Create `client/src/components/action-dialog.tsx`**
    - Props: args, status, respond
    - Buttons: "Post Review", "Create Issue", "Dismiss"

20. **Create `client/src/app/page.tsx`** — Central wiring
    - `useFrontendTool("render_review_summary")` → `<ReviewSummary>`
    - `useFrontendTool("render_finding")` → `<FindingCard>`
    - `useHumanInTheLoop("request_review_action")` → `<ActionDialog>`
    - `useRenderToolCall("fetch_pr_diff")` → loading state
    - `useRenderToolCall("analyze_diff")` → analyzing state
    - `<CopilotChat>` with title and suggestions

21. **Create `client/src/app/globals.css`** — `@import "tailwindcss";`

### Phase 4: Integration

22. **Create `client/.env.local`** — `LANGGRAPH_DEPLOYMENT_URL=http://localhost:8123`
23. **Copy root `.env` to `server/.env`**
24. **Test full flow**

## How to Run

```bash
# Terminal 1: Python agent
cd server && uv run langgraph dev --port 8123 --no-browser

# Terminal 2: Next.js client
cd client && bun dev
```

Open http://localhost:3000

## Agent Workflow

```
User: "Review https://github.com/owner/repo/pull/123"
  │
  ▼
[fetch_pr_diff] → GitHub API → PR metadata + diff
  │
  ▼
[analyze_diff] → GPT-4o → structured findings JSON
  │
  ▼
[render_review_summary] → frontend tool → summary card in chat
  │
  ▼
[render_finding] × N → frontend tool → finding cards in chat
  │
  ▼
[request_review_action] → HITL tool → action buttons
  │
  ▼
User clicks "Post Review" / "Create Issue" / "Dismiss"
  │
  ▼
[post_github_review] or [create_github_issue] → GitHub API
  │
  ▼
Agent confirms completion
```

## Verification

1. `cd server && uv run langgraph dev --port 8123 --no-browser` — starts without errors
2. `cd client && bun dev` — compiles on port 3000
3. Open http://localhost:3000 — CopilotChat with initial message
4. Paste a real PR URL — agent should:
   - Show "Fetching PR data..." indicator
   - Show "Analyzing code changes..." indicator
   - Render summary card with severity counts
   - Render individual finding cards with code snippets
   - Show action dialog with Post Review / Create Issue / Dismiss
5. Click "Post Review" — posts to GitHub, confirms success
