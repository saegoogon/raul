import { ImageResponse } from "next/og";

export const alt = "BlackSmile Links";
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
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round">
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
        <div style={{ display: "flex", marginTop: 36, fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          BlackSmile <span style={{ color: "#9a9a9a", marginLeft: 24 }}>Links</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 38, color: "#9a9a9a" }}>
          Short links, link-in-bio, and click analytics.
        </div>
      </div>
    ),
    size,
  );
}
