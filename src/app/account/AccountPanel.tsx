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
        {email ? <p>{email}</p> : <p className="mute">로그인되어 있지 않습니다.</p>}
        {username ? (
          <p className="mute">
            <Link href={`/u/${username}`}>@{username}</Link>
          </p>
        ) : null}
        <div className="hero-actions">
          {email ? (
            <Link href="/new" className="btn-primary">
              글쓰기
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary">
                로그인
              </Link>
              <Link href="/signup" className="btn-ghost">
                가입
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
