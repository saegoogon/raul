"use client";

import { useState } from "react";
import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type SocialProvider = "google" | "naver";

const oauthProvider: Record<SocialProvider, Provider> = {
  google: "google",
  naver: "custom:naver",
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.2 2.8-2.5 3.6v3h4c2.4-2.2 3.5-5.4 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1 7.9-2.8l-4-3c-1.1.8-2.5 1.2-3.9 1.2-3 0-5.6-2-6.5-4.8H1.4v3.1C3.4 21.4 7.4 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.5 14.6c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7.1H1.4C.5 8.9 0 10.4 0 12.4s.5 3.5 1.4 5.3l4.1-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.5l4.1 3.1C6.4 6.8 9 4.8 12 4.8z"
      />
    </svg>
  );
}

function NaverMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M14.4 12.5 9.2 5H5v14h4.6v-7.5L14.8 19H19V5h-4.6v7.5z"
      />
    </svg>
  );
}

export function SocialLogin() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<SocialProvider | null>(null);

  const start = async (provider: SocialProvider) => {
    setError(null);
    setPending(provider);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: oauthProvider[provider],
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams:
            provider === "google"
              ? { access_type: "offline", prompt: "select_account" }
              : undefined,
        },
      });
      if (oauthError) {
        setError(
          provider === "naver"
            ? "Naver login is not enabled yet."
            : "Google login is not enabled yet.",
        );
        setPending(null);
      }
    } catch {
      setError("Could not start social login. Try again.");
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => void start("google")}
        className="flex items-center justify-center gap-2 border border-line bg-paper px-3 py-2 text-sm text-night disabled:opacity-50"
      >
        <GoogleMark />
        {pending === "google" ? "Opening Google..." : "Continue with Google"}
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => void start("naver")}
        className="flex items-center justify-center gap-2 border border-[#03C75A] bg-[#03C75A] px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        <NaverMark />
        {pending === "naver" ? "Opening Naver..." : "Continue with Naver"}
      </button>
    </div>
  );
}
