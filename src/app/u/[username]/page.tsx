import { notFound } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { PostFeed } from "@/components/PostFeed";
import { getPostsByUser, getProfile } from "@/lib/posts";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  const posts = await getPostsByUser(profile.id);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-zinc-950 px-6 py-8 text-white">
        <p className="text-sm text-amber-300">
          <BrandMark />
        </p>
        <h1 className="mt-1 text-2xl font-bold">{profile.username}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {posts.length} {posts.length === 1 ? "moment in the dark" : "moments in the dark"}
        </p>
      </section>
      <PostFeed posts={posts} />
    </div>
  );
}
