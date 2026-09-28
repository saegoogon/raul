"use client";

import { useState } from "react";
import { createPost } from "@/actions/posts";
import { Mascot } from "@/components/Mascot";
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
      className="surface flex flex-col gap-4 p-5"
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
              setError("File is over 50MB. Compress the video and try again.");
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
      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-night text-center">
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
          <span className="flex flex-col items-center gap-3 px-6 text-sm text-mute">
            <Mascot size="md" />
            <span>
              Drop a photo from tonight
              <br />
              <span className="text-mute/70">Photo or video, max 50MB</span>
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
              setError("File is over 50MB. Compress the video and try again.");
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
        placeholder="What happened today?"
        className="field placeholder:text-mute"
      />

      {error && (
        <p className="rounded-2xl bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary"
      >
        {pending
          ? progress > 0
            ? `Uploading ${progress}%`
            : "Uploading..."
          : "Share"}
      </button>
    </form>
  );
}
