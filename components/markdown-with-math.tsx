"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

type MarkdownVariant = "readme" | "chat";

type MarkdownWithMathProps = {
  children: string;
  variant?: MarkdownVariant;
  className?: string;
};

function isMathCode(className?: string) {
  return className?.includes("language-math");
}

const readmeComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 text-2xl font-bold text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-xl font-semibold text-white">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-white">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold text-white">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-2 mt-3 text-sm font-semibold text-white">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-2 mt-3 text-sm font-medium text-white">{children}</h6>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed text-zinc-300">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-primary hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-zinc-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-zinc-300">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-primary/25 pl-4 text-zinc-400">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm text-zinc-300">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-zinc-700 bg-zinc-800/50">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-zinc-800">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-white">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
  code: ({ className, children }) => {
    if (isMathCode(className)) {
      return <code className={className}>{children}</code>;
    }

    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="my-3 block overflow-x-auto rounded bg-zinc-800 p-3 text-sm text-zinc-200">
          {children}
        </code>
      );
    }

    return (
      <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-200">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded bg-zinc-800 p-3">{children}</pre>
  ),
};

const chatComponents: Components = {
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-[#ffffff15]">{children}</thead>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-[#ffffff08]">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left font-semibold text-white">{children}</th>
  ),
  td: ({ children }) => <td className="px-2 py-1.5 align-top">{children}</td>,
  code: ({ className, children }) => {
    if (isMathCode(className)) {
      return <code className={className}>{children}</code>;
    }
    return <code>{children}</code>;
  },
};

export function MarkdownWithMath({
  children,
  variant = "chat",
  className,
}: MarkdownWithMathProps) {
  const components = variant === "readme" ? readmeComponents : chatComponents;

  return (
    <div className={cn("markdown-math", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
