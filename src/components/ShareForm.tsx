"use client";

import { useState } from "react";
import { createPost } from "@/actions/posts";
import { useAuth } from "@/components/Providers";
import { isVideoFile, MAX_FILE_MB } from "@/lib/media";
import { uploadErrorMessage, uploadPostFile } from "@/lib/upload";

export function ShareForm() {
  const { userId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-line bg-ink p-6"
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
        setProgress(0);
        let mediaUrl = "";

        try {
          if (file) {
            if (file.size > MAX_FILE_MB * 1024 * 1024) {
              setError("파일이 50MB보다 커요. 영상을 작게 저장한 뒤 올려 주세요.");
              setPending(false);
              return;
            }

            if (!userId) {
              setError("Please log in again.");
              setPending(false);
              return;
            }

            const ext = file.name.split(".").pop() || "bin";
            const path = `${userId}/${Date.now()}.${ext}`;
            mediaUrl = await uploadPostFile(path, file, setProgress);
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
          setError(uploadErrorMessage(error));
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-night text-center">
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
          <span className="px-6 text-sm text-mute">
            Photo or video
            <br />
            <span className="text-mute/70">
              사진이나 영상, 최대 50MB
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
            if (next && next.size > MAX_FILE_MB * 1024 * 1024) {
              setError("파일이 50MB보다 커요. 영상을 작게 저장한 뒤 올려 주세요.");
            } else {
              setError(null);
            }
          }}
        />
      </label>

      <textarea
        name="caption"
        rows={3}
        maxLength={500}
        placeholder="What happened today? / 오늘 뭐 했나요?"
        className="w-full rounded-xl border border-line bg-night px-3 py-2 text-paper outline-none placeholder:text-mute focus:border-smile"
      />

      {error && (
        <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-smile py-2.5 font-medium text-night hover:bg-amber-200 disabled:opacity-50"
      >
        {pending
          ? progress > 0
            ? `올리는 중 ${progress}%`
            : "올리는 중..."
          : "올리기"}
      </button>
    </form>
  );
}
