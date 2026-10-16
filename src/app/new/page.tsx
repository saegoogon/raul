import { redirect } from "next/navigation";
import { NewForm } from "@/app/new/NewForm";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "글쓰기" };

export default async function NewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <main className="page-pad" style={{ maxWidth: 40 * 16 }}>
      <h1 className="page-title">글쓰기</h1>
      <p className="lede">이야기를 먼저 적고, 필요하면 코드를 붙이거나 파일을 올립니다.</p>
      <NewForm />
    </main>
  );
}
