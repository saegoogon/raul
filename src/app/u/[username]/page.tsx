import { notFound } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
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
      <section className="rounded-2xl border border-line bg-ink px-6 py-8">
        <p className="text-sm font-semibold">
          <BrandMark />
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {profile.username}
        </h1>
        <p className="mt-2 text-sm text-mute">
          {posts.length} {posts.length === 1 ? "moment in the dark" : "moments in the dark"}
        </p>
      </section>
      <PostFeed posts={posts} />
    </div>
  );
}
