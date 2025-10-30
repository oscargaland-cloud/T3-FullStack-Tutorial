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
        className="rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={createTodo.isPending}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {createTodo.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
