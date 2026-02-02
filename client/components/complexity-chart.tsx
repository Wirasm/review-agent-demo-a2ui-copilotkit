import type { ComplexityEntry } from "@/lib/types";

interface ComplexityChartProps {
  entries: ComplexityEntry[];
}

function barColor(score: number): string {
  if (score <= 33) return "bg-green-500";
  if (score <= 66) return "bg-yellow-500";
  return "bg-red-500";
}

export function ComplexityChart({ entries }: ComplexityChartProps) {
  const max = Math.max(...entries.map((e) => e.score), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Complexity / Risk
      </h4>
      <div className="space-y-2">
        {entries.map((entry) => {
          const pct = Math.round((entry.score / max) * 100);
          return (
            <div key={entry.file} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate font-mono text-xs text-gray-600 dark:text-gray-400">
                {entry.file}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor(entry.score)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs font-medium text-gray-700 dark:text-gray-300">
                {entry.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
