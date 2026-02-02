"use client";

import { useState } from "react";
import type { FileChange } from "@/lib/types";

interface FileTreeProps {
  files: FileChange[];
}

type TreeNode = {
  name: string;
  children: Map<string, TreeNode>;
  file?: FileChange;
};

const STATUS_DOT: Record<FileChange["status"], string> = {
  added: "bg-green-500",
  modified: "bg-yellow-500",
  deleted: "bg-red-500",
  renamed: "bg-blue-500",
};

function buildTree(files: FileChange[]): TreeNode {
  const root: TreeNode = { name: "", children: new Map() };
  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children.has(part)) {
        current.children.set(part, { name: part, children: new Map() });
      }
      current = current.children.get(part)!;
      if (i === parts.length - 1) {
        current.file = file;
      }
    }
  }
  return root;
}

function TreeFolder({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const entries = Array.from(node.children.values());
  const isLeaf = node.file !== undefined;

  if (isLeaf) {
    const f = node.file!;
    return (
      <div
        className="flex items-center gap-2 py-0.5"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[f.status]}`} />
        <span className="truncate font-mono text-sm text-gray-700 dark:text-gray-300">
          {node.name}
        </span>
        <span className="ml-auto flex gap-2 text-xs font-mono">
          {f.additions > 0 && (
            <span className="text-green-600 dark:text-green-400">+{f.additions}</span>
          )}
          {f.deletions > 0 && (
            <span className="text-red-600 dark:text-red-400">-{f.deletions}</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div>
      {node.name && (
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1 py-0.5 text-left"
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          <svg
            className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
          </svg>
          <span className="font-mono text-sm font-medium text-gray-600 dark:text-gray-400">
            {node.name}/
          </span>
        </button>
      )}
      {open &&
        entries.map((child) => (
          <TreeFolder
            key={child.name}
            node={child}
            depth={node.name ? depth + 1 : depth}
          />
        ))}
    </div>
  );
}

export function FileTree({ files }: FileTreeProps) {
  const tree = buildTree(files);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Changed Files ({files.length})
      </h4>
      <TreeFolder node={tree} depth={0} />
    </div>
  );
}
