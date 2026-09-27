"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthState = { error?: string } | null;

function toKoreanError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "이메일이 아직 확인되지 않았어요. Supabase에서 Confirm email을 꺼 주세요.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "이메일 또는 비밀번호가 맞지 않아요.";
  }
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  }
  if (lower.includes("signups are disabled") || lower.includes("email signups")) {
    return "이메일 가입이 꺼져 있어요. Supabase Authentication에서 Email을 켜 주세요.";
  }
  return message;
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "서버 연결이 안 되어 있어요. Vercel 환경 변수를 확인해 주세요." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) return { error: toKoreanError(error.message) };
  if (!data.session) {
    return {
      error:
        "가입은 됐지만 이메일 확인이 켜져 있어요. Supabase에서 Confirm email을 끄고 로그인해 주세요.",
    };
  }
  redirect("/submit");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "서버 연결이 안 되어 있어요. Vercel 환경 변수를 확인해 주세요." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: toKoreanError(error.message) };
  redirect("/");
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  redirect("/");
}
