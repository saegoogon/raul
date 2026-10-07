import Link from "next/link";
import { PostRow } from "@/components/community/PostRow";
import { SetupNote } from "@/components/community/SetupNote";
import { SortLinks } from "@/components/community/SortLinks";
import { listPosts, listRooms } from "@/lib/community/queries";
import { getCurrentUser } from "@/lib/user";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sort = params.sort === "new" ? "new" : "hot";
  const user = await getCurrentUser();
  const [{ posts, status }, { rooms }] = await Promise.all([listPosts({ sort }), listRooms()]);

  return (
    <main className="page-pad feed-layout">
      <section>
        <header className="feed-hero">
          <h1>BlackSmile</h1>
          <p className="lede">A community. Rooms, posts, comments, and votes.</p>
          <div className="hero-actions">
            {user ? (
              <Link href="/submit" className="btn-primary">
                New post
              </Link>
            ) : (
              <Link href="/signup" className="btn-primary">
                Sign up
              </Link>
            )}
            <Link href="/about" className="btn-ghost">
              About
            </Link>
          </div>
        </header>
        <SetupNote status={status} />
        <SortLinks base="/" sort={sort} />
        {posts.length ? (
          <div className="feed">
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </div>
        ) : status === "ok" ? (
          <p className="mute">No posts yet.</p>
        ) : null}
      </section>
      <aside className="room-rail">
        <h2>Rooms</h2>
        <ul>
          {rooms.map((room) => (
            <li key={room.id}>
              <Link href={`/in/${room.slug}`}>
                <strong>in/{room.slug}</strong>
                <span>{room.description}</span>
              </Link>
            </li>
          ))}
        </ul>
        {user ? (
          <Link href="/rooms/new" className="btn-ghost">
            Create a room
          </Link>
        ) : null}
      </aside>
    </main>
  );
}
