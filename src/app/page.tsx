import { PostFeed } from "@/components/PostFeed";
import { getPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">인기 게시글</h1>
      <PostFeed posts={posts} />
    </div>
  );
}
