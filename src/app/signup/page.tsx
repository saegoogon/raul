"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SocialLogin } from "@/components/SocialLogin";
import { signUp } from "@/actions/auth";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="mb-4 text-xl">Join</h1>

      <div className="flex flex-col gap-4 border border-line bg-ink p-4">
        <SocialLogin />
        <div className="flex items-center gap-3 text-xs text-mute">
          <span className="h-px flex-1 bg-line" />
          or email
          <span className="h-px flex-1 bg-line" />
        </div>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-paper">
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
              className="w-full border border-line bg-night px-3 py-2 text-paper outline-none focus:border-smile"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-paper">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-line bg-night px-3 py-2 text-paper outline-none focus:border-smile"
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
              className="w-full border border-line bg-night px-3 py-2 text-paper outline-none focus:border-smile"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="border border-smile bg-smile py-2 text-night disabled:opacity-50"
          >
            {pending ? "Creating..." : "Join"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-mute">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-smile hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
