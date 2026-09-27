"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GuestHero() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setShow(false);
      });
  }, []);

  if (!show) return null;

  return (
    <section className="rounded-3xl bg-zinc-950 px-6 py-10 text-white">
      <p className="text-sm font-medium text-amber-300">blacksmile</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        A smile
        <br />
        in the dark.
      </h1>
      <p className="mt-3 max-w-lg text-sm text-zinc-300">
        No follow. Just tonight, and a black smile on a real moment.
        <br />
        팔로우 없이, 오늘 밤의 순간에 검은 웃음만 남기세요.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
        >
          Join free
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-zinc-600 px-5 py-2 text-sm text-white hover:border-zinc-400"
        >
          Log in
        </Link>
      </div>
    </section>
  );
}
