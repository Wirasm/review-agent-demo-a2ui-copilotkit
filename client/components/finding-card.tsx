import type { Severity } from "@/lib/types";

interface FindingCardProps {
  severity: Severity;
  file: string;
  line: number;
  title: string;
  description: string;
  codeSnippet: string;
  suggestion: string;
}

const SEVERITY_STYLES: Record<
  Severity,
  { border: string; badge: string; label: string }
> = {
  critical: {
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-800",
    label: "Critical",
  },
  warning: {
    border: "border-l-yellow-500",
    badge: "bg-yellow-100 text-yellow-800",
    label: "Warning",
  },
  info: {
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-800",
    label: "Info",
  },
  suggestion: {
    border: "border-l-green-500",
    badge: "bg-green-100 text-green-800",
    label: "Suggestion",
  },
};

export function FindingCard({
  severity,
  file,
  line,
  title,
  description,
  codeSnippet,
  suggestion,
}: FindingCardProps) {
  const style = SEVERITY_STYLES[severity];

  return (
    <div
      className={`rounded-lg border border-gray-200 border-l-4 bg-white p-4 shadow-sm ${style.border}`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
        >
          {style.label}
        </span>
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <p className="mb-1 text-xs text-gray-500">
        {file}:{line}
      </p>
      <p className="mb-3 text-sm text-gray-700">{description}</p>
      {codeSnippet && (
        <pre className="mb-3 overflow-x-auto rounded bg-gray-50 p-3 text-xs text-gray-800">
          <code>{codeSnippet}</code>
        </pre>
      )}
      {suggestion && (
        <div className="rounded border border-green-200 bg-green-50 p-2">
          <p className="text-xs font-medium text-green-800">Suggestion</p>
          <p className="text-sm text-green-700">{suggestion}</p>
        </div>
      )}
    </div>
  );
}
