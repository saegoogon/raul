import { redirect } from "next/navigation";
import { NewForm } from "@/app/new/NewForm";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "New" };

export default async function NewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <main className="page-pad" style={{ maxWidth: 40 * 16 }}>
      <h1 className="page-title">New</h1>
      <p className="lede">Talk first. Paste or upload code if you need it.</p>
      <NewForm />
    </main>
  );
}
