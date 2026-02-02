import type { SecuritySeverity } from "@/lib/types";

interface SecurityAlertProps {
  severity: SecuritySeverity;
  title: string;
  file: string;
  line: number;
  description: string;
  recommendation: string;
  cve?: string;
}

const SEVERITY_STYLES: Record<SecuritySeverity, { border: string; bg: string; text: string; dot: string }> = {
  critical: {
    border: "border-l-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-800 dark:text-red-300",
    dot: "bg-red-500 animate-pulse",
  },
  high: {
    border: "border-l-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-800 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  medium: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-800 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
};

export function SecurityAlert({
  severity,
  title,
  file,
  line,
  description,
  recommendation,
  cve,
}: SecurityAlertProps) {
  const style = SEVERITY_STYLES[severity];

  return (
    <div
      className={`rounded-xl border border-l-4 ${style.border} ${style.bg} p-4 shadow-sm dark:border-gray-700`}
    >
      <div className="mb-2 flex items-center gap-2">
        <svg
          className={`h-5 w-5 ${style.text}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          />
        </svg>
        <span className={`text-sm font-semibold ${style.text}`}>
          Security Alert
        </span>
        <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
        {cve && (
          <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-mono text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {cve}
          </span>
        )}
      </div>
      <h4 className={`mb-1 font-medium ${style.text}`}>{title}</h4>
      <p className="mb-2 font-mono text-xs text-gray-500 dark:text-gray-400">
        {file}:{line}
      </p>
      <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
        {description}
      </p>
      <div className="rounded-lg border border-gray-200 bg-white/60 p-3 dark:border-gray-600 dark:bg-gray-800/60">
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          Recommendation
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {recommendation}
        </p>
      </div>
    </div>
  );
}
