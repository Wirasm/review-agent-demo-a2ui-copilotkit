# The Agentic UI Stack: CopilotKit, AG-UI & A2UI

## Overview

Three technologies form the emerging standard for connecting AI agents to user interfaces. They are **distinct but complementary layers**, each owning one concern:

| Layer | Technology | Creator | Role |
|-------|-----------|---------|------|
| UI Specification | **A2UI** | Google | Declarative JSON describing *what* UI to render |
| Transport Protocol | **AG-UI** | CopilotKit | Event stream defining *how* agent and frontend communicate |
| Application Framework | **CopilotKit** | CopilotKit | React SDK + runtime that *implements* both protocols |

**Analogy**: A2UI is like HTML (content), AG-UI is like HTTP (transport), CopilotKit is like a browser (rendering engine).

### Where They Sit in the Full Protocol Landscape

```
┌──────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                    │
│              CopilotKit (React framework)             │
├──────────────────────────────────────────────────────┤
│                  CONTENT LAYER                        │
│         A2UI (declarative UI specification)           │
├──────────────────────────────────────────────────────┤
│                 TRANSPORT LAYER                       │
│        AG-UI (agent ↔ frontend event stream)          │
├──────────────────────────────────────────────────────┤
│                   TOOL LAYER                          │
│         MCP (agent ↔ tools, by Anthropic)             │
├──────────────────────────────────────────────────────┤
│              ORCHESTRATION LAYER                      │
│       A2A (agent ↔ agent coordination, by Google)     │
└──────────────────────────────────────────────────────┘
```

---

## A2UI (Agent-to-User Interface)

### What It Is

A2UI is Google's open declarative UI specification (v0.8 Public Preview, Apache 2 licensed) for agent-driven interfaces. Agents generate structured JSON that describes UI components. The client renders them natively. No executable code crosses the boundary.

**Design principle**: "Safe like data, but expressive like code."

**Used in production** at Google (Opal, Gemini Enterprise, Flutter GenUI SDK).

### Architecture: Three Separation Layers

```
┌─────────────────────┐
│   UI Structure       │  Component definitions (Button, Card, Text, etc.)
├─────────────────────┤
│   Application State  │  Data model (paths like /user/name)
├─────────────────────┤
│   Client Rendering   │  Platform-native implementation (React, Flutter, etc.)
└─────────────────────┘
```

The key insight is **separating structure from state from rendering**. The agent defines components and data independently; the client binds them together at render time.

### Message Types (Server → Client)

A2UI defines four message types sent from agent to client:

#### `surfaceUpdate`

Delivers component definitions as a flat list. Components reference each other by string IDs (adjacency list, not nested tree — easier for LLMs to stream).

```json
{
  "surfaceUpdate": {
    "surfaceId": "review-dashboard",
    "components": [
      {
        "id": "header",
        "component": {
          "Text": {
            "text": { "literalString": "Code Review Results" },
            "usageHint": "h1"
          }
        }
      },
      {
        "id": "findings-list",
        "component": {
          "List": {
            "items": ["finding-1", "finding-2"],
            "separator": true
          }
        }
      },
      {
        "id": "finding-1",
        "component": {
          "Card": {
            "title": { "path": "/findings/0/title" },
            "subtitle": { "path": "/findings/0/severity" },
            "contents": ["finding-1-desc"]
          }
        }
      }
    ]
  }
}
```

#### `dataModelUpdate`

Modifies state independently from structure. Components bind to data via paths.

```json
{
  "dataModelUpdate": {
    "surfaceId": "review-dashboard",
    "contents": [
      {
        "key": "findings",
        "valueList": [
          {
            "valueMap": [
              { "key": "title", "valueString": "SQL Injection in query builder" },
              { "key": "severity", "valueString": "critical" },
              { "key": "file", "valueString": "src/db/query.ts" },
              { "key": "line", "valueInt": 42 }
            ]
          }
        ]
      }
    ]
  }
}
```

#### `beginRendering`

Signals the client to start rendering a surface. Prevents displaying incomplete UI.

