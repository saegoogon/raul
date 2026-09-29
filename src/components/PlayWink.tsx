"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { winkTonight } from "@/actions/wink";
import { Mascot } from "@/components/Mascot";

export function PlayWink({
  rank,
  score,
}: {
  rank: number | null;
  score: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const play = () => {
    start(async () => {
      const result = await winkTonight();
      if (result.error === "login") {
        router.push("/login");
        return;
      }
      if (result.error === "wait") {
        setMessage("Too fast. Blink, then wink.");
        return;
      }
      if (result.error === "limit") {
        setMessage("That is enough winks for tonight.");
        return;
      }
      if (result.error === "setup") {
        setMessage("Winks are not open yet. Smiles still count.");
        return;
      }
      setMessage(null);
      router.refresh();
    });
  };

  return (
    <section className="surface overflow-hidden px-5 py-6 text-center">
      <button type="button" disabled={pending} className="mx-auto block" onClick={play}>
        <Mascot size="xl" pose="wait" bob={!pending} className="mx-auto" />
      </button>
      <p className="mt-2 text-sm text-mute">
        {rank
          ? `You are #${rank} with ${score} points`
          : "Wink to enter tonight"}
      </p>
      <button
        type="button"
        disabled={pending}
        className="btn-primary mt-4 text-sm"
        onClick={play}
      >
        {pending ? "Winking..." : "Wink"}
      </button>
      {message ? <p className="mt-3 text-sm text-mute">{message}</p> : null}
    </section>
  );
}
