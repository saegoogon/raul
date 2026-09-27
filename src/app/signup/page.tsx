"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-medium text-zinc-500">blacksmile</p>
      <h1 className="mb-2 text-2xl font-bold">Join tonight</h1>
      <p className="mb-6 text-sm text-zinc-500">
        No follow. Answer tonight&apos;s prompt and leave a black smile.
      </p>

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
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            title="Letters, numbers, underscore only"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

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
          {pending ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-950 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
