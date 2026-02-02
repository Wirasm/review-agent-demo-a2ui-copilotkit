interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber: number;
}

interface DiffViewerProps {
  fileName: string;
  language: string;
  lines: DiffLine[];
}

const LINE_STYLES: Record<DiffLine["type"], string> = {
  add: "bg-green-50 dark:bg-green-950/30",
  remove: "bg-red-50 dark:bg-red-950/30",
  context: "",
};

const LINE_PREFIX: Record<DiffLine["type"], string> = {
  add: "+",
  remove: "-",
  context: " ",
};

export function DiffViewer({ fileName, language, lines }: DiffViewerProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <span className="truncate font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
          {fileName}
        </span>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {language}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className={LINE_STYLES[line.type]}>
                <td className="w-12 select-none border-r border-gray-200 px-2 text-right font-mono text-xs text-gray-400 dark:border-gray-700">
                  {line.lineNumber}
                </td>
                <td className="w-4 select-none px-1 text-center font-mono text-xs text-gray-400">
                  {LINE_PREFIX[line.type]}
                </td>
                <td className="whitespace-pre px-3 py-0.5 font-mono text-sm text-gray-800 dark:text-gray-200">
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
