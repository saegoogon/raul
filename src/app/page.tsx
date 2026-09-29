import { GuestHero } from "@/components/GuestHero";
import { NightRoom } from "@/components/NightRoom";
import { getCurrentUser } from "@/lib/user";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-5">
      {user ? <NightRoom /> : <GuestHero />}
    </div>
  );
}
