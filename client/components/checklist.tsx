"use client";

import { useState } from "react";
import type { ChecklistItem } from "@/lib/types";

interface ChecklistProps {
  title: string;
  items: ChecklistItem[];
}

export function Checklist({ title, items: initialItems }: ChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const checked = items.filter((i) => i.checked).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h4>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {checked} of {items.length} completed
      </p>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${items.length ? (checked / items.length) * 100 : 0}%` }}
        />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  item.checked
                    ? "border-indigo-500 bg-indigo-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {item.checked && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm ${
                  item.checked
                    ? "text-gray-400 line-through dark:text-gray-500"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
