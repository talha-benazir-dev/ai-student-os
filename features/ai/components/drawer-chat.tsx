"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus } from "lucide-react";
import { nanoid } from "nanoid";
import { MarkdownWithMath } from "@/components/markdown-with-math";
import { toast } from "sonner";
import type { DrawerContext } from "@/providers/ai-drawer-provider";
import type { ChatAttachment, Message, Profile, ToolResultCard as ToolResultCardType } from "@/features/ai/types";
import { QuestionCard } from "@/features/ai/components/question-card";
import { ToolResultCard as ToolResultCardComponent } from "@/features/ai/components/tool-result-card";
import { ChatAttachmentStrip } from "@/features/ai/components/chat-attachment-strip";
import { useAutoResizeTextarea } from "@/features/ai/hooks/use-auto-resize-textarea";
import { useChatAttachments } from "@/features/ai/hooks/use-chat-attachments";
import {
  CHAT_COMPOSER_ATTACH_BUTTON_CLASS,
  CHAT_COMPOSER_SEND_BUTTON_CLASS,
  CHAT_COMPOSER_TEXTAREA_CLASS,
  chatComposerRowClass,
} from "@/features/ai/lib/chat-composer-styles";
import { parseAiApiError, UPGRADE_TOAST } from "@/lib/ai/constants";

type StreamEvent =
  | { type: "text"; value: string }
  | { type: "tool_result"; value: ToolResultCardType }
  | { type: "done" };

type DrawerChatProps = {
  context: DrawerContext;
  clusters: { id: string; name: string; color: string }[];
  profile: Profile | null;
};

const GOAL_OPTIONS = [
  { label: "🎯 Exam Prep", value: "exam_prep" },
  { label: "📖 Deep Understanding", value: "deep_understanding" },
  { label: "⚡ Quick Revision", value: "quick_revision" },
  { label: "📝 Assignment", value: "assignment" },
];

const DEADLINE_OPTIONS = [
  { label: "This week", value: "7" },
  { label: "This month", value: "30" },
  { label: "3 months", value: "90" },
  { label: "No deadline", value: "0" },
];

const DAILY_TIME_OPTIONS = [
  { label: "30 min", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "2 hours", value: "120" },
  { label: "3+ hours", value: "180" },
];

const LEVEL_OPTIONS = [
  { label: "🌱 Beginner", value: "beginner" },
  { label: "📚 Intermediate", value: "intermediate" },
  { label: "🚀 Advanced", value: "advanced" },
];

const DOCUMENT_QUESTIONS: NonNullable<Message["questions"]> = [
  {
    id: "goal",
    question: "What's your goal with this document?",
    options: GOAL_OPTIONS,
  },
  {
    id: "deadline",
    question: "When do you need this by?",
    options: DEADLINE_OPTIONS,
  },
  {
    id: "daily_time",
    question: "How much time can you study daily?",
    options: DAILY_TIME_OPTIONS,
  },
];

const CLUSTER_QUESTIONS: NonNullable<Message["questions"]> = [
  {
    id: "goal",
    question: "What's your goal with this document?",
    options: GOAL_OPTIONS,
  },
  {
    id: "level",
    question: "What's your current level in this subject?",
    options: LEVEL_OPTIONS,
  },
  {
    id: "deadline",
    question: "When do you need this by?",
    options: DEADLINE_OPTIONS,
  },
  {
    id: "daily_time",
    question: "How much time can you study daily?",
    options: DAILY_TIME_OPTIONS,
  },
];

