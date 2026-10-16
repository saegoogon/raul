import Link from "next/link";
import { Hood } from "@/components/mascot/Hood";

export default function NotFound() {
  return (
    <main className="page-pad empty" style={{ maxWidth: 28 * 16 }}>
      <Hood size={128} />
      <h1 className="page-title">없는 페이지</h1>
      <p className="lede">이 주소는 없습니다.</p>
      <Link href="/" className="btn-primary" style={{ marginTop: 20 }}>
        커뮤니티로
      </Link>
    </main>
  );
}
