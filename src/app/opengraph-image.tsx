import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070a",
        }}
      >
        <div
          style={{
            color: "#f5c84c",
            fontSize: 96,
            letterSpacing: "-0.06em",
          }}
        >
          :)
        </div>
        <div
          style={{
            marginTop: 28,
            color: "#f3efe6",
            fontSize: 56,
            letterSpacing: "-0.04em",
            fontWeight: 700,
          }}
        >
          blacksmile
        </div>
        <div
          style={{
            marginTop: 16,
            color: "#8c877e",
            fontSize: 28,
            letterSpacing: "-0.02em",
          }}
        >
          어둠 속의 미소 · 오늘 밤만
        </div>
      </div>
    ),
    size,
  );
}
