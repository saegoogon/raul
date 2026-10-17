import { SiteTabs } from "@/components/nav/SiteTabs";
import { LabBench } from "@/components/tools/LabBench";

export const metadata = { title: "도구" };

export default function ToolsPage() {
  return (
    <main className="page-pad">
      <header className="repo-head">
        <div className="repo-title">
          <h1>도구</h1>
        </div>
        <p className="lede">
          브라우저에서 바로 쓰는 변환기입니다. 입력은 이 기기를 떠나지 않습니다. 다운로드는 실제 파일이 준비되면 엽니다.
        </p>
      </header>
      <SiteTabs active="tools" />
      <LabBench />
    </main>
  );
}