```json
{
  "beginRendering": {
    "surfaceId": "review-dashboard",
    "root": "header",
    "styles": { "maxWidth": "800px" }
  }
}
```

#### `deleteSurface`

Removes a UI region and all its contents.

```json
{
  "deleteSurface": {
    "surfaceId": "review-dashboard"
  }
}
```

### Data Binding

Values in components are either static literals or references into the data model:

```json
{ "literalString": "Hello" }
{ "literalNumber": 42 }
{ "literalBoolean": true }
{ "path": "/user/name" }
```

Path-based binding means the agent can update data without resending the entire UI, and the UI re-renders reactively.

### Component Catalog

Agents select from pre-approved, trusted components only. The v0.8 catalog includes:

| Component | Purpose |
|-----------|---------|
| `Text` | Text display with usage hints (h1, h2, body, caption) |
| `Button` | Clickable action trigger with optional icon |
| `Card` | Container with title, subtitle, contents |
| `Column` | Vertical layout container |
| `Row` | Horizontal layout container |
| `List` | Ordered/unordered item list |
| `Tabs` | Tabbed content switching |
| `Modal` | Overlay dialog |
| `TextField` | Text input field |
| `CheckBox` | Boolean toggle |
| `Slider` | Numeric range input |
| `Icon` | Material icon display |
| `MultipleChoice` | Radio/checkbox group |
| `DateTimeInput` | Date and time picker |

### Security Model

- Declarative data format only — agents cannot inject arbitrary HTML/JS
- Client maintains exclusive control over rendering and styling
- Component catalog approach limits the agent's UI vocabulary
- Messages transmit safely across untrusted organizational boundaries
- Cross-platform portable: single JSON response works on web, mobile, desktop

---

## AG-UI (Agent-User Interaction Protocol)

### What It Is

AG-UI is an open, lightweight, event-based protocol that standardizes real-time bidirectional communication between AI agents and user-facing applications. Created by CopilotKit in partnership with LangGraph and CrewAI (late 2025). MIT licensed, 11.6k GitHub stars.

**Adopted by**: Microsoft Agent Framework, Google ADK, AWS Strands, Pydantic AI, LlamaIndex, Vercel AI SDK, Oracle Open Agent Spec, and others.

### Why It Exists

Traditional request-response APIs cannot accommodate modern AI agents because agents are:

- **Long-running** — a single task may take seconds to minutes
- **Nondeterministic** — streaming intermediate work across multi-turn sessions
- **Stateful** — maintaining shared context between frontend and backend
- **Asynchronous** — handling multiple queries, cancellations, and resumptions

AG-UI solves this with a single ordered stream of typed events.

### Core Abstraction

```
run(input: RunAgentInput) → Observable<BaseEvent>
```

All communication is a stream of JSON-encoded events flowing over any transport.

### Transport Layer

AG-UI is transport-agnostic:

| Transport | Use Case |
|-----------|----------|
| **SSE (Server-Sent Events)** | Primary reference implementation. Text-based, debuggable, built-in reconnection |
| **WebSocket** | Full-duplex, lower latency for frequent bidirectional updates |
| **HTTP** | Standard POST with streaming response |
| **Binary (protobuf)** | High-performance, space-efficient serialization |
| **Webhooks** | Asynchronous server-initiated callbacks |

### Event System

All events share a base structure:

```json
{
  "type": "EVENT_TYPE",
  "timestamp": "2025-12-15T10:30:00Z",
  "rawEvent": null
}
```

AG-UI defines **16 event types** organized into 5 categories:

#### 1. Lifecycle Events

Track agent run progression.

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `RunStarted` | Initiates execution | `runId`, `threadId`, `parentRunId?`, `input?` |
| `RunFinished` | Successful completion | `result?` |
| `RunError` | Failure termination | `message`, `code?` |
| `StepStarted` | Begins sub-task | `stepName` |
| `StepFinished` | Completes sub-task | — |

**Flow**: `RunStarted → (StepStarted → StepFinished)* → RunFinished | RunError`

#### 2. Text Message Events

Token-by-token streaming using the start-content-end pattern.

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `TextMessageStart` | Opens new message | `messageId`, `role` |
| `TextMessageContent` | Streams text chunks | `delta` |
| `TextMessageEnd` | Closes message | — |

