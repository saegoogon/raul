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
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#000000",
          color: "#ffffff",
        }}
      >
        <svg width="280" height="242" viewBox="0 0 120 104">
          <path
            d="M16 68C3 36 30 2 94 17"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            fill="#ffffff"
            d="M60 6C46.4 6 35.2 17.6 34.4 34.2 33.8 47.2 44 60.4 60 63.2 76 60.4 86.2 47.2 85.6 34.2 84.8 17.6 73.6 6 60 6Z"
          />
          <path
            fill="#ffffff"
            d="M33.6 64.2c-8.2 1.6-14.8 7.2-14.8 13.4 0 7.6 13.6 13.4 41.2 13.4s41.2-5.8 41.2-13.4c0-6.2-6.6-11.8-14.8-13.4Z"
          />
          <circle cx="51.2" cy="36.8" r="3.05" fill="#000000" />
          <circle cx="68.8" cy="36.8" r="3.05" fill="#000000" />
          <path
            d="M52.4 45.8c2.7 3.8 12.5 3.8 15.2 0"
            fill="none"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="36" y="69" width="48" height="20" rx="5" fill="#ffffff" />
          <path d="M40 77.2h40" fill="none" stroke="#000000" strokeWidth="1.6" strokeLinecap="round" />
          <path fill="#000000" d="M60 69.6 60.61 73.04 64 73.6 60.61 74.16 60 77.6 59.39 74.16 56 73.6 59.39 73.04Z" />
          <path fill="#ffffff" d="M99 6.6 100.34 13.66 107.4 15 100.34 16.34 99 23.4 97.66 16.34 90.6 15 97.66 13.66Z" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 6 }}>BLACKSMILE</div>
          <div style={{ marginTop: 18, fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>A dark GitHub.</div>
          <div style={{ marginTop: 16, fontSize: 22, color: "#bdbdbd" }}>Talk, paste, feel.</div>
        </div>
      </div>
    ),
    size,
  );
}
