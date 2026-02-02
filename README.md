# ReviewBot — AI Code Review Agent

An AI-powered GitHub PR code review agent built with CopilotKit and LangGraph. Paste a PR URL and get a thorough review with rich, generative UI components.

## Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, CopilotKit
- **Backend**: Python, LangGraph, OpenAI GPT-4o
- **APIs**: GitHub REST API

## Features

- **10 generative UI components** — the agent composes different UIs per PR:
  - PR metadata card, review summary, collapsible file tree, inline diff viewer, finding cards, security alerts, suggestion diffs, complexity chart, interactive checklist, comment threads
- **2 human-in-the-loop tools** — action dialog (post review / create issue / dismiss), file focus selector for large PRs
- **4 loading renderers** — visual feedback for fetch, analyze, post review, and create issue operations
- **Dark mode** — follows OS preference with CopilotKit theme integration
- **Adaptive review** — uses different tool combinations based on PR size (small/medium/large)

## Setup

### Prerequisites

- Node.js 20+ / Bun
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager

### Environment Variables

Create `.env` at the project root:

```
GITHUB_TOKEN=ghp_...
OPENAI_API_KEY=sk-...
```

### Install & Run

**Backend:**

```bash
cd server
uv sync
uv run langgraph dev --port 8123 --no-browser
```

**Frontend:**

```bash
cd client
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a GitHub PR URL.

## Architecture

```
User → CopilotChat → /api/copilotkit → LangGraph Agent (localhost:8123)
                                              │
                                  ┌───────────┼───────────┐
                                  ▼           ▼           ▼
                            fetch_pr_diff  analyze_diff  post/create
                            (GitHub API)   (GPT-4o)      (GitHub API)
                                  │
                                  ▼
                          Frontend Tools (render_*)
                          → React components in chat
```

The agent fetches PR data from GitHub, analyzes the diff with GPT-4o, then uses frontend tools to render rich UI components directly in the chat. The system prompt guides tool selection based on PR characteristics.
