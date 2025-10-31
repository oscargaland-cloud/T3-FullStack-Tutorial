import { auth } from "~/server/auth";
import { prisma } from "~/server/db";
import { agentContext } from "~/server/agents/context";
import { todoAgent } from "../../../../../t3-fullstack/src/mastra/agents/todo-agent";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const raw = (body as any)?.message;
    const message =
      typeof raw === "string"
        ? raw.trim()
        : typeof raw?.text === "string"
          ? raw.text.trim()
          : "";

    if (!message) {
      return Response.json(
        { success: false, message: "Message is required" },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // Run agent within async context so tools can access userId
    const result = await agentContext.run({ userId }, async () => {
      const response = await todoAgent.stream([
        { role: "user", content: message },
      ]);

      let agentResponse = "";
      for await (const chunk of response.textStream) {
        agentResponse += chunk;
      }

      return agentResponse;
    });

    // ✅ reuse tRPC caller to get latest todos
    const { createCaller } = await import("~/server/api/root");

    const caller = createCaller({
      session: {
        user: { id: userId },
        expires: "",
      },
      prisma,
      headers: new Headers(),
    } as any);

    const todos = await caller.todo.all();

    return Response.json(
      {
        success: true,
        message: result || "Done.",
        todos: todos.map((todo: any) => ({
          id: todo.id,
          text: todo.text,
          done: todo.done,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Agent error:", error);
    return Response.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Agent failed unexpectedly",
      },
      { status: 500 },
    );
  }
}
