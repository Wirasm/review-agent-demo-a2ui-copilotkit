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
  critical: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  suggestion: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {prTitle}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            by {prAuthor}
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
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
        <p className="text-sm text-gray-700 dark:text-gray-300">{summary}</p>
      </div>
    </div>
  );
}
