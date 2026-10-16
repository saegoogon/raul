import { notFound } from "next/navigation";
import { SnippetRow } from "@/components/snippets/SnippetRow";
import { getProfileByUsername, listSnippets } from "@/lib/snippets/queries";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();
  const { snippets } = await listSnippets({ username, sort: "new" });

  return (
    <main className="page-pad">
      <h1 className="page-title">@{profile.username}</h1>
      <p className="mute">{new Date(profile.created_at).toLocaleDateString("ko-KR")} 가입</p>
      <div className="issue-list" style={{ marginTop: 32 }}>
        {snippets.map((snippet) => (
          <SnippetRow key={snippet.id} snippet={snippet} />
        ))}
      </div>
      {!snippets.length ? <p className="mute">아직 글이 없습니다.</p> : null}
    </main>
  );
}
