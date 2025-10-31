"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function TodoForm() {
  const [text, setText] = useState("");
  const utils = api.useUtils();

  const createTodo = api.todo.create.useMutation({
    // ✅ Optimistic Create
    onMutate: async (newText) => {
      await utils.todo.all.cancel();
      const prev = utils.todo.all.getData();

      const optimistic = [
        ...(prev ?? []),
        {
          id: "optimistic-" + Date.now(),
          text: newText,
          done: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "optimistic",
        },
      ];
      utils.todo.all.setData(undefined, optimistic);

      return { prev };
    },
    onError: (_err, _newText, ctx) => {
      if (ctx?.prev) utils.todo.all.setData(undefined, ctx.prev);
    },
    onSettled: () => {
      // ensure server is the source of truth after mutation
      void utils.todo.all.invalidate();
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        createTodo.mutate(trimmed);
        setText("");
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo"
        className="rounded border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-gray-400"
        style={{ color: 'white' }}
      />
      <button
        type="submit"
        disabled={createTodo.isPending}
        className="rounded bg-white/10 px-4 py-2 text-white transition hover:bg-white/20 disabled:opacity-50"
      >
        {createTodo.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
