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
