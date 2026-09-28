"use client";

import { useEffect, useState } from "react";
import { deletePost } from "@/actions/posts";
import { createClient } from "@/lib/supabase/client";

export function DeletePostButton({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) {
  const [mine, setMine] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setMine(data.user?.id === authorId));
  }, [authorId]);

  if (!mine) return null;

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
