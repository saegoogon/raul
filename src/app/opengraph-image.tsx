import { ImageResponse } from "next/og";

export const alt = "BlackSmile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#070707",
          color: "#f3f1ec",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, textTransform: "uppercase", color: "#8a8882" }}>
          대전
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -4, lineHeight: 0.9 }}>BLACKSMILE</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#8a8882" }}>개발자가 이야기하고 코드를 나누는 플랫폼</div>
        </div>
      </div>
    ),
    size,
  );
}
