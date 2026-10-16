import { AccountPanel } from "@/app/account/AccountPanel";
import { signOut } from "@/actions/auth";
import { getProfileById } from "@/lib/snippets/queries";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "계정" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileById(user.id) : null;
  return (
    <main className="page-pad">
      <h1 className="page-title">계정</h1>
      <AccountPanel email={user?.email ?? null} username={profile?.username ?? null} />
      {user ? (
        <form action={signOut} className="mt-10">
          <button type="submit" className="btn-ghost px-0">
            로그아웃
          </button>
        </form>
      ) : null}
    </main>
  );
}
