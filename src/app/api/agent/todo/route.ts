import { auth } from "~/server/auth";
import { runTodoAgentForUser } from "~/mastra/tools/todos";

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
    const { message } = body;

    if (!message) {
      return Response.json(
        { success: false, message: "Message is required" },
        { status: 400 },
      );
    }

    const { ai, todos } = await runTodoAgentForUser(session.user.id, message);

    return Response.json({
      success: true,
      message: ai,
      todos: todos.map((t) => ({ id: t.id, text: t.text, done: t.done })),
    }, { status: 200 });
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
