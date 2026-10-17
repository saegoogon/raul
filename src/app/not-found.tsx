import Link from "next/link";
import { HoodEmpty } from "@/components/mascot/HoodMotion";

export default function NotFound() {
  return (
    <main className="page-pad empty" style={{ maxWidth: 28 * 16 }}>
      <HoodEmpty
        title="없는 페이지"
        action={
          <Link href="/" className="btn-primary">
            커뮤니티로
          </Link>
        }
      >
        이 주소는 없습니다. 커뮤니티에서 다시 찾아 보세요.
      </HoodEmpty>
    </main>
  );
}
