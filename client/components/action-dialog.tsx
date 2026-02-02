interface ActionDialogProps {
  args: {
    pr_url?: string;
    summary?: string;
  };
  status: string;
  respond?: (result: Record<string, unknown>) => void;
}

export function ActionDialog({ args, status, respond }: ActionDialogProps) {
  if (status !== "executing" || !respond) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        What would you like to do?
      </h4>
      {args.summary && (
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Review ready for: {args.pr_url}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => respond({ action: "post_review" })}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Post Review
        </button>
        <button
          onClick={() => respond({ action: "create_issue" })}
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700"
        >
          Create Issue
        </button>
        <button
          onClick={() => respond({ action: "dismiss" })}
          className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
