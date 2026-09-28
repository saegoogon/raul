import { redirect } from "next/navigation";
import { Mascot } from "@/components/Mascot";
import { ShareForm } from "@/components/ShareForm";
import { getCurrentUser } from "@/lib/posts";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <Mascot size="sm" />
        <div>
          <h1 className="text-xl">Share tonight</h1>
          <p className="text-sm text-mute">Up to 50MB. Gone in 24 hours.</p>
        </div>
      </div>
      <ShareForm />
    </div>
  );
}
