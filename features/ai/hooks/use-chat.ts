"use client";

import { useCallback, useReducer, useRef } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { parseAiApiError, UPGRADE_TOAST } from "@/lib/ai/constants";
import type {
  AutonomyLevel,
  ChatState,
  Message,
  Profile,
  ToolResultCard,
} from "@/features/ai/types";

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
  | { type: "CLEAR_MESSAGES" };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  autonomy: "assisted",
  selectedClusterId: null,
  selectedClusterName: null,
  curriculumMode: false,
  profile: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
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
    case "CLEAR_MESSAGES":
      return { ...state, messages: [] };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setProfile = useCallback((profile: Profile) => {
    dispatch({ type: "SET_PROFILE", profile });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || stateRef.current.isLoading || !stateRef.current.profile) {
      return;
    }

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: trimmed,
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

    const apiMessages = stateRef.current.messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: trimmed }],
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
              dispatch({
                type: "APPEND_TEXT",
                id: assistantMsgId,
                text: event.value,
              });
              break;
            case "tool_result":
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
    } catch {
      dispatch({
        type: "SET_STREAMING",
        id: assistantMsgId,
        isStreaming: false,
      });
      dispatch({ type: "SET_LOADING", isLoading: false });
    }
  }, []);

  const setAutonomy = useCallback((level: AutonomyLevel) => {
    dispatch({ type: "SET_AUTONOMY", autonomy: level });
  }, []);

  const setCluster = useCallback((id: string | null, name: string | null) => {
    dispatch({ type: "SET_CLUSTER", id, name });
  }, []);

  const setCurriculumMode = useCallback((val: boolean) => {
    dispatch({ type: "SET_CURRICULUM", curriculumMode: val });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    autonomy: state.autonomy,
    selectedClusterId: state.selectedClusterId,
    selectedClusterName: state.selectedClusterName,
    curriculumMode: state.curriculumMode,
    profile: state.profile,
    setProfile,
    sendMessage,
    setAutonomy,
    setCluster,
    setCurriculumMode,
  };
}
