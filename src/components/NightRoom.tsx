import Link from "next/link";
import { DarkPresence } from "@/components/DarkPresence";
import { InviteNight } from "@/components/InviteNight";
import { Mascot } from "@/components/Mascot";

export function NightRoom() {
  return (
    <section className="surface px-4 py-5 sm:px-5">
      <div className="flex items-center gap-3">
        <Mascot size="sm" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base">Here tonight</h2>
          <div className="mt-0.5">
            <DarkPresence />
          </div>
        </div>
        <Link href="/play" className="btn-primary shrink-0 px-3 py-1.5 text-sm">
          Play
        </Link>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        You are BlackSmile. The first night is free. Talk, wait, spare.
      </p>
      <InviteNight className="mt-3 text-sm text-mute underline hover:text-paper" />
    </section>
  );
}