**Roles**: `"developer"`, `"system"`, `"assistant"`, `"user"`, `"tool"`

**Flow**: `TextMessageStart → TextMessageContent* → TextMessageEnd`

Convenience event `TextMessageChunk` auto-expands into the full triad.

#### 3. Tool Call Events

Streaming pattern for agent tool invocations.

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `ToolCallStart` | Initiates invocation | `toolCallId`, `toolCallName`, `parentMessageId?` |
| `ToolCallArgs` | Streams argument chunks | `delta` (often JSON fragments) |
| `ToolCallEnd` | Completes argument transmission | — |
| `ToolCallResult` | Delivers output | `messageId`, `toolCallId`, `content` |

**Flow**: `ToolCallStart → ToolCallArgs* → ToolCallEnd → ToolCallResult`

Convenience event `ToolCallChunk` auto-expands similarly to text messages.

#### 4. State Management Events

Efficient state synchronization using the snapshot-delta pattern.

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `StateSnapshot` | Complete state for init/resync | Full state object |
| `StateDelta` | Incremental update | JSON Patch array (RFC 6902) |
| `MessagesSnapshot` | Full conversation history | Messages array |

**JSON Patch operations** (RFC 6902):

```json
{
  "type": "StateDelta",
  "delta": [
    { "op": "add", "path": "/tasks/0", "value": { "id": "1", "title": "Review PR" } },
    { "op": "replace", "path": "/status", "value": "analyzing" },
    { "op": "remove", "path": "/tempData" }
  ]
}
```

Supported ops: `add`, `replace`, `remove`, `move`, `copy`, `test`

#### 5. Special Events

| Event | Purpose | Key Fields |
|-------|---------|------------|
| `Raw` | Passthrough from external systems | `source?` |
| `Custom` | App-defined extensions | `name`, `value` |

### Streaming Patterns Summary

| Pattern | Used For | Mechanism |
|---------|----------|-----------|
| Start-Content-End | Text messages, tool calls | Stream chunks between open/close markers |
| Snapshot-Delta | State, activities | Full transfer followed by incremental patches |
| Lifecycle | Run monitoring | Paired start/finish with error fallback |

### SDKs

**TypeScript**:
```bash
npm install @ag-ui/core @ag-ui/client
```
- `@ag-ui/core` — typed data models, event types, runtime validation
- `@ag-ui/client` — `AbstractAgent`, `HttpAgent` implementations
- `@ag-ui/encoder` — event serialization
- `@ag-ui/proto` — protobuf definitions

**Python**:
```bash
pip install ag-ui-protocol
```
- `ag_ui.core` — event dataclasses, `RunAgentInput`, typed structures
- `ag_ui.encoder` — FastAPI integration utilities

**Community**: Kotlin, Golang, Dart, Java, Rust (official). .NET, Nim (in progress).

---

## CopilotKit

### What It Is

CopilotKit is an open-source React framework and platform for building agent-native applications. v1.50 (December 2025) rebuilt the entire project natively on AG-UI, removing GraphQL entirely in favor of a single-endpoint event-streaming architecture. 28.4k+ GitHub stars, MIT licensed.

### Architecture

```
┌──────────────────────────────────────────────┐
│           FRONTEND (React)                    │
│  Components: CopilotChat, Sidebar, Popup     │
│  Hooks: useAgent, useCopilotAction, etc.     │
├──────────────────────────────────────────────┤
│           RUNTIME (Node.js)                   │
│  CopilotRuntime: routing, adapters, agents   │
│  Endpoints: Next.js, Express, NestJS         │
├──────────────────────────────────────────────┤
│           PROTOCOL (AG-UI)                    │
│  Event streaming, state sync, tool calls     │
│  Adapters: LangGraph, CrewAI, ADK, etc.      │
└──────────────────────────────────────────────┘
```

### Frontend: Components

