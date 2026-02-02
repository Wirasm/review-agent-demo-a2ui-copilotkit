"use client";

import { useState } from "react";

interface FileFocusDialogProps {
  files: string[];
  status: string;
  respond?: (result: Record<string, unknown>) => void;
}

export function FileFocusDialog({ files, status, respond }: FileFocusDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (status !== "executing" || !respond) {
    return null;
  }

  const toggle = (file: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Which files should I focus on?
      </h4>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Select specific files or review all of them.
      </p>
      <ul className="mb-4 max-h-48 space-y-1 overflow-y-auto">
        {files.map((file) => {
          const isSelected = selected.has(file);
          return (
            <li key={file}>
              <button
                onClick={() => toggle(file)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="truncate font-mono text-xs">{file}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={() => respond({ selectedFiles: Array.from(selected) })}
          disabled={selected.size === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Focus Review ({selected.size})
        </button>
        <button
          onClick={() => respond({ selectedFiles: files })}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Review All
        </button>
      </div>
    </div>
  );
}
