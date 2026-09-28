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
          background: "#0b0b0b",
        }}
      >
        <div
          style={{
            color: "#e2b441",
            fontSize: 96,
          }}
        >
          :)
        </div>
        <div
          style={{
            marginTop: 28,
            color: "#ececec",
            fontSize: 52,
          }}
        >
          blacksmile
        </div>
        <div
          style={{
            marginTop: 16,
            color: "#8a8a8a",
            fontSize: 28,
          }}
        >
          one night only
        </div>
      </div>
    ),
    size,
  );
}
