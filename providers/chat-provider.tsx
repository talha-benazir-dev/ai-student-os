"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { parseAiApiError, UPGRADE_TOAST } from "@/lib/ai/constants";
import {
  appendChatTurn,
  createConversation,
  getConversation,
  listConversations,
  type ConversationSummary,
} from "@/features/ai/actions/conversations.actions";
import type {
  AutonomyLevel,
  ChatAttachment,
  ChatState,
  Message,
  Profile,
  ToolResultCard,
} from "@/features/ai/types";
import { useClusters } from "@/providers/clusters-provider";

type StreamEvent =
  | { type: "text"; value: string }
  | { type: "tool_result"; value: ToolResultCard }
  | { type: "done" };

type ChatAction =
  | { type: "SET_PROFILE"; profile: Profile }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "APPEND_TEXT"; id: string; text: string }
  | { type: "SET_STREAMING"; id: string; isStreaming: boolean }
  | { type: "ADD_TOOL_RESULT"; id: string; card: ToolResultCard }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_AUTONOMY"; autonomy: AutonomyLevel }
  | { type: "SET_CLUSTER"; id: string | null; name: string | null }
  | { type: "SET_CURRICULUM"; curriculumMode: boolean }
  | { type: "SET_CONVERSATION_ID"; id: string | null }
  | {
      type: "LOAD_CONVERSATION";
      payload: ChatState & { conversationId: string | null };
    }
  | { type: "CLEAR_MESSAGES" };

type ChatContextValue = ChatState & {
  conversationId: string | null;
  historyOpen: boolean;
  conversations: ConversationSummary[];
  isLoadingHistory: boolean;
  setProfile: (profile: Profile) => void;
  sendMessage: (content: string, attachments?: ChatAttachment[]) => Promise<void>;
  setAutonomy: (level: AutonomyLevel) => void;
  setCluster: (id: string | null, name: string | null) => void;
  setCurriculumMode: (val: boolean) => void;
  newChat: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  toggleHistory: () => void;
  refreshConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
};

const initialState: ChatState & { conversationId: string | null } = {
  messages: [],
  isLoading: false,
  autonomy: "assisted",
  selectedClusterId: null,
  selectedClusterName: null,
  curriculumMode: false,
  profile: null,
  conversationId: null,
};

function chatReducer(
  state: ChatState & { conversationId: string | null },
  action: ChatAction,
): ChatState & { conversationId: string | null } {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, profile: action.profile };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "APPEND_TEXT":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, content: m.content + action.text } : m,
        ),
      };
    case "SET_STREAMING":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, isStreaming: action.isStreaming } : m,
        ),
      };
    case "ADD_TOOL_RESULT":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id
            ? {
                ...m,
                toolResults: [...(m.toolResults ?? []), action.card],
              }
            : m,
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_AUTONOMY":
      return { ...state, autonomy: action.autonomy };
    case "SET_CLUSTER":
      return {
        ...state,
        selectedClusterId: action.id,
        selectedClusterName: action.name,
      };
    case "SET_CURRICULUM":
      return { ...state, curriculumMode: action.curriculumMode };
    case "SET_CONVERSATION_ID":
      return { ...state, conversationId: action.id };
    case "LOAD_CONVERSATION":
      return { ...state, ...action.payload };
    case "CLEAR_MESSAGES":
      return {
        ...state,
        messages: [],
        conversationId: null,
        isLoading: false,
      };
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | null>(null);

type ChatProviderProps = {
  children: ReactNode;
  initialConversationId?: string | null;
};

