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
          계정
        </h2>
        {email ? <p>{email}</p> : <p className="mute">로그인되어 있지 않습니다.</p>}
        {username ? (
          <p className="mute" style={{ marginTop: 8 }}>
            <Link href={`/u/${username}`}>@{username}</Link>
          </p>
        ) : null}
        <div className="hero-actions" style={{ marginTop: 12 }}>
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
