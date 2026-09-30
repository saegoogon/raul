"use client";

import { useActionState } from "react";
import { signIn, signUp } from "@/actions/auth";
import { SocialLogin } from "@/components/SocialLogin";

function Alert({ children }: { children: string }) {
  return <p className="rounded-2xl border border-line bg-night px-3 py-2 text-sm text-mute">{children}</p>;
}

function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-mute">
      <span className="h-px flex-1 bg-line" />
      or email
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium">
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
      {oauthFailed ? <Alert>Social login was canceled or is not set up yet.</Alert> : null}
      <SocialLogin />
      <Divider />
      <form action={formAction} className="flex flex-col gap-4">
        {state?.error ? <Alert>{state.error}</Alert> : null}
        <Field label="Email" id="email" name="email" type="email" autoComplete="email" />
        <Field label="Password" id="password" name="password" type="password" minLength={6} autoComplete="current-password" />
        <button type="submit" disabled={pending} className="btn-primary py-2.5">
          {pending ? "Logging in…" : "Log in"}
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
          label="Username"
          id="username"
          name="username"
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          title="Letters, numbers, underscore only"
          autoComplete="username"
        />
        <Field label="Email" id="email" name="email" type="email" autoComplete="email" />
        <Field label="Password" id="password" name="password" type="password" minLength={6} autoComplete="new-password" />
        <button type="submit" disabled={pending} className="btn-primary py-2.5">
          {pending ? "Creating…" : "Create account"}
        </button>
      </form>
    </>
  );
}
