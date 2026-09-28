"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { SocialLogin } from "@/components/SocialLogin";
import { signIn } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null);
  const [oauthFailed, setOauthFailed] = useState(false);

  useEffect(() => {
    setOauthFailed(
      new URLSearchParams(window.location.search).get("error") === "oauth",
    );
  }, []);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-semibold">
        <BrandMark />
      </p>
      <h1 className="mb-4 text-xl">Log in</h1>

      <div className="flex flex-col gap-4 border border-line bg-ink p-4">
        {oauthFailed && (
          <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
            Social login was canceled or is not set up yet.
          </p>
        )}
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
            {pending ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-mute">
        New here?{" "}
        <Link href="/signup" className="font-medium text-smile hover:underline">
          Join
        </Link>
      </p>
    </div>
  );
}
