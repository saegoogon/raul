import { Hood } from "@/components/mascot/Hood";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="page-pad about-body">
      <Hood size={132} />
      <h1 className="page-title">BlackSmile</h1>
      <p>A dark GitHub. A night board for developers.</p>
      <p>Post a thought. Upload code if you want. Feel a post. See this week’s top 3 and what’s moving.</p>
      <p>Anyone can read. You need an account to post, comment, or feel.</p>
      <p>Seoul. blacksmile.co.kr</p>
    </main>
  );
}
