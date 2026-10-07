import { redirect } from "next/navigation";
import { SubmitForm } from "@/app/submit/SubmitForm";
import { listRooms } from "@/lib/community/queries";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "New post" };

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { rooms, status } = await listRooms();
  const params = await searchParams;
  const preset = String(params.room ?? "");

  return (
    <main className="page-pad" style={{ maxWidth: 40 * 16 }}>
      <h1 className="page-title">New post</h1>
      {status !== "ok" ? (
        <p className="setup-note">Run supabase/community.sql before posting.</p>
      ) : (
        <SubmitForm rooms={rooms} preset={preset} />
      )}
    </main>
  );
}