export function ChatProvider({
  children,
  initialConversationId = null,
}: ChatProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { clusters } = useClusters();
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    conversationId: initialConversationId,
  });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const clusterNameForId = useCallback(
    (id: string | null) => {
      if (!id) return null;
      return clusters.find((c) => c.id === id)?.name ?? null;
    },
    [clusters],
  );

  const refreshConversations = useCallback(async () => {
    setIsLoadingHistory(true);
    const result = await listConversations();
    setIsLoadingHistory(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setConversations(result.data ?? []);
  }, []);

  const loadConversationById = useCallback(
    async (id: string, options?: { syncRoute?: boolean }) => {
      const result = await getConversation(id);
      if (result.error || !result.data) {
        toast.error(result.error ?? "Could not load chat");
        return;
      }

      const { conversation, messages } = result.data;
      const clusterName = clusterNameForId(conversation.cluster_id);

      dispatch({
        type: "LOAD_CONVERSATION",
        payload: {
          messages: messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            attachments: message.attachments ?? undefined,
            toolResults: message.tool_results ?? undefined,
            createdAt: new Date(message.created_at),
          })),
          isLoading: false,
          autonomy: conversation.autonomy,
          selectedClusterId: conversation.cluster_id,
          selectedClusterName: clusterName,
          curriculumMode: conversation.curriculum_mode,
          profile: stateRef.current.profile,
          conversationId: conversation.id,
        },
      });

      if (options?.syncRoute !== false) {
        if (pathname === "/ai" || pathname.startsWith("/ai/c/")) {
          router.push(`/ai/c/${id}`);
        }
      }
    },
    [clusterNameForId, pathname, router],
  );

  const loadConversation = useCallback(
    async (id: string) => {
      setHistoryOpen(false);
      await loadConversationById(id);
    },
    [loadConversationById],
  );

  const newChat = useCallback(() => {
    dispatch({ type: "CLEAR_MESSAGES" });
    setHistoryOpen(false);
    if (pathname === "/ai" || pathname.startsWith("/ai/c/")) {
      router.push("/ai");
    }
  }, [pathname, router]);

  const openHistory = useCallback(() => {
    setHistoryOpen(true);
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryOpen(false);
  }, []);

  const toggleHistory = useCallback(() => {
    setHistoryOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!historyOpen) return;
    void refreshConversations();
  }, [historyOpen, refreshConversations]);

  useEffect(() => {
    if (!initialConversationId) return;
    if (initialConversationId === stateRef.current.conversationId) return;
    void loadConversationById(initialConversationId, { syncRoute: false });
  }, [initialConversationId, loadConversationById]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "h") {
        return;
      }

      event.preventDefault();
      toggleHistory();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleHistory]);

  const setProfile = useCallback((profile: Profile) => {
    dispatch({ type: "SET_PROFILE", profile });
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments: ChatAttachment[] = []) => {
      const trimmed = content.trim();
      const hasAttachments = attachments.length > 0;

      if (
        (!trimmed && !hasAttachments) ||
        stateRef.current.isLoading ||
        !stateRef.current.profile
      ) {
        return;
      }

      const isFirstTurn =
        stateRef.current.messages.filter((m) => !m.isStreaming).length === 0;

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        content: trimmed,
        attachments: hasAttachments ? attachments : undefined,
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

      dispatch({ type: "ADD_MESSAGE", message: userMessage });
      dispatch({ type: "ADD_MESSAGE", message: assistantMessage });
      dispatch({ type: "SET_LOADING", isLoading: true });

      let conversationId = stateRef.current.conversationId;

      if (!conversationId) {
        const created = await createConversation({
          title: "New chat",
          cluster_id: stateRef.current.selectedClusterId,
          autonomy: stateRef.current.autonomy,
          curriculum_mode: stateRef.current.curriculumMode,
        });

        if (created.error || !created.data) {
          toast.error(created.error ?? "Could not start chat");
          dispatch({
            type: "SET_STREAMING",
            id: assistantMsgId,
            isStreaming: false,
          });
          dispatch({ type: "SET_LOADING", isLoading: false });
          return;
        }

        conversationId = created.data.id;
        dispatch({ type: "SET_CONVERSATION_ID", id: conversationId });

        if (pathname === "/ai" || pathname.startsWith("/ai/c/")) {
          router.replace(`/ai/c/${conversationId}`);
        }
      }

      const apiMessages = stateRef.current.messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          role: m.role,
          content: m.content,
          attachments: m.attachments,
        }));

      let assistantContent = "";
      const assistantToolResults: ToolResultCard[] = [];

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
                attachments: hasAttachments ? attachments : undefined,
              },
            ],
            autonomy: stateRef.current.autonomy,
            selectedClusterId: stateRef.current.selectedClusterId,
            selectedClusterName: stateRef.current.selectedClusterName,
            curriculumMode: stateRef.current.curriculumMode,
            profile: stateRef.current.profile,
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
                assistantContent += event.value;
                dispatch({
                  type: "APPEND_TEXT",
                  id: assistantMsgId,
                  text: event.value,
                });
                break;
              case "tool_result":
                assistantToolResults.push(event.value);
                dispatch({
                  type: "ADD_TOOL_RESULT",
                  id: assistantMsgId,
                  card: event.value,
                });
                break;
              case "done":
                dispatch({
                  type: "SET_STREAMING",
                  id: assistantMsgId,
                  isStreaming: false,
                });
                dispatch({ type: "SET_LOADING", isLoading: false });
                break;
            }
          }
        }

        if (conversationId) {
          const persist = await appendChatTurn({
            conversationId,
            userMessage: {
              content: trimmed,
              attachments: hasAttachments ? attachments : undefined,
            },
            assistantMessage: {
              content: assistantContent,
              toolResults: assistantToolResults,
            },
            titleFromFirstMessage: isFirstTurn
              ? trimmed || "Image chat"
              : undefined,
          });

          if (persist.error) {
            console.error("Failed to save chat:", persist.error);
          } else if (historyOpen) {
            void refreshConversations();
          }
        }
      } catch {
        dispatch({
          type: "SET_STREAMING",
          id: assistantMsgId,
          isStreaming: false,
        });
        dispatch({ type: "SET_LOADING", isLoading: false });
      }
    },
    [historyOpen, pathname, refreshConversations, router],
  );

  const setAutonomy = useCallback((level: AutonomyLevel) => {
    dispatch({ type: "SET_AUTONOMY", autonomy: level });
  }, []);

  const setCluster = useCallback((id: string | null, name: string | null) => {
    dispatch({ type: "SET_CLUSTER", id, name });
  }, []);

  const setCurriculumMode = useCallback((val: boolean) => {
    dispatch({ type: "SET_CURRICULUM", curriculumMode: val });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      ...state,
      historyOpen,
      conversations,
      isLoadingHistory,
      setProfile,
      sendMessage,
      setAutonomy,
      setCluster,
      setCurriculumMode,
      newChat,
      openHistory,
      closeHistory,
      toggleHistory,
      refreshConversations,
      loadConversation,
    }),
    [
      state,
      historyOpen,
      conversations,
      isLoadingHistory,
      setProfile,
      sendMessage,
      setAutonomy,
      setCluster,
      setCurriculumMode,
      newChat,
      openHistory,
      closeHistory,
      toggleHistory,
      refreshConversations,
      loadConversation,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
