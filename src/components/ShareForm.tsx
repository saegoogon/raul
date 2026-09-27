"use client";

import { useState } from "react";
import { createPost } from "@/actions/posts";

export function ShareForm() {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form
      action={createPost}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="max-h-96 w-full object-contain"
          />
        ) : (
          <span className="px-6 text-sm text-zinc-500">
            Drop any photo of your day
            <br />
            <span className="text-zinc-400">아무 사진이나 올려도 돼요</span>
          </span>
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
      </label>

      <textarea
        name="caption"
        rows={3}
        maxLength={500}
        placeholder="What happened today? / 오늘 뭐 했나요?"
        className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
      />

      <button
        type="submit"
        className="rounded-full bg-zinc-950 py-2.5 font-medium text-white hover:bg-zinc-800"
      >
        Share
      </button>
    </form>
  );
}
