import { AccountPanel } from "@/app/account/AccountPanel";
import { signOut } from "@/actions/auth";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  return (
    <main className="page-pad">
      <h1 className="page-title">You</h1>
      <AccountPanel email={user?.email ?? null} />
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
