"use client";

import { useActionState } from "react";
import { signIn, signUp } from "@/actions/auth";
import { SocialLogin } from "@/components/SocialLogin";

function Alert({ children }: { children: string }) {
  return <p className="text-sm text-warn">{children}</p>;
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-mute">
      <span className="h-px flex-1 bg-line" />
      또는 이메일
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1.5 block text-sm text-mute">
        {label}
      </label>
      <input required className="field" {...props} />
    </div>
  );
}

export function LoginForm({ oauthFailed }: { oauthFailed: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, null);
  return (
    <>
      {oauthFailed ? <Alert>소셜 로그인이 취소되었거나 아직 설정되지 않았습니다.</Alert> : null}
      <SocialLogin />
      <Divider />
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? <Alert>{state.error}</Alert> : null}
        <Field label="이메일" id="email" name="email" type="email" autoComplete="email" />
        <Field label="비밀번호" id="password" name="password" type="password" minLength={6} autoComplete="current-password" />
        <button type="submit" disabled={pending} className="btn-primary py-2.5">
          {pending ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, null);
  return (
    <>
      <SocialLogin />
      <Divider />
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? <Alert>{state.error}</Alert> : null}
        <Field
          label="사용자 이름"
          id="username"
          name="username"
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          title="영문, 숫자, 밑줄만 사용할 수 있습니다"
          autoComplete="username"
        />
        <Field label="이메일" id="email" name="email" type="email" autoComplete="email" />
        <Field label="비밀번호" id="password" name="password" type="password" minLength={6} autoComplete="new-password" />
        <button type="submit" disabled={pending} className="btn-primary py-2.5">
          {pending ? "만드는 중…" : "가입"}
        </button>
      </form>
    </>
  );
}
