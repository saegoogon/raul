"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthState = { error?: string } | null;

function toAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Email is not confirmed yet. Turn off Confirm email in Supabase.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Wrong email or password.";
  }
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "That email is already signed up. Log in.";
  }
  if (lower.includes("signups are disabled") || lower.includes("email signups")) {
    return "Email signups are off. Enable Email in Supabase Authentication.";
  }
  return message;
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Server is not connected. Check Vercel env vars." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) return { error: toAuthError(error.message) };
  if (!data.session) {
    return {
      error:
        "Account created, but email confirm is on. Turn it off in Supabase, then log in.",
    };
  }
  redirect("/drive");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { error: "Server is not connected. Check Vercel env vars." };
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: toAuthError(error.message) };
  redirect("/drive");
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
