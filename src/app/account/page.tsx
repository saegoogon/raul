import { AccountPanel } from "@/app/account/AccountPanel";
import { signOut } from "@/actions/auth";
import { getProfileById } from "@/lib/community/queries";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileById(user.id) : null;
  return (
    <main className="page-pad">
      <h1 className="page-title">You</h1>
      <AccountPanel email={user?.email ?? null} username={profile?.username ?? null} />
      {user ? (
        <form action={signOut} className="mt-10">
          <button type="submit" className="btn-ghost px-0">
            Log out
          </button>
        </form>
      ) : null}
    </main>
  );
}