| Component | Purpose |
|-----------|---------|
| `<CopilotKit>` | Provider wrapping the app, configures runtime URL |
| `<CopilotChat>` | Full chat interface with message rendering, suggestions, image upload |
| `<CopilotSidebar>` | Persistent sidebar chat |
| `<CopilotPopup>` | Popup-based chat overlay |
| `<CopilotTextarea>` | AI-powered textarea with inline completions |

```tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";

function App() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <YourApp />
      <CopilotChat />
    </CopilotKit>
  );
}
```

### Frontend: Hooks

#### `useCopilotReadable` — Share app state with the agent (one-way: UI → agent)

```tsx
useCopilotReadable({
  description: "Current user information",
  value: { name: "Alice", role: "admin", currentPage: "/dashboard" },
});
```

#### `useCopilotAction` — Let agents execute frontend functions

```tsx
useCopilotAction({
  name: "updateTheme",
  description: "Updates the application theme",
  parameters: [
    { name: "theme", type: "string", description: "light or dark" }
  ],
  handler: async ({ theme }) => {
    setTheme(theme);
    return `Theme updated to ${theme}`;
  },
});
```

#### `useAgent` (v1.50) — Subscribe to AG-UI event stream with full control

```tsx
const { state, setState, messages, sendMessage, status } = useAgent({
  agentUrl: "/api/agent",
});
```

Supports connecting to multiple agents simultaneously. Agents can read or adopt each other's messages.

#### `useCoAgent` — Bidirectional state sync between UI and agent

```tsx
const { state, setState } = useCoAgent<AgentState>({
  name: "review_agent",
});

// Read agent state
console.log(state.currentStep);

// Write to agent state from UI
setState({ ...state, userPreference: "detailed" });
```

#### `useCoAgentStateRender` — Render agent's real-time state in chat

```tsx
useCoAgentStateRender({
  name: "review_agent",
  render: ({ state }) => (
    <ProgressCard step={state.currentStep} progress={state.progress} />
  ),
});
```

#### `useFrontendTool` — Tool-based generative UI with lifecycle rendering

```tsx
useFrontendTool({
  name: "search_papers",
  description: "Search for research papers",
  parameters: z.object({
    query: z.string(),
    year: z.number(),
  }),
  handler: async ({ query, year }) => {
    return await searchAPI(query, year);
  },
  render: ({ status, args, result }) => {
    if (status === "inProgress") return <SearchLoading query={args?.query} />;
    if (status === "complete") return <ResultsCard papers={JSON.parse(result)} />;
    return null;
  },
});
```

**Lifecycle states**: `inProgress` → `executing` → `complete` | `error`

#### `useLangGraphInterrupt` — Human-in-the-loop approval workflows

```tsx
useLangGraphInterrupt({
  name: "approval_required",
  render: ({ interrupt, onApprove, onCancel }) => (
    <ApprovalDialog
      action={interrupt.action}
      onApprove={() => onApprove({ approved: true })}
      onCancel={onCancel}
    />
  ),
});
```

### Runtime: CopilotRuntime

The backend orchestration layer. Responsibilities:

1. **Request routing** — directs to LLM providers or remote agents
2. **Service adapters** — OpenAI, Anthropic, Google, Groq
3. **Agent registration** — discovers agents via `/info` endpoint
4. **Event streaming** — SSE to frontends

```ts
// Next.js App Router
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";

const runtime = new CopilotRuntime();

export const POST = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  serviceAdapter: new OpenAIAdapter(),
});
```

**Framework endpoints**: Next.js (App Router + Pages Router), Express, NestJS.

### Agent Framework Support

CopilotKit connects to any agent framework via AG-UI:

| Framework | Integration |
|-----------|-------------|
| LangGraph | First-class, with `LangGraphAgent` class and interrupt support |
| CrewAI | Teams of agents with roles and goals |
| Google ADK | Agent Development Kit |
| Microsoft Agent Framework | Enterprise agents |
| Mastra | Agent framework integration |
| Pydantic AI | Type-safe agent development |
| AG2 (formerly AutoGen) | Multi-agent conversations |
| AWS Strands | Amazon's agent framework |

### Three Generative UI Patterns

CopilotKit supports three approaches to agent-generated UI:

