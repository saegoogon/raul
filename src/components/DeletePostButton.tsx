"use client";

import { deletePost } from "@/actions/posts";
import { useAuth } from "@/components/Providers";

export function DeletePostButton({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) {
  const { userId } = useAuth();
  if (!userId || userId !== authorId) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Delete this post?")) void deletePost(postId);
      }}
      className="text-xs text-mute hover:text-rose-400"
    >
      Delete
    </button>
  );
}
