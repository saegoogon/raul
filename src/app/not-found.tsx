import Link from "next/link";
import { Grin } from "@/components/mascot/Grin";

export default function NotFound() {
  return (
    <main className="page-pad empty" style={{ maxWidth: 28 * 16 }}>
      <Grin size={64} />
      <h1 className="page-title">Page not found</h1>
      <p className="lede">This URL does not exist.</p>
      <Link href="/" className="btn-primary" style={{ marginTop: 20 }}>
        Back to the feed
      </Link>
    </main>
  );
}
