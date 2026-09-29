import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  let mascot: string | null = null;
  try {
    const bytes = await readFile(
      join(process.cwd(), "public/brand/blacksmile-hero.png"),
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
          background: "#000000",
        }}
      >
        {mascot ? <img src={mascot} width={280} height={280} alt="" /> : null}
        <div
          style={{
            marginTop: 18,
            color: "#ffffff",
            fontSize: 52,
          }}
        >
          BlackSmile
        </div>
        <div
          style={{
            marginTop: 12,
            color: "#e8e6e6",
            fontSize: 28,
          }}
        >
          A small smile can change your world
        </div>
      </div>
    ),
    size,
  );
}
