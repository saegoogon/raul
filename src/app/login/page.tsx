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
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">로그인</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-ink p-6">
        {oauthFailed && (
          <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
            소셜 로그인이 취소됐거나 아직 설정되지 않았어요.
          </p>
        )}
        <SocialLogin />
        <div className="flex items-center gap-3 text-xs text-mute">
          <span className="h-px flex-1 bg-line" />
          또는 이메일
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
              이메일
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
              비밀번호
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
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-mute">
        처음인가요?{" "}
        <Link href="/signup" className="font-medium text-smile hover:underline">
          가입
        </Link>
      </p>
    </div>
  );
}
