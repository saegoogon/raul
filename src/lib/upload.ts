import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

const CHUNK = 6 * 1024 * 1024;

function storageEndpoint() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing Supabase URL");
  const projectId = new URL(url).hostname.split(".")[0];
  return `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;
}

export async function uploadPostFile(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please log in again.");
  }

  if (file.size <= CHUNK) {
    const { error } = await supabase.storage.from("posts").upload(path, file);
    if (error) throw new Error(error.message);
    onProgress?.(100);
  } else {
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: storageEndpoint(),
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          "x-upsert": "false",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: "posts",
          objectName: path,
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
        },
        chunkSize: CHUNK,
        onError: (error) => reject(error),
        onProgress: (bytesUploaded, bytesTotal) => {
          onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100));
        },
        onSuccess: () => resolve(),
      });

      upload
        .findPreviousUploads()
        .then((previous) => {
          if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        })
        .catch(reject);
    });
  }

  return supabase.storage.from("posts").getPublicUrl(path).data.publicUrl;
}

export function uploadErrorMessage(error: unknown) {
  const raw =
    error instanceof Error ? error.message : "Upload failed. Try again.";
  const lower = raw.toLowerCase();
  if (lower.includes("exceeded the maximum allowed size") || lower.includes("entity too large")) {
    return "File is over 50MB. Compress the video and try again.";
  }
  return raw;
}
