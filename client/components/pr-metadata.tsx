interface PRMetadataProps {
  title: string;
  author: string;
  branch: string;
  baseBranch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: number;
}

export function PRMetadata({
  title,
  author,
  branch,
  baseBranch,
  filesChanged,
  additions,
  deletions,
  commits,
}: PRMetadataProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        by {author} &middot;{" "}
        <span className="font-mono text-xs">
          {branch} → {baseBranch}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Files" value={String(filesChanged)} />
        <Stat label="Additions" value={`+${additions}`} className="text-green-600 dark:text-green-400" />
        <Stat label="Deletions" value={`-${deletions}`} className="text-red-600 dark:text-red-400" />
        <Stat label="Commits" value={String(commits)} />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  className = "text-gray-900 dark:text-gray-100",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-semibold ${className}`}>{value}</p>
    </div>
  );
}
