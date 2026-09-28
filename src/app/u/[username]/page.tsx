import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
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
      <section className="surface flex items-center gap-4 px-5 py-6">
        <Avatar size={72} />
        <div>
          <h1 className="text-xl">{profile.username}</h1>
          <p className="mt-1 text-sm text-mute">
            {posts.length} {posts.length === 1 ? "moment tonight" : "moments tonight"}
          </p>
        </div>
      </section>
      <PostFeed posts={posts} />
    </div>
  );
}
