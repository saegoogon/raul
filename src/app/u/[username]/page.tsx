import { notFound } from "next/navigation";
import { PostRow } from "@/components/community/PostRow";
import { getProfileByUsername, listPosts } from "@/lib/community/queries";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const { posts } = await listPosts({ username, sort: "new" });

  return (
    <main className="page-pad">
      <h1 className="page-title">@{profile.username}</h1>
      <p className="mute">Joined {new Date(profile.created_at).toLocaleDateString("en-US")}</p>
      <div className="feed" style={{ marginTop: 32 }}>
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>
      {!posts.length ? <p className="mute">No posts yet.</p> : null}
    </main>
  );
}
