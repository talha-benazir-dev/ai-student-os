"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/features/ai/types";
import { ToolResultCard } from "@/features/ai/components/tool-result-card";

type ChatThreadProps = {
  messages: Message[];
};

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:75ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:150ms]" />
    </span>
  );
}

export function ChatThread({ messages }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <Sparkles className="mb-4 h-9 w-9 text-white/10" strokeWidth={1.5} />
        <p className="text-base font-medium text-white/20">Ask me anything.</p>
        <p className="mt-1 text-center text-sm text-white/20">
          I can create notes, tasks, flashcards, clusters — or just help you
          study.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-1 py-2">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <div key={message.id} className="mb-4 flex justify-end">
              <div className="max-w-[75%] rounded-2xl border border-[#7c5cfc20] bg-[#7c5cfc1a] px-4 py-3 text-sm text-white">
                {message.content}
              </div>
            </div>
          );
        }

        if (message.role === "assistant") {
          const showDots =
            message.isStreaming && message.content.trim().length === 0;
          const showCursor =
            message.isStreaming && message.content.trim().length > 0;

          return (
            <div key={message.id} className="mb-6 flex flex-col">
              {showDots ? (
                <StreamingDots />
              ) : (
                <div className="flex items-end gap-0.5">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/85 prose-headings:text-white prose-strong:text-white prose-code:text-violet-300 prose-code:bg-[#7c5cfc15] prose-code:rounded prose-code:px-1 prose-pre:border prose-pre:border-[#ffffff10] prose-pre:bg-[#0f0f17] prose-ol:text-white/85 prose-ul:text-white/85 prose-li:text-white/85">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {showCursor ? (
                    <span className="mb-1 inline-block animate-pulse text-violet-400">
                      ▍
                    </span>
                  ) : null}
                </div>
              )}

              {message.toolResults && message.toolResults.length > 0 ? (
                <div>
                  {message.toolResults.map((card, index) => (
                    <ToolResultCard
                      key={`${message.id}-tool-${index}`}
                      card={card}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        }

        return null;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
