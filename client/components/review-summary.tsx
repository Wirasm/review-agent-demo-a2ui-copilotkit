interface ReviewSummaryProps {
  prTitle: string;
  prAuthor: string;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  suggestionCount: number;
  summary: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  info: "bg-blue-100 text-blue-800 border-blue-200",
  suggestion: "bg-green-100 text-green-800 border-green-200",
};

export function ReviewSummary({
  prTitle,
  prAuthor,
  criticalCount,
  warningCount,
  infoCount,
  suggestionCount,
  summary,
}: ReviewSummaryProps) {
  const badges = [
    { label: "Critical", count: criticalCount, key: "critical" },
    { label: "Warning", count: warningCount, key: "warning" },
    { label: "Info", count: infoCount, key: "info" },
    { label: "Suggestion", count: suggestionCount, key: "suggestion" },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{prTitle}</h3>
        <span className="text-sm text-gray-500">by {prAuthor}</span>
      </div>
      <div className="mb-3 flex gap-2">
        {badges.map(
          ({ label, count, key }) =>
            count > 0 && (
              <span
                key={key}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS[key]}`}
              >
                {count} {label}
              </span>
            ),
        )}
      </div>
      <p className="text-sm text-gray-700">{summary}</p>
    </div>
  );
}
