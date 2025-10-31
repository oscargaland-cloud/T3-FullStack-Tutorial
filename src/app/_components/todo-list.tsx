"use client";

import { api } from "~/trpc/react";

export function TodoList() {
  const utils = api.useUtils();

  const { data: todos, isLoading } = api.todo.all.useQuery();

  const toggle = api.todo.toggle.useMutation({
    // ✅ Optimistic Toggle
    onMutate: async (vars) => {
      await utils.todo.all.cancel();
      const prev = utils.todo.all.getData();
      utils.todo.all.setData(undefined, (old) =>
        (old ?? []).map((t) => (t.id === vars.id ? { ...t, done: vars.done } : t)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && utils.todo.all.setData(undefined, ctx.prev),
    onSettled: () => void utils.todo.all.invalidate(),
  });

  const del = api.todo.delete.useMutation({
    // ✅ Optimistic Delete
    onMutate: async (id) => {
      await utils.todo.all.cancel();
      const prev = utils.todo.all.getData();
      utils.todo.all.setData(undefined, (old) => (old ?? []).filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && utils.todo.all.setData(undefined, ctx.prev),
    onSettled: () => void utils.todo.all.invalidate(),
  });

  if (isLoading) return <p className="text-gray-300">Loading…</p>;
  if (!todos?.length) return <p className="text-gray-300">No todos yet.</p>;

  return (
    <ul className="w-full max-w-md divide-y divide-white/20 rounded border border-white/20 bg-white/10">
      {todos.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 p-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={t.done}
              onChange={(e) => toggle.mutate({ id: t.id, done: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-white/10 text-white"
            />
            <span className={t.done ? "line-through text-gray-400" : "text-white"}>{t.text}</span>
          </label>

          <button
            onClick={() => del.mutate(t.id)}
            className="rounded bg-red-500/50 px-3 py-1 text-white transition hover:bg-red-500/70"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
