"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [devEmail, setDevEmail] = useState("dev@example.com");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">Sign in</h1>

      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn("email", {
            email,
            redirect: true,
            callbackUrl: "/",
          });
        }}
      >
        <label className="text-sm">Email</label>
        <input
          className="rounded border px-3 py-2 text-black"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Send magic link
        </button>
        <p className="text-xs opacity-80">
          In development the magic link is printed in the terminal.
        </p>
      </form>

      <div className="flex w-full max-w-sm flex-col gap-3 border-t pt-6">
        <h2 className="font-semibold">Dev login</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border px-3 py-2 text-black"
            type="email"
            value={devEmail}
            onChange={(e) => setDevEmail(e.target.value)}
          />
          <button
            className="rounded bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-800"
            onClick={async () => {
              await signIn("credentials", {
                email: devEmail,
                redirect: true,
                callbackUrl: "/",
              });
            }}
          >
            Sign in
          </button>
        </div>
        <p className="text-xs opacity-80">Uses the dev-only Credentials provider.</p>
      </div>
    </main>
  );
}


