import Link from "next/link";
import { Grin } from "@/components/mascot/Grin";

export default function NotFound() {
  return (
    <main className="page-pad empty" style={{ maxWidth: 28 * 16 }}>
      <Grin size={64} />
      <h1 className="page-title">This hallway is empty.</h1>
      <p className="lede">The page is missing. You are not. The grin still works.</p>
      <Link href="/shop" className="btn-primary" style={{ marginTop: 20 }}>
        Back to the shop
      </Link>
    </main>
  );
}
