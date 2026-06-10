"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/features/ai/types";
import { ToolResultCard } from "@/features/ai/components/tool-result-card";

type ChatThreadProps = {
  messages: Message[];
};

export function ChatThread({ messages }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <Sparkles className="mb-4 h-10 w-10 opacity-20" strokeWidth={1.5} />
        <p className="max-w-sm text-sm text-muted-foreground">
          Ask me anything. I can create notes, tasks, flashcards, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-1 py-2">
      {messages.map((message) => {
        if (message.role === "user") {
          return (
            <div key={message.id} className="flex justify-end">
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl border px-4 py-2.5 text-sm",
                  "border-[#7c5cfc]/30 bg-[#7c5cfc]/20",
                )}
              >
                {message.content}
              </div>
            </div>
          );
        }

        if (message.role === "assistant") {
          return (
            <div key={message.id} className="flex justify-start">
              <div className="max-w-[80%]">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {message.content}
                  {message.isStreaming ? (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-foreground align-middle" />
                  ) : null}
                </p>
                {message.toolResults && message.toolResults.length > 0 ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {message.toolResults.map((card, index) => (
                      <ToolResultCard
                        key={`${message.id}-tool-${index}`}
                        card={card}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