| Pattern | Control | How It Works |
|---------|---------|-------------|
| **Static** (Tool-based) | Most constrained | Agent triggers pre-built React components via `useFrontendTool` |
| **Declarative** (A2UI) | Middle ground | Agent generates structured JSON, client renders from spec |
| **Open-ended** | Least constrained | Agent generates freeform HTML/iframes |

---

## How They Work Together

### End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  USER                                                       │
│  Types: "Review PR #123 for security issues"                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  COPILOTKIT FRONTEND (React)                                │
│  1. CopilotChat captures user input                         │
│  2. useAgent sends message to runtime                       │
│  3. Subscribes to AG-UI event stream                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/copilotkit
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  COPILOTKIT RUNTIME                                         │
│  1. Routes request to registered agent                      │
│  2. Converts to agent framework format                      │
│  3. Establishes SSE stream back to frontend                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ AG-UI events (SSE)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENT (Python/TypeScript)                                  │
│                                                             │
│  Emits AG-UI events:                                        │
│                                                             │
│  ① RunStarted { runId, threadId }                           │
│  ② TextMessageStart { messageId, role: "assistant" }        │
│  ③ TextMessageContent { delta: "Analyzing PR..." }          │
│  ④ ToolCallStart { toolCallName: "fetch_pr_diff" }          │
│  ⑤ ToolCallArgs { delta: '{"pr_url":"..."}' }               │
│  ⑥ ToolCallEnd                                              │
│  ⑦ ToolCallResult { content: "<diff data>" }                │
│  ⑧ StateDelta { delta: [                                    │
│       { op: "replace", path: "/status", value: "reviewing" }│
│     ]}                                                      │
│  ⑨ TextMessageContent { delta: "<A2UI JSON payload>" }      │
│  ⑩ TextMessageEnd                                           │
│  ⑪ RunFinished                                              │
│                                                             │
│  The A2UI JSON in step ⑨ contains:                          │
│  - surfaceUpdate (component definitions)                    │
│  - dataModelUpdate (findings data)                          │
│  - beginRendering (signal to render)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ Events stream back
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  COPILOTKIT FRONTEND                                        │
│  1. Streams text tokens into chat bubbles                   │
│  2. Shows tool call progress (ToolCallStart → ToolCallEnd)  │
│  3. Applies state deltas to shared state                    │
│  4. Parses A2UI JSON → renders interactive dashboard        │
│  5. User clicks "Post Review" button in rendered A2UI       │
│  6. User action sent back to agent via AG-UI                │
└─────────────────────────────────────────────────────────────┘
```

### State Synchronization Flow

```
        Agent                              Frontend
          │                                    │
          │── StateSnapshot ──────────────────▶│  (full state on init)
          │                                    │
          │── StateDelta ─────────────────────▶│  (incremental JSON Patch)
          │   [{ op: "add", path: "/tasks/0",  │
          │      value: { title: "..." } }]    │
          │                                    │
          │◀── setState({ preference: ... }) ──│  (UI writes to agent state)
          │                                    │
          │── StateDelta ─────────────────────▶│  (agent reacts, sends update)
          │                                    │
```

### A2UI Inside AG-UI

A2UI payloads travel as content within AG-UI text message events or custom events:

```
AG-UI Event Stream:
  ┌─────────────────────────────┐
  │ TextMessageStart            │
  ├─────────────────────────────┤
  │ TextMessageContent          │  ← "Here are the review findings:"
  ├─────────────────────────────┤
  │ TextMessageContent          │  ← A2UI JSON: { surfaceUpdate: {...} }
  ├─────────────────────────────┤
  │ TextMessageContent          │  ← A2UI JSON: { dataModelUpdate: {...} }
  ├─────────────────────────────┤
  │ TextMessageContent          │  ← A2UI JSON: { beginRendering: {...} }
  ├─────────────────────────────┤
  │ TextMessageEnd              │
  └─────────────────────────────┘
