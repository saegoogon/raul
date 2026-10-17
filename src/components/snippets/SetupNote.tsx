import type { SnippetStatus } from "@/lib/snippets/queries";
import { HoodMotion } from "@/components/mascot/HoodMotion";

export function SetupNote({ status }: { status: SnippetStatus }) {
  if (status === "ok") return null;
  const message =
    status === "missing"
      ? "게시글 테이블이 없습니다. Supabase SQL Editor에서 supabase/snippets.sql 을 실행하세요."
      : status === "query"
        ? "게시글을 불러오는 쿼리가 실패했습니다. 잠시 후 다시 시도하세요."
        : "데이터베이스에 연결할 수 없습니다. 배포 환경의 Supabase 환경 변수를 확인하세요.";
  return (
    <div className="setup-note hood-error-block">
      <HoodMotion kind="error" size={96} />
      <p>{message}</p>
      <a className="btn-ghost" href=".">
        다시 시도
      </a>
    </div>
  );
}
