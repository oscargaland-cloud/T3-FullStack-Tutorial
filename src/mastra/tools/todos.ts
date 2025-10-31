// src/mastra/tools/todos.ts  (adjust path if yours is different)

import { createCaller } from "~/server/api/root";
import { prisma } from "~/server/db";
import { agentContext } from "~/server/agents/context";

// build a tRPC caller for a specific user
function getCaller(userId: string) {
  return createCaller(async () => ({
    session: { user: { id: userId }, expires: "" },
    prisma,
    db: prisma, // some parts of your app use ctx.db, others ctx.prisma
    headers: new Headers(),
  }));
}

// list todos for this user
export async function listTodos(userId: string) {
  const caller = getCaller(userId);
  return caller.todo.all();
}

// create todo for this user
export async function addTodo(userId: string, text: string) {
  const caller = getCaller(userId);
  return caller.todo.create(text);
}

// toggle todo
export async function toggleTodo(userId: string, id: string, done: boolean) {
  const caller = getCaller(userId);
  return caller.todo.toggle({ id, done });
}

// delete todo
export async function deleteTodo(userId: string, id: string) {
  const caller = getCaller(userId);
  return caller.todo.delete(id);
}

// run the Mastra agent WITH user runtime context
export async function runTodoAgentForUser(userId: string, message: string) {
  // Dynamic import to avoid circular dependencies
  const { todoAgent } = await import("../../../t3-fullstack/src/mastra/agents/todo-agent");

  // Wrap agent execution in AsyncLocalStorage context so tools can access userId
  const result = await agentContext.run({ userId }, async () => {
    return await todoAgent.generate(message);
  });

  // ✅ after the agent acts, get the latest todos for this user
  const caller = getCaller(userId);
  const todos = await caller.todo.all();

  return {
    ai: (result as any)?.output ?? (result as any)?.text ?? "Done.",
    todos,
  };
}





