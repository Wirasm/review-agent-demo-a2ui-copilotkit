"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import {
  useFrontendTool,
  useHumanInTheLoop,
  useRenderToolCall,
} from "@copilotkit/react-core";
import { ReviewSummary } from "@/components/review-summary";
import { FindingCard } from "@/components/finding-card";
import { ActionDialog } from "@/components/action-dialog";
import type { Severity } from "@/lib/types";

export default function Home() {
  // Frontend tool: render the PR review summary card
  useFrontendTool({
    name: "render_review_summary",
    description:
      "Display a summary card for the PR review with severity counts.",
    parameters: [
      { name: "prTitle", type: "string", description: "PR title", required: true },
      { name: "prAuthor", type: "string", description: "PR author", required: true },
      { name: "criticalCount", type: "number", description: "Number of critical findings", required: true },
      { name: "warningCount", type: "number", description: "Number of warning findings", required: true },
      { name: "infoCount", type: "number", description: "Number of info findings", required: true },
      { name: "suggestionCount", type: "number", description: "Number of suggestion findings", required: true },
      { name: "summary", type: "string", description: "Short summary of the review", required: true },
    ],
    handler: async (args) => {
      return args;
    },
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <ReviewSummary
            prTitle={args.prTitle as string}
            prAuthor={args.prAuthor as string}
            criticalCount={args.criticalCount as number}
            warningCount={args.warningCount as number}
            infoCount={args.infoCount as number}
            suggestionCount={args.suggestionCount as number}
            summary={args.summary as string}
          />
        );
      }
      return <></>;
    },
  });

  // Frontend tool: render an individual finding card
  useFrontendTool({
    name: "render_finding",
    description:
      "Display a finding card with severity, file, description, code snippet, and suggestion.",
    parameters: [
      { name: "severity", type: "string", description: "critical, warning, info, or suggestion", required: true },
      { name: "file", type: "string", description: "File path", required: true },
      { name: "line", type: "number", description: "Line number", required: true },
      { name: "title", type: "string", description: "Finding title", required: true },
      { name: "description", type: "string", description: "Detailed description", required: true },
      { name: "code_snippet", type: "string", description: "Relevant code snippet", required: true },
      { name: "suggestion", type: "string", description: "Improvement suggestion", required: true },
    ],
    handler: async (args) => {
      return args;
    },
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <FindingCard
            severity={args.severity as Severity}
            file={args.file as string}
            line={args.line as number}
            title={args.title as string}
            description={args.description as string}
            codeSnippet={args.code_snippet as string}
            suggestion={args.suggestion as string}
          />
        );
      }
      return <></>;
    },
  });

  // HITL: ask the user what action to take after review
  useHumanInTheLoop({
    name: "request_review_action",
    description:
      "Ask the user whether to post a review, create an issue, or dismiss.",
    parameters: [
      { name: "pr_url", type: "string", description: "The PR URL being reviewed" },
      { name: "summary", type: "string", description: "Brief summary of findings" },
    ],
    render: ({ args, status, respond }) => (
      <ActionDialog
        args={args}
        status={status}
        respond={respond}
      />
    ),
  });

  // Render backend tool calls with loading states
  useRenderToolCall({
    name: "fetch_pr_diff",
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            Fetching PR data from GitHub...
          </div>
        );
      }
      return <></>;
    },
  });

  useRenderToolCall({
    name: "analyze_diff",
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm text-purple-700">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
            Analyzing code changes...
          </div>
        );
      }
      return <></>;
    },
  });

  return (
    <div className="flex h-screen flex-col">
      <CopilotChat
        className="flex-1"
        labels={{
          title: "Code Review Agent",
          initial:
            "Hi! I'm your AI code reviewer. Paste a GitHub PR URL and I'll analyze it for you.",
          placeholder: "Paste a GitHub PR URL to review...",
        }}
      />
    </div>
  );
}
