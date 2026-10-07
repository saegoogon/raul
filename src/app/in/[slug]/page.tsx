import Link from "next/link";
import { notFound } from "next/navigation";
import { PostRow } from "@/components/community/PostRow";
import { SetupNote } from "@/components/community/SetupNote";
import { SortLinks } from "@/components/community/SortLinks";
import { getRoom, listPosts } from "@/lib/community/queries";
import { getCurrentUser } from "@/lib/user";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `in/${slug}` };
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const sort = query.sort === "new" ? "new" : "hot";
  const user = await getCurrentUser();
  const { room, status } = await getRoom(slug);
  if (status === "ok" && !room) notFound();
  const { posts } = await listPosts({ roomSlug: slug, sort });

  return (
    <main className="page-pad">
      <p className="kicker">in/{slug}</p>
      <h1 className="page-title">{room?.name ?? slug}</h1>
      <p className="lede">{room?.description}</p>
      <div className="hero-actions">
        {user ? (
          <Link href={`/submit?room=${slug}`} className="btn-primary">
            Post here
          </Link>
        ) : (
          <Link href="/login" className="btn-ghost">
            Log in to post
          </Link>
        )}
      </div>
      <SetupNote status={status} />
      <SortLinks base={`/in/${slug}`} sort={sort} />
      <div className="feed">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
