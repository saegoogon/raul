"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { signIn } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-medium text-zinc-500">
        <BrandMark />
      </p>
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6"
      >
        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-950 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        New here?{" "}
        <Link href="/signup" className="font-medium text-zinc-950 hover:underline">
          Join
        </Link>
      </p>
    </div>
  );
}
