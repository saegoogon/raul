"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { signIn } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="font-display mb-6 text-3xl italic tracking-tight">Log in</h1>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-2xl border border-line bg-ink p-6"
      >
        {state?.error && (
          <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-paper">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-line bg-night px-3 py-2 text-paper outline-none focus:border-smile"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-paper">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-line bg-night px-3 py-2 text-paper outline-none focus:border-smile"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-smile py-2.5 font-medium text-night hover:bg-amber-200 disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-mute">
        New here?{" "}
        <Link href="/signup" className="font-medium text-smile hover:underline">
          Join
        </Link>
      </p>
    </div>
  );
}
