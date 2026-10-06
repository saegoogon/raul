import { ImageResponse } from "next/og";

export const alt = "BlackSmile AI";
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
          justifyContent: "center",
          padding: 96,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", marginTop: 8, fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>
          BlackSmile <span style={{ color: "#9a9a9a", marginLeft: 24 }}>AI</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#9a9a9a" }}>
          Download Blacky for Windows.
        </div>
      </div>
    ),
    size,
  );
}
