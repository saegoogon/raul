import { redirect } from "next/navigation";
import { RoomForm } from "@/app/rooms/new/RoomForm";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "New room" };

export default async function NewRoomPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <main className="page-pad" style={{ maxWidth: 28 * 16 }}>
      <h1 className="page-title">Create a room</h1>
      <p className="lede">Anyone can read. Members can post.</p>
      <RoomForm />
    </main>
  );
}
