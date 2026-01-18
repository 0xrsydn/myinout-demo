import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Bot, User, Sparkles } from "lucide-react";
import { useChat, type ChatMessage } from "../hooks/useChat";
import { MarkdownMessage } from "../components/MarkdownMessage";

const DEFAULT_POCKET_ID = "pocket_123";

const SUGGESTED_PROMPTS = [
  {
    label: "Analisis pengeluaran",
    prompt: "Analisis pola pengeluaran saya dan berikan insight",
  },
  {
    label: "Top pengeluaran",
    prompt: "Apa saja kategori pengeluaran terbesar saya?",
  },
  {
    label: "Cashflow bulanan",
    prompt: "Bagaimana tren cashflow bulanan saya?",
  },
  {
    label: "Tips menabung",
    prompt: "Berikan tips untuk meningkatkan tabungan berdasarkan data saya",
  },
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>

      {/* Message */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.toolsUsed.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                <Sparkles className="h-3 w-3" />
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <Bot className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      </div>
    </div>
  );
}

export function Chatbot() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    pocketId: DEFAULT_POCKET_ID,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput("");
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Financial Assistant
          </h1>
          <p className="text-sm text-gray-500">
            Tanya apapun tentang data keuangan Anda
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Trash2 className="h-4 w-4" />
            Clear chat
          </button>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Halo! Saya asisten keuangan Anda
            </h2>
            <p className="mb-8 max-w-md text-center text-sm text-gray-500">
              Saya dapat membantu menganalisis data transaksi, memberikan insight
              pengeluaran, dan menjawab pertanyaan seputar keuangan Anda.
            </p>

            {/* Suggested Prompts */}
            <div className="grid gap-3 sm:grid-cols-2">
              {SUGGESTED_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSuggestedPrompt(item.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Quick prompts when chatting */}
          {messages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSuggestedPrompt(item.prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
