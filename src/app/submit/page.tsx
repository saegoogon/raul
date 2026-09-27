import { redirect } from "next/navigation";
import { ShareForm } from "@/components/ShareForm";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold">Share tonight</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Photo or video, up to 50MB.
        <br />
        사진이나 영상, 최대 50MB까지 올려요.
      </p>
      <ShareForm />
    </div>
  );
}
