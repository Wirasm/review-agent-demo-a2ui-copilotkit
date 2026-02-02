import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Review Agent",
  description: "AI-powered GitHub PR code review",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(window.matchMedia("(prefers-color-scheme:dark)").matches)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col bg-gray-50 antialiased dark:bg-gray-900`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <svg
              className="h-6 w-6 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ReviewBot
            </span>
          </div>
          <span className="text-xs text-gray-400">Powered by GPT-4o</span>
        </header>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="review_agent">
          <main className="flex-1 overflow-hidden">{children}</main>
        </CopilotKit>
      </body>
    </html>
  );
}
