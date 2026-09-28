"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Mascot } from "@/components/Mascot";
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
      <div className="mb-5 flex flex-col items-center text-center">
        <Mascot size="md" bob priority />
        <p className="mt-2 text-sm font-semibold">
          <BrandMark />
        </p>
        <h1 className="mt-1 text-xl">Log in</h1>
      </div>

      <div className="surface flex flex-col gap-4 p-5">
        {oauthFailed && (
          <p className="rounded-2xl bg-red-950/50 px-3 py-2 text-sm text-red-300">
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
            <p className="rounded-2xl bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-paper">
              Email
            </label>
            <input id="email" name="email" type="email" required className="field" />
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
              className="field"
            />
          </div>

          <button type="submit" disabled={pending} className="btn-primary">
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
