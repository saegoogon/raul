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
        Photo or a 60-second short. 사진이나 1분 숏폼이면 돼요.
      </p>
      <ShareForm />
    </div>
  );
}
