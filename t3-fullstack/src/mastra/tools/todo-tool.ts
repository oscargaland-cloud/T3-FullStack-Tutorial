// src/mastra/tools/todo-tool.ts

import { createTool } from "@mastra/core";
import { z } from "zod";

/**
 * Helper to create a tRPC caller with a specific userId
 * This reuses our existing todoRouter logic without duplicating Prisma code
 */
async function createTodoCaller(userId: string) {
  // Use dynamic import to avoid circular dependencies
  const { createCaller } = await import("../../../../src/server/api/root");
  const { prisma } = await import("../../../../src/server/db");

  // createCaller expects an async function that returns context
  const caller = createCaller(async () => ({
    session: {
      user: { id: userId },
      expires: "",
    },
    prisma,
    db: prisma, // Add db alias
    headers: new Headers(),
  }));

  return caller;
}

// Helper to get userId from context (AsyncLocalStorage)
async function getUserId(): Promise<string> {
  const { getAgentUserId } = await import(
    "../../../../src/server/agents/context"
  );
  return getAgentUserId();
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
    }),
  ),
  execute: async () => {
    try {
      const userId = await getUserId();
      console.log("listTodos - userId:", userId);
      const caller = await createTodoCaller(userId);
      const todos = await caller.todo.all();
      console.log("listTodos - todos:", todos);
      return todos;
    } catch (error) {
      console.error("listTodos error:", error);
      throw error;
    }
  },
});

export const addTodoTool = createTool({
  id: "add-todo",
  description: "Create a new todo item",
  inputSchema: z.object({
    text: z
      .string()
      .describe("The text content of the todo item (e.g. 'buy milk')"),
  }),
  outputSchema: z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const userId = await getUserId();
      console.log("addTodo - userId:", userId, "text:", context.text);
      const caller = await createTodoCaller(userId);
      const todo = await caller.todo.create(context.text);
      console.log("addTodo - result:", todo);
      return todo;
    } catch (error) {
      console.error("addTodo error:", error);
      throw error;
    }
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
  execute: async ({ context }) => {
    const userId = await getUserId();
    const caller = await createTodoCaller(userId);
    return caller.todo.toggle(context);
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
  execute: async ({ context }) => {
    const userId = await getUserId();
    const caller = await createTodoCaller(userId);
    return caller.todo.delete(context.id);
  },
});


