import { notFound } from "next/navigation";
import { PostFeed } from "@/components/PostFeed";
import { getCurrentUser, getPostsByUser, getProfile } from "@/lib/posts";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [profile] = await Promise.all([
    getProfile(username),
    getCurrentUser(),
  ]);
  if (!profile) notFound();

  const posts = await getPostsByUser(profile.id);

  return (
    <div className="flex flex-col gap-5">
      <section className="border border-line bg-ink p-4">
        <h1 className="text-xl">{profile.username}</h1>
        <p className="mt-1 text-sm text-mute">
          {posts.length} {posts.length === 1 ? "moment" : "moments"}
        </p>
      </section>
      <PostFeed posts={posts} />
    </div>
  );
}
