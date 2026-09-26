"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) return { error: error.message };
  if (!data.session) {
    return {
      error:
        "가입은 됐지만 이메일 확인이 켜져 있어요. Supabase에서 Confirm email을 끄고 다시 로그인해 주세요.",
    };
  }
  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("email not confirmed")) {
      return {
        error:
          "이메일이 아직 확인되지 않았어요. Supabase Authentication에서 Confirm email을 끄면 바로 로그인됩니다.",
      };
    }
    if (message.includes("invalid login")) {
      return { error: "이메일 또는 비밀번호가 맞지 않아요." };
    }
    return { error: error.message };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
