import { auth } from "~/server/auth";
import { TodoForm } from "../_components/todo-form";
import { TodoList } from "../_components/todo-list";

export default async function TodosPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-700">Please sign in to manage your todos.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-gray-100 p-6">
      <h1 className="text-2xl font-bold">Your Todos</h1>
      <p className="text-gray-600">Logged in as {session.user?.name ?? session.user?.email}</p>
      <TodoForm />
      <TodoList />
    </main>
  );
}
