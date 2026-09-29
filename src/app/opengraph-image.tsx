import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  let mascot: string | null = null;
  try {
    const bytes = await readFile(
      join(process.cwd(), "public/brand/blacksmile-logo.png"),
    );
    mascot = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
  } catch {
    mascot = null;
  }

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
        {mascot ? <img src={mascot} width={220} height={220} alt="" /> : null}
        <div
          style={{
            marginTop: 18,
            color: "#ececec",
            fontSize: 52,
          }}
        >
          blacksmile
        </div>
        <div
          style={{
            marginTop: 12,
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
