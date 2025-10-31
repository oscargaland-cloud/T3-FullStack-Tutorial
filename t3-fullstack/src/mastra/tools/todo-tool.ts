import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Helper to create a tRPC caller with a specific userId
 * This reuses our existing todoRouter logic without duplicating Prisma code
 */
async function createTodoCaller(userId: string) {
  // Use dynamic import to avoid circular dependencies
  const { createTRPCContext } = await import("../../../../src/server/api/trpc");
  const { createCaller } = await import("../../../../src/server/api/root");
  const context = await createTRPCContext({ headers: new Headers() });
  
  // Override the session to use the provided userId
  const contextWithUserId = {
    ...context,
    session: {
      user: { id: userId },
      expires: "",
    },
  };
  
  return createCaller(contextWithUserId);
}

export const listTodosTool = createTool({
  id: "list-todos",
  description: "List all todos for the current user",
  inputSchema: z.object({}),
  outputSchema: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      done: z.boolean(),
    })
  ),
  execute: async ({ context }: { context: { userId: string } }) => {
    const caller = await createTodoCaller(context.userId);
    return caller.todo.all();
  },
});

export const addTodoTool = createTool({
  id: "add-todo",
  description: "Create a new todo item",
  inputSchema: z.object({
    text: z.string().describe("The text content of the todo item (e.g. 'buy milk')"),
  }),
  outputSchema: z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
  }),
  execute: async ({
    context,
    input,
  }: {
    context: { userId: string };
    input: { text: string };
  }) => {
    const caller = await createTodoCaller(context.userId);
    return caller.todo.create(input.text);
  },
});

export const toggleTodoTool = createTool({
  id: "toggle-todo",
  description:
    "Mark a todo as done or not done. First call listTodos to find the correct todo id.",
  inputSchema: z.object({
    id: z.string().describe("The id of the todo to toggle"),
    done: z
      .boolean()
      .describe("true to mark as done, false to mark as not done"),
  }),
  outputSchema: z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
  }),
  execute: async ({
    context,
    input,
  }: {
    context: { userId: string };
    input: { id: string; done: boolean };
  }) => {
    const caller = await createTodoCaller(context.userId);
    return caller.todo.toggle(input);
  },
});

export const deleteTodoTool = createTool({
  id: "delete-todo",
  description:
    "Delete a todo. First call listTodos to find the correct todo id.",
  inputSchema: z.object({
    id: z.string().describe("The id of the todo to delete"),
  }),
  outputSchema: z.object({}),
  execute: async ({
    context,
    input,
  }: {
    context: { userId: string };
    input: { id: string };
  }) => {
    const caller = await createTodoCaller(context.userId);
    return caller.todo.delete(input.id);
  },
});

