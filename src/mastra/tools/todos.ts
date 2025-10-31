import { createCaller } from "~/server/api/root";
import { prisma } from "~/server/db";
import { agentContext } from "~/server/agents/context";

function getCaller(userId: string) {
  return createCaller(async () => ({
    session: { user: { id: userId }, expires: "" },
    prisma,
    db: prisma,
    headers: new Headers(),
  }));
}

export async function listTodos(userId: string) {
  const caller = getCaller(userId);
  return caller.todo.all();
}

export async function addTodo(userId: string, text: string) {
  const caller = getCaller(userId);
  return caller.todo.create(text);
}

export async function toggleTodo(userId: string, id: string, done: boolean) {
  const caller = getCaller(userId);
  return caller.todo.toggle({ id, done });
}

export async function deleteTodo(userId: string, id: string) {
  const caller = getCaller(userId);
  return caller.todo.delete(id);
}

export async function runTodoAgentForUser(userId: string, message: string) {
  // Dynamic import to avoid circular dependencies
  const { todoAgent } = await import("@mastra/agents/todo-agent");
  
  // Wrap agent execution in AsyncLocalStorage context so tools can access userId
  const result = await agentContext.run({ userId }, async () => {
    return await todoAgent.generate(message);
  });

  // 2) After the agent acts, get the latest todos for that user
  const caller = createCaller(async () => ({
    session: {
      user: { id: userId },
      expires: "",
    },
    prisma,
    db: prisma,
    headers: new Headers(),
  }));

  const todos = await caller.todo.all();

  return {
    ai: (result as any)?.output ?? (result as any)?.text ?? "Done.",
    todos,
  };
}



