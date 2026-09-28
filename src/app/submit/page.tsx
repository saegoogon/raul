import { redirect } from "next/navigation";
import { ShareForm } from "@/components/ShareForm";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display mb-2 text-3xl italic tracking-tight">
        Share tonight
      </h1>
      <p className="mb-6 text-sm text-mute">
        Photo or video, up to 50MB. It lasts 24 hours.
        <br />
        사진이나 영상, 최대 50MB. 24시간이 지나면 사라져요.
      </p>
      <ShareForm />
    </div>
  );
}