```

The CopilotKit frontend (or any AG-UI client) detects the A2UI JSON in the message content and renders it as interactive UI components instead of plain text.

---

## Key Design Decisions

### Why Flat Component Lists (A2UI)?

A2UI uses adjacency lists instead of nested trees:

```json
// Adjacency list (A2UI approach) — LLM-friendly
[
  { "id": "root", "component": { "Column": { "children": ["header", "body"] } } },
  { "id": "header", "component": { "Text": { "text": { "literalString": "Title" } } } },
  { "id": "body", "component": { "Text": { "text": { "path": "/content" } } } }
]
```

Benefits:
- LLMs can generate components one at a time without tracking nesting depth
- Streaming-friendly — each component is independently valid JSON
- Error-resilient — a malformed component doesn't corrupt the tree
- Easy incremental updates — replace a single component by ID

### Why JSON Patch for State (AG-UI)?

Instead of resending full state on every change, AG-UI uses RFC 6902 JSON Patch:

```json
// Full state: { tasks: [{ id: 1, done: false }, { id: 2, done: false }], count: 2 }
// To mark task 1 as done, send:
[{ "op": "replace", "path": "/tasks/0/done", "value": true }]
// Instead of resending the entire state object
```

Benefits:
- Bandwidth efficient for large state objects
- Atomic operations (all or none)
- Standard specification with wide library support
- Enables real-time collaboration semantics

### Why Event Streaming (AG-UI)?

Instead of request-response or polling:

- Agents are long-running — events stream results as they happen
- Token-by-token rendering gives immediate user feedback
- Tool calls can show progress while executing
- State updates arrive incrementally, not in batches
- Connection stays open for the duration of the agent run

---

## Comparison with Related Protocols

| Protocol | Owner | Purpose | Relationship |
|----------|-------|---------|-------------|
| **AG-UI** | CopilotKit | Agent ↔ Frontend transport | The communication pipe |
| **A2UI** | Google | Declarative UI specification | Payload carried by AG-UI |
| **MCP** | Anthropic | Agent ↔ Tools connection | Complementary (tools layer) |
| **A2A** | Google | Agent ↔ Agent coordination | Complementary (orchestration layer) |
| **Open-JSON-UI** | Community | Alternative declarative UI spec | Alternative to A2UI |
| **MCP Apps** | Community | UI via MCP tools | Alternative approach |

These are not competing — production systems typically combine multiple protocols. AG-UI for transport, A2UI for UI specification, MCP for tools, A2A for multi-agent coordination.

---

## References

### Official Documentation
- [A2UI Specification](https://a2ui.org/) — Google's declarative UI spec
- [AG-UI Protocol](https://docs.ag-ui.com/) — Event-based transport protocol
- [CopilotKit Docs](https://docs.copilotkit.ai/) — Framework documentation
- [CopilotKit v1.50 Release Notes](https://docs.copilotkit.ai/whats-new/v1-50)

### GitHub Repositories
- [AG-UI Protocol](https://github.com/ag-ui-protocol/ag-ui) — Protocol spec and SDKs
- [CopilotKit](https://github.com/copilotkit/copilotkit) — Framework source
- [Google A2UI](https://github.com/google/A2UI) — A2UI specification
- [CopilotKit Generative UI Examples](https://github.com/copilotkit/generative-ui) — AG-UI, A2UI, MCP Apps examples

### Key Blog Posts
- [AG-UI and A2UI Explained](https://www.copilotkit.ai/blog/ag-ui-and-a2ui-explained-how-the-emerging-agentic-stack-fits-together) — How the stack fits together
- [Introducing AG-UI](https://www.copilotkit.ai/blog/introducing-ag-ui-the-protocol-where-agents-meet-users) — Origin story
- [Google Developers Blog: Introducing A2UI](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/) — A2UI announcement
- [The State of Agentic UI](https://www.copilotkit.ai/blog/the-state-of-agentic-ui-comparing-ag-ui-mcp-ui-and-a2ui-protocols) — Protocol comparison

### Framework Integrations
- [Microsoft Agent Framework + AG-UI](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/)
- [Pydantic AI + AG-UI](https://ai.pydantic.dev/ui/ag-ui/)
- [Google ADK + AG-UI](https://google.github.io/adk-docs/tools/third-party/ag-ui/)
- [AG-UI Dojo](https://dojo.ag-ui.com/) — Interactive examples
