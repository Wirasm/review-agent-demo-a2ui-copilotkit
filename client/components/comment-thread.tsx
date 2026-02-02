import type { CommentMessage } from "@/lib/types";

interface CommentThreadProps {
  file: string;
  line: number;
  messages: CommentMessage[];
}

export function CommentThread({ file, line, messages }: CommentThreadProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-3 font-mono text-xs text-gray-500 dark:text-gray-400">
        {file}:{line}
      </p>
      <div className="relative space-y-3 pl-4">
        <div className="absolute top-0 bottom-0 left-1.5 w-px bg-gray-200 dark:bg-gray-700" />
        {messages.map((msg, i) => {
          const isAgent = msg.role === "agent";
          return (
            <div key={i} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  isAgent
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-indigo-500 text-white"
                }`}
              >
                <div className="mb-0.5 flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      isAgent ? "text-gray-700 dark:text-gray-300" : "text-indigo-100"
                    }`}
                  >
                    {msg.author}
                  </span>
                  <span
                    className={`text-xs ${
                      isAgent ? "text-gray-400 dark:text-gray-500" : "text-indigo-200"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    isAgent ? "text-gray-800 dark:text-gray-200" : "text-white"
                  }`}
                >
                  {msg.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
