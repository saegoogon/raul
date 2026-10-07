import Link from "next/link";
import { SetupNote } from "@/components/community/SetupNote";
import { listRooms } from "@/lib/community/queries";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Rooms" };

export default async function RoomsPage() {
  const user = await getCurrentUser();
  const { rooms, status } = await listRooms();

  return (
    <main className="page-pad">
      <h1 className="page-title">Rooms</h1>
      <p className="lede">Anyone can read. Members can post.</p>
      {user ? (
        <div className="hero-actions">
          <Link href="/rooms/new" className="btn-primary">
            Create a room
          </Link>
        </div>
      ) : null}
      <SetupNote status={status} />
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/in/${room.slug}`}>
              <strong>in/{room.slug}</strong>
              <span>{room.name}</span>
              <em>{room.description}</em>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
