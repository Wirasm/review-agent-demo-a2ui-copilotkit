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
import { PRMetadata } from "@/components/pr-metadata";
import { FileTree } from "@/components/file-tree";
import { DiffViewer } from "@/components/diff-viewer";
import { SecurityAlert } from "@/components/security-alert";
import { SuggestionDiff } from "@/components/suggestion-diff";
import { ComplexityChart } from "@/components/complexity-chart";
import { Checklist } from "@/components/checklist";
import { CommentThread } from "@/components/comment-thread";
import { FileFocusDialog } from "@/components/file-focus-dialog";
import type { Severity, SecuritySeverity, FileChange, ComplexityEntry, ChecklistItem, CommentMessage } from "@/lib/types";

export default function Home() {
  // ── Frontend Tools (10) ──────────────────────────────────────────

  useFrontendTool({
    name: "render_pr_metadata",
    description: "Display a compact stats card with PR metadata: title, author, branches, file/line counts.",
    parameters: [
      { name: "title", type: "string", description: "PR title", required: true },
      { name: "author", type: "string", description: "PR author", required: true },
      { name: "branch", type: "string", description: "Source branch", required: true },
      { name: "baseBranch", type: "string", description: "Target branch", required: true },
      { name: "filesChanged", type: "number", description: "Number of files changed", required: true },
      { name: "additions", type: "number", description: "Total additions", required: true },
      { name: "deletions", type: "number", description: "Total deletions", required: true },
      { name: "commits", type: "number", description: "Number of commits", required: true },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <PRMetadata
            title={args.title as string}
            author={args.author as string}
            branch={args.branch as string}
            baseBranch={args.baseBranch as string}
            filesChanged={args.filesChanged as number}
            additions={args.additions as number}
            deletions={args.deletions as number}
            commits={args.commits as number}
          />
        );
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_review_summary",
    description: "Display a summary card for the PR review with severity counts.",
    parameters: [
      { name: "prTitle", type: "string", description: "PR title", required: true },
      { name: "prAuthor", type: "string", description: "PR author", required: true },
      { name: "criticalCount", type: "number", description: "Number of critical findings", required: true },
      { name: "warningCount", type: "number", description: "Number of warning findings", required: true },
      { name: "infoCount", type: "number", description: "Number of info findings", required: true },
      { name: "suggestionCount", type: "number", description: "Number of suggestion findings", required: true },
      { name: "summary", type: "string", description: "Short summary of the review", required: true },
    ],
    handler: async (args) => args,
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

  useFrontendTool({
    name: "render_file_tree",
    description: "Display a collapsible file tree of changed files with addition/deletion counts.",
    parameters: [
      {
        name: "files",
        type: "object[]",
        description: 'Array of { path: string, additions: number, deletions: number, status: "added"|"modified"|"deleted"|"renamed" }',
        required: true,
      },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return <FileTree files={args.files as FileChange[]} />;
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_diff_viewer",
    description: "Display an inline diff snippet with colored add/remove lines and line numbers.",
    parameters: [
      { name: "fileName", type: "string", description: "File path", required: true },
      { name: "language", type: "string", description: "Programming language", required: true },
      {
        name: "lines",
        type: "object[]",
        description: 'Array of { type: "add"|"remove"|"context", content: string, lineNumber: number }',
        required: true,
      },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <DiffViewer
            fileName={args.fileName as string}
            language={args.language as string}
            lines={args.lines as { type: "add" | "remove" | "context"; content: string; lineNumber: number }[]}
          />
        );
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_finding",
    description: "Display a finding card with severity, file, description, code snippet, and suggestion.",
    parameters: [
      { name: "severity", type: "string", description: "critical, warning, info, or suggestion", required: true },
      { name: "file", type: "string", description: "File path", required: true },
      { name: "line", type: "number", description: "Line number", required: true },
      { name: "title", type: "string", description: "Finding title", required: true },
      { name: "description", type: "string", description: "Detailed description", required: true },
      { name: "code_snippet", type: "string", description: "Relevant code snippet", required: true },
      { name: "suggestion", type: "string", description: "Improvement suggestion", required: true },
    ],
    handler: async (args) => args,
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

  useFrontendTool({
    name: "render_security_alert",
    description: "Display a prominent security warning banner for vulnerabilities found in the code.",
    parameters: [
      { name: "severity", type: "string", description: "critical, high, or medium", required: true },
      { name: "title", type: "string", description: "Alert title", required: true },
      { name: "file", type: "string", description: "File path", required: true },
      { name: "line", type: "number", description: "Line number", required: true },
      { name: "description", type: "string", description: "Vulnerability description", required: true },
      { name: "recommendation", type: "string", description: "How to fix", required: true },
      { name: "cve", type: "string", description: "CVE identifier if applicable" },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <SecurityAlert
            severity={args.severity as SecuritySeverity}
            title={args.title as string}
            file={args.file as string}
            line={args.line as number}
            description={args.description as string}
            recommendation={args.recommendation as string}
            cve={args.cve as string | undefined}
          />
        );
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_suggestion_diff",
    description: "Display a side-by-side before/after comparison for a concrete fix proposal.",
    parameters: [
      { name: "file", type: "string", description: "File path", required: true },
      { name: "currentCode", type: "string", description: "Current code block", required: true },
      { name: "suggestedCode", type: "string", description: "Suggested replacement", required: true },
      { name: "explanation", type: "string", description: "Why this change is better", required: true },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <SuggestionDiff
            file={args.file as string}
            currentCode={args.currentCode as string}
            suggestedCode={args.suggestedCode as string}
            explanation={args.explanation as string}
          />
        );
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_complexity_chart",
    description: "Display a horizontal bar chart showing risk/complexity score per file.",
    parameters: [
      {
        name: "entries",
        type: "object[]",
        description: "Array of { file: string, score: number (0-100), label: string }",
        required: true,
      },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return <ComplexityChart entries={args.entries as ComplexityEntry[]} />;
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_checklist",
    description: "Display an interactive quality checklist the user can check off.",
    parameters: [
      { name: "title", type: "string", description: "Checklist title", required: true },
      {
        name: "items",
        type: "object[]",
        description: "Array of { id: string, label: string, checked: boolean }",
        required: true,
      },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <Checklist
            title={args.title as string}
            items={args.items as ChecklistItem[]}
          />
        );
      }
      return <></>;
    },
  });

  useFrontendTool({
    name: "render_comment_thread",
    description: "Display a threaded discussion about a specific code location.",
    parameters: [
      { name: "file", type: "string", description: "File path", required: true },
      { name: "line", type: "number", description: "Line number", required: true },
      {
        name: "messages",
        type: "object[]",
        description: 'Array of { author: string, body: string, timestamp: string, role: "agent"|"user" }',
        required: true,
      },
    ],
    handler: async (args) => args,
    render: ({ status, args }) => {
      if (status === "complete" && args) {
        return (
          <CommentThread
            file={args.file as string}
            line={args.line as number}
            messages={args.messages as CommentMessage[]}
          />
        );
      }
      return <></>;
    },
  });

  // ── HITL Tools (2) ───────────────────────────────────────────────

  useHumanInTheLoop({
    name: "request_review_action",
    description: "Ask the user whether to post a review, create an issue, or dismiss.",
    parameters: [
      { name: "pr_url", type: "string", description: "The PR URL being reviewed" },
      { name: "summary", type: "string", description: "Brief summary of findings" },
    ],
    render: ({ args, status, respond }) => (
      <ActionDialog args={args} status={status} respond={respond} />
    ),
  });

  useHumanInTheLoop({
    name: "request_file_focus",
    description: "Ask the user which files to focus on for large PRs.",
    parameters: [
      {
        name: "files",
        type: "string[]",
        description: "List of file paths in the PR",
      },
    ],
    render: ({ args, status, respond }) => (
      <FileFocusDialog
        files={(args.files as string[]) ?? []}
        status={status}
        respond={respond}
      />
    ),
  });

  // ── Loading Renderers (4) ────────────────────────────────────────

  useRenderToolCall({
    name: "fetch_pr_diff",
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400" />
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
          <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent dark:border-purple-400" />
            Analyzing code changes...
          </div>
        );
      }
      return <></>;
    },
  });

  useRenderToolCall({
    name: "post_github_review",
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent dark:border-green-400" />
            Posting review to GitHub...
          </div>
        );
      }
      return <></>;
    },
  });

  useRenderToolCall({
    name: "create_github_issue",
    render: ({ status }) => {
      if (status === "executing") {
        return (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent dark:border-amber-400" />
            Creating GitHub issue...
          </div>
        );
      }
      return <></>;
    },
  });

  // ── Chat UI ──────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex h-full min-h-0 max-w-4xl flex-col p-4 sm:p-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CopilotChat
          className="flex-1 min-h-0"
          labels={{
            title: "Code Review",
            initial:
              "Paste a GitHub PR URL and I'll give you a thorough code review with actionable feedback.",
            placeholder: "Paste a GitHub PR URL to review...",
          }}
        />
      </div>
    </div>
  );
}
