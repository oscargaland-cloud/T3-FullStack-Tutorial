"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function TodoAgentChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const utils = api.useUtils();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/agent/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data?.success) {
        const assistantMessage: ChatMessage = { 
          role: "assistant", 
          content: data.message ?? "Done." 
        };
        setMessages((prev) => [...prev, assistantMessage]);
        void utils.todo.all.invalidate();
      } else {
        const assistantMessage: ChatMessage = { 
          role: "assistant", 
          content: data?.message ?? "Something went wrong" 
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const assistantMessage: ChatMessage = { 
        role: "assistant", 
        content: err instanceof Error ? err.message : "Network error" 
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <h2 className="mb-2 text-lg font-semibold text-white">AI Agent</h2>
      <p className="mb-3 text-sm text-gray-300">
        Try: "add buy milk", "what are my todos?", "mark the first one done".
      </p>
      
      {/* Chat Messages */}
      <div className="mb-3 max-h-60 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">Start a conversation...</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-2 text-sm ${
              msg.role === "user"
                ? "ml-auto w-3/4 bg-purple-500/20 text-white"
                : "mr-auto w-3/4 bg-white/10 text-white"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto w-3/4 rounded-lg bg-white/10 p-2 text-sm text-white">
            Thinking...
          </div>
        )}
      </div>
      
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-gray-400"
          placeholder="Talk to the agent..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          style={{ color: 'white' }}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="rounded bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}


