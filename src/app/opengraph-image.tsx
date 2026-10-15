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
          justifyContent: "flex-end",
          padding: 80,
          background: "#0c0c0c",
          color: "#ecece8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#7a7a76" }}>BLACKSMILE</div>
        <div style={{ marginTop: 18, fontSize: 72, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
          A dark GitHub.
        </div>
        <div style={{ marginTop: 20, fontSize: 28, color: "#f2d84a" }}>Developers talk here.</div>
      </div>
    ),
    size,
  );
}
