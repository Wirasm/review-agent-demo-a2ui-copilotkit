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

export type FileChange = {
  path: string;
  additions: number;
  deletions: number;
  status: "added" | "modified" | "deleted" | "renamed";
};

export type SecuritySeverity = "critical" | "high" | "medium";

export type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type CommentMessage = {
  author: string;
  body: string;
  timestamp: string;
  role: "agent" | "user";
};

export type ComplexityEntry = {
  file: string;
  score: number;
  label: string;
};
