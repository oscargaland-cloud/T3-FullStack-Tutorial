import { auth } from "~/server/auth";
import { todoAgent } from "../../../../../t3-fullstack/src/mastra/agents/todo-agent";

export async function POST(request: Request) {
  try {
    // Get current session
    const session = await auth();

    if (!session?.user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body and normalize message
    const body = (await request.json()) as unknown;
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
        { status: 400 }
      );
    }
    
    // Resolve userId (already authorized above)
    const userId = session.user.id;

    // Run the agent with the user's message and userId in context
    // Build a well-typed message payload
    const messages = [{ role: "user" as const, content: message }];

    const result = await todoAgent.generate(
      messages as any,
      { context: { userId } } as any
    );

    // Get the final todos to return
    const caller = await import("~/server/api/root").then((m) =>
      m.createCaller({
        headers: new Headers(),
        prisma: {} as any,
        session: {
          user: { id: userId },
          expires: "",
        },
      })
    );
    const todos = await caller.todo.all();

    return Response.json({
      success: true,
      message: result.text,
      todos: todos.map((todo: any) => ({
        id: todo.id,
        text: todo.text,
        done: todo.done,
      })),
    });
  } catch (error) {
    console.error("Agent error:", error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

