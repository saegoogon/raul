"use client";

import { useState } from "react";
import { createPost } from "@/actions/posts";
import { createClient } from "@/lib/supabase/client";
import {
  isVideoFile,
  MAX_FILE_MB,
  MAX_SHORT_SECONDS,
} from "@/lib/media";

function videoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Could not read video"));
    video.src = URL.createObjectURL(file);
  });
}

export function ShareForm({ placeholder }: { placeholder?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);

        const form = event.currentTarget;
        const caption = new FormData(form).get("caption") as string;

        if (!file && !caption.trim()) {
          setError("Add a photo, a short, or a caption.");
          return;
        }

        setPending(true);
        let mediaUrl = "";

        try {
          if (file) {
            if (file.size > MAX_FILE_MB * 1024 * 1024) {
              setError(`Keep files under ${MAX_FILE_MB}MB.`);
              setPending(false);
              return;
            }

            if (isVideoFile(file)) {
              const seconds = await videoDuration(file);
              if (seconds > MAX_SHORT_SECONDS) {
                setError("Shorts can be up to 60 seconds.");
                setPending(false);
                return;
              }
            }

            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              setError("Please log in again.");
              setPending(false);
              return;
            }

            const ext = file.name.split(".").pop() || "bin";
            const path = `${user.id}/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from("posts")
              .upload(path, file);

            if (uploadError) {
              setError(uploadError.message);
              setPending(false);
              return;
            }

            const {
              data: { publicUrl },
            } = supabase.storage.from("posts").getPublicUrl(path);
            mediaUrl = publicUrl;
          }

          const payload = new FormData();
          payload.set("caption", caption ?? "");
          payload.set("mediaUrl", mediaUrl);
          const result = await createPost(payload);
          if (result?.error) setError(result.error);
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "digest" in error &&
            String(error.digest).includes("NEXT_REDIRECT")
          ) {
            throw error;
          }
          setError("Upload failed. Try a smaller file.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-center">
        {preview && file && isVideoFile(file) ? (
          <video
            src={preview}
            className="max-h-[28rem] w-full object-contain"
            controls
            muted
            playsInline
          />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="max-h-[28rem] w-full object-contain"
          />
        ) : (
          <span className="px-6 text-sm text-zinc-500">
            Photo or a 60s short
            <br />
            <span className="text-zinc-400">
              사진이나 1분 숏폼을 올려보세요
            </span>
          </span>
        )}
        <input
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            setFile(next);
            setPreview(next ? URL.createObjectURL(next) : null);
            setError(null);
          }}
        />
      </label>

      <textarea
        name="caption"
        rows={3}
        maxLength={500}
        placeholder={placeholder ?? "What happened today? / 오늘 뭐 했나요?"}
        className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-900"
      />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-zinc-950 py-2.5 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Share"}
      </button>
    </form>
  );
}
