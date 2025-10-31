"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function TodoAgentChat() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const utils = api.useUtils();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/agent/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data?.success) {
        setResponse(data.message ?? "Done.");
        void utils.todo.all.invalidate();
      } else {
        setResponse(data?.message ?? "Something went wrong");
      }
    } catch (err) {
      setResponse(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  }

  return (
    <section className="w-full max-w-md rounded-lg border bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-semibold">AI Agent</h2>
      <p className="mb-3 text-sm text-gray-600">
        Try: "add buy milk", "what are my todos?", "mark the first one done".
      </p>
      <form className="mb-3 flex gap-2" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="Talk to the agent..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="rounded bg-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {isLoading ? "…" : "Send"}
        </button>
      </form>
      {response && (
        <div className="rounded bg-gray-50 p-3 text-sm text-gray-800">{response}</div>
      )}
    </section>
  );
}


