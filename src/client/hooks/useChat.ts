import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface UseChatOptions {
  pocketId: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat({ pocketId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Prepare history for API (exclude the message we just added)
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch("/api/v1/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            pocket_id: pocketId,
            history,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to send message");
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          toolsUsed: data.data.tools_used,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);

        // Add error message as assistant response
        const errorAssistantMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Maaf, terjadi kesalahan: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, pocketId, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
