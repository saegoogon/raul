import { notFound } from "next/navigation";
import { HoodEmpty } from "@/components/mascot/HoodMotion";
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
      {snippets.length ? (
        <div className="issue-list">
          {snippets.map((snippet) => (
            <SnippetRow key={snippet.id} snippet={snippet} />
          ))}
        </div>
      ) : (
        <HoodEmpty title="아직 글이 없습니다">이 사람이 올린 글이 없습니다.</HoodEmpty>
      )}
    </main>
  );
}
