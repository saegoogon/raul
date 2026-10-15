import Link from "next/link";

export function AccountPanel({
  email,
  username,
}: {
  email: string | null;
  username: string | null;
}) {
  return (
    <div className="grid gap-10">
      <section>
        <h2 className="rail-head" style={{ border: 0, padding: 0 }}>
          Account
        </h2>
        {email ? <p>{email}</p> : <p className="mute">Not logged in.</p>}
        {username ? (
          <p className="mute" style={{ marginTop: 8 }}>
            <Link href={`/u/${username}`}>@{username}</Link>
          </p>
        ) : null}
        <div className="hero-actions" style={{ marginTop: 12 }}>
          {email ? (
            <Link href="/new" className="btn-primary">
              New post
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary">
                Log in
              </Link>
              <Link href="/signup" className="btn-ghost">
                Sign up
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
