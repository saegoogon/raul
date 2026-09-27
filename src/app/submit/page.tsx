import { redirect } from "next/navigation";
import { ShareForm } from "@/components/ShareForm";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold">Share your day</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Any photo. Any moment. 아무 사진이나 괜찮아요.
      </p>
      <ShareForm />
    </div>
  );
}
