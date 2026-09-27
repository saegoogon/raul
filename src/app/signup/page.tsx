"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-1 text-sm font-medium text-zinc-500">blacksmile</p>
      <h1 className="mb-6 text-2xl font-bold">가입</h1>

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
            사용자 이름
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            title="영문, 숫자, 밑줄만 사용 가능"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            이메일
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
            비밀번호
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
          {pending ? "가입 중..." : "가입하기"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-zinc-950 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
