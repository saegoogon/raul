import { ImageResponse } from "next/og";

export const alt = "BlackSmile Cloud";
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
        <svg width="96" height="96" viewBox="0 0 24 24" fill="#fafafa">
          <path d="M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" />
        </svg>
        <div style={{ display: "flex", marginTop: 36, fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          BlackSmile <span style={{ color: "#9a9a9a", marginLeft: 24 }}>Cloud</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 38, color: "#9a9a9a" }}>
          Store, organize, and share your files.
        </div>
      </div>
    ),
    size,
  );
}