const QUESTION_SUMMARY_LABELS: Record<string, string> = {
  goal: "Goal",
  deadline: "Deadline",
  daily_time: "Daily time",
  level: "Level",
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

function initialMessages(context: DrawerChatProps["context"]): Message[] {
  const introduction = context.type === "document"
    ? `Let’s make a study pack for **${context.documentTitle}**. First, a few questions to make it useful to you.`
    : context.type === "cluster"
      ? `Let’s plan a manageable study session for **${context.clusterNames.join(", ")}**.`
      : "What are you working on? Ask a question, work through a concept, or plan a small study session.";
  const messages: Message[] = [{ id: nanoid(), role: "assistant", content: introduction, createdAt: new Date() }];
  if (context.type !== "manual") messages.push({ id: nanoid(), role: "assistant", content: "", questions: context.type === "document" ? DOCUMENT_QUESTIONS : CLUSTER_QUESTIONS, createdAt: new Date() });
  return messages;
}

export function DrawerChat({ context, clusters, profile }: DrawerChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => initialMessages(context));
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [flowComplete, setFlowComplete] = useState(context.type === "manual");
  const { textareaRef, isMultiline } = useAutoResizeTextarea(inputValue);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    pending,
    isUploading,
    hasAttachments,
    addFile,
    removeAttachment,
    handlePaste,
    uploadAll,
  } = useChatAttachments();

  const messagesRef = useRef(messages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasExecuted = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const readSSEStream = useCallback(
    async (response: Response, assistantMsgId: string) => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;

          const payload = line.slice(6).trim();
          if (!payload) continue;

          const event = JSON.parse(payload) as StreamEvent;

          switch (event.type) {
            case "text":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.value }
                    : m,
                ),
              );
              break;
            case "tool_result":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        toolResults: [...(m.toolResults ?? []), event.value],
                      }
                    : m,
                ),
              );
              break;
            case "done":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, isStreaming: false }
                    : m,
                ),
              );
              setIsLoading(false);
              setFlowComplete(true);
              break;
          }
        }
      }
    },
    [],
  );

  const executeAutonomousFlow = useCallback(
    async (answersRecord: Record<string, string>) => {
      if (hasExecuted.current) return;
      hasExecuted.current = true;

      const questionMsg = messagesRef.current.find((m) => m.questions?.length);
      const summary =
        questionMsg?.questions
          ?.map((q) => {
            const option = q.options.find((o) => o.value === answersRecord[q.id]);
            const label = QUESTION_SUMMARY_LABELS[q.id] ?? q.id;
            return `${label}: ${option?.label ?? answersRecord[q.id]}`;
          })
          .join(", ") ?? "";

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: summary,
        createdAt: new Date(),
      };

      const assistantMsgId = nanoid();
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/autonomous", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context,
            answers: answersRecord,
            profile,
            clusters,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          if (parseAiApiError(response.status, data) === "upgrade_required") {
            toast.error(UPGRADE_TOAST);
          }
          throw new Error(`Request failed (${response.status})`);
        }

        await readSSEStream(response, assistantMsgId);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
          ),
        );
        setIsLoading(false);
        setFlowComplete(true);
      }
    },
    [clusters, context, profile, readSSEStream],
  );

  const handleAnswer = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: value };
        const questionMessage = messagesRef.current.find((m) => m.questions?.length);

        if (questionMessage?.questions) {
          const allAnswered = questionMessage.questions.every(
            (q) => next[q.id] != null,
          );
          if (allAnswered) {
            void executeAutonomousFlow(next);
          }
        }

        return next;
      });
    },
    [executeAutonomousFlow],
  );

  const handleSend = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      const trimmed = content.trim();
      const hasUploadedAttachments = attachments.length > 0;

      if (
        (!trimmed && !hasUploadedAttachments) ||
        isLoading ||
        !profile
      ) {
        return;
      }

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: trimmed,
        attachments: hasUploadedAttachments ? attachments : undefined,
        createdAt: new Date(),
      };

      const assistantMsgId = nanoid();
      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isStreaming: true,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);
      setInputValue("");

      const apiMessages = messagesRef.current
        .filter((m) => !m.isStreaming && !m.questions?.length)
        .map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        }));

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...apiMessages,
              {
                role: "user",
                content: trimmed,
                attachments: hasUploadedAttachments ? attachments : undefined,
              },
            ],
            autonomy: "autonomous",
            selectedClusterId: null,
            selectedClusterName: null,
            curriculumMode: false,
            profile,
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          if (parseAiApiError(response.status, data) === "upgrade_required") {
            toast.error(UPGRADE_TOAST);
          }
          throw new Error(`Request failed (${response.status})`);
        }

        await readSSEStream(response, assistantMsgId);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
          ),
        );
        setIsLoading(false);
      }
    },
    [isLoading, profile, readSSEStream],
  );


  const showInput = context.type === "manual" || flowComplete;
  const canSend =
    !isLoading &&
    !isUploading &&
    (inputValue.trim().length > 0 || hasAttachments);

  const submitInput = async () => {
    if (!canSend) return;

    try {
      const attachments = await uploadAll();
      await handleSend(inputValue, attachments);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[75%] rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-sm text-white">
                  {message.attachments && message.attachments.length > 0 ? (
                    <div className="mb-2">
                      <ChatAttachmentStrip uploaded={message.attachments} />
                    </div>
                  ) : null}
                  {message.content ? <p>{message.content}</p> : null}
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
              <div key={message.id} className="flex flex-col">
                {message.content.trim().length > 0 ? (
                  <div className="flex items-end gap-0.5">
                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-white/85 prose-headings:text-white prose-strong:text-white prose-code:text-primary-soft prose-code:bg-primary/10 prose-code:rounded prose-code:px-1 prose-pre:border prose-pre:border-[#ffffff10] prose-pre:bg-card prose-ol:text-white/85 prose-ul:text-white/85 prose-li:text-white/85">
                      <MarkdownWithMath variant="chat">
                        {message.content}
                      </MarkdownWithMath>
                    </div>
                    {showCursor ? (
                      <span className="mb-1 inline-block animate-pulse text-primary">
                        ▍
                      </span>
                    ) : null}
                  </div>
                ) : showDots ? (
                  <StreamingDots />
                ) : null}

                {message.questions?.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question.question}
                    options={question.options}
                    answered={answers[question.id] ?? null}
                    onAnswer={(value) =>
                      handleAnswer(question.id, value)
                    }
                  />
                ))}

                {message.toolResults && message.toolResults.length > 0 ? (
                  <div>
                    {message.toolResults.map((card, index) => (
                      <ToolResultCardComponent
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

      {showInput ? (
        <div className="border-t border-[#ffffff10] p-3">
          <div
            className="flex flex-col gap-2 rounded-2xl border border-[#ffffff10] bg-card p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) addFile(file);
            }}
          >
            <ChatAttachmentStrip
              pending={pending}
              onRemove={removeAttachment}
            />

            <div className={chatComposerRowClass(isMultiline)}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) addFile(file);
                  event.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className={CHAT_COMPOSER_ATTACH_BUTTON_CLASS}
                aria-label="Attach image"
              >
                <ImagePlus className="h-4 w-4 text-white" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submitInput();
                  }
                }}
                placeholder="Ask a follow-up… paste an image to include it"
                autoComplete="off"
                disabled={isLoading || isUploading}
                rows={1}
                className={CHAT_COMPOSER_TEXTAREA_CLASS}
              />
              <button
                type="button"
                onClick={() => void submitInput()}
                disabled={!canSend}
                className={CHAT_COMPOSER_SEND_BUTTON_CLASS}
                aria-label="Send message"
              >
                <ArrowUp className="h-4 w-4 text-white" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
