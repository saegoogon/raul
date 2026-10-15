import Link from "next/link";
import { Hood } from "@/components/mascot/Hood";

export default function NotFound() {
  return (
    <main className="page-pad empty" style={{ maxWidth: 28 * 16 }}>
      <Hood size={128} />
      <h1 className="page-title">Page not found</h1>
      <p className="lede">This URL does not exist.</p>
      <Link href="/" className="btn-primary" style={{ marginTop: 20 }}>
        Back to the feed
      </Link>
    </main>
  );
}
