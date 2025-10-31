import { auth } from "~/server/auth";
import { TodoForm } from "../_components/todo-form";
import { TodoList } from "../_components/todo-list";
import { TodoAgentChat } from "../_components/todo-agent-chat";

export default async function TodosPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <p className="text-white">Please sign in to manage your todos.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-b from-[#2e026d] to-[#15162c] p-6 text-white">
      <h1 className="text-2xl font-bold">Your Todos</h1>
      <p className="text-gray-300">Logged in as {session.user?.name ?? session.user?.email}</p>
      <TodoAgentChat />
      <TodoForm />
      <TodoList />
    </main>
  );
}
