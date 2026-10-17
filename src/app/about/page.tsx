import { Hood } from "@/components/mascot/Hood";

export const metadata = { title: "소개" };

export default function AboutPage() {
  return (
    <main className="page-pad about-page">
      <Hood size={148} />
      <article className="about-body">
        <p className="kicker">소개</p>
        <h1 className="page-title">BlackSmile</h1>
        <p>대전에서 만드는 개발자 플랫폼입니다. 지금은 커뮤니티가 열려 있습니다.</p>
        <p>
          생각을 먼저 적고, 필요하면 코드를 붙입니다. 글에 공감을 남기고, 이번 주에 움직인 글을 봅니다. 누구나 읽을 수
          있고, 글·댓글·공감은 계정이 필요합니다.
        </p>
        <p>
          도구와 다운로드는 실제 파일과 작업 공간이 준비된 뒤에 엽니다. 가짜 통계나 아직 없는 기능을 버튼으로 보여 주지
          않습니다.
        </p>
        <p className="mute">blacksmile.co.kr</p>
      </article>
    </main>
  );
}
