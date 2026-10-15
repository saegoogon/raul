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
      <p className="mute">Joined {new Date(profile.created_at).toLocaleDateString("en-US")}</p>
      <div className="issue-list" style={{ marginTop: 32 }}>
        {snippets.map((snippet) => (
          <SnippetRow key={snippet.id} snippet={snippet} />
        ))}
      </div>
      {!snippets.length ? <p className="mute">No posts yet.</p> : null}
    </main>
  );
}
