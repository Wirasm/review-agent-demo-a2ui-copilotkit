interface SuggestionDiffProps {
  file: string;
  currentCode: string;
  suggestedCode: string;
  explanation: string;
}

export function SuggestionDiff({
  file,
  currentCode,
  suggestedCode,
  explanation,
}: SuggestionDiffProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-3 font-mono text-xs text-gray-500 dark:text-gray-400">
        {file}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold text-red-600 dark:text-red-400">
            Current
          </p>
          <pre className="overflow-x-auto rounded-lg bg-red-50 p-3 font-mono text-sm text-gray-800 dark:bg-red-950/20 dark:text-gray-200">
            <code>{currentCode}</code>
          </pre>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-green-600 dark:text-green-400">
            Suggested
          </p>
          <pre className="overflow-x-auto rounded-lg bg-green-50 p-3 font-mono text-sm text-gray-800 dark:bg-green-950/20 dark:text-gray-200">
            <code>{suggestedCode}</code>
          </pre>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        {explanation}
      </p>
    </div>
  );
}
