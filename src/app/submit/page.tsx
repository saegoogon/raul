import { redirect } from "next/navigation";
import { ShareForm } from "@/components/ShareForm";
import { tonightPrompt } from "@/lib/night";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prompt = tonightPrompt();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold">Share tonight</h1>
      <p className="mb-1 text-sm text-zinc-500">Tonight&apos;s prompt</p>
      <p className="mb-1 text-lg font-medium">{prompt.en}</p>
      <p className="mb-6 text-sm text-zinc-500">
        {prompt.ko}
        <br />
        Photo or a 60-second short. 올리면 오늘 밤의 방에 들어가요.
      </p>
      <ShareForm placeholder={`${prompt.en} / ${prompt.ko}`} />
    </div>
  );
}
