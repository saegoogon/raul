import { redirect } from "next/navigation";
import { ShareForm } from "@/components/ShareForm";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-xl">Share</h1>
      <p className="mb-4 text-sm text-mute">
        Photo or video, up to 50MB. Gone in 24 hours.
      </p>
      <ShareForm />
    </div>
  );
}
