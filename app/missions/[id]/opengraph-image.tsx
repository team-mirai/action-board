import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getMissionPageData } from "./_lib/data";

export const alt = "OGP画像";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@700&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
}

export default async function Image({ params }: { params: { id: string } }) {
  const pageData = await getMissionPageData(params.id);

  // ベース画像を読み込み
  const baseImagePath = join(process.cwd(), "public/img/ogp-base.png");
  const baseImageBuffer = await readFile(baseImagePath);
  const baseImageBase64 = `data:image/png;base64,${baseImageBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        fontFamily: "Noto Sans JP",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundImage: `url(${baseImageBase64})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          width: "60%",
          fontSize: 48,
          margin: "0 48px",
          color: "black",
          fontWeight: "700",
          textAlign: "left",
          borderRadius: "15px",
          marginBottom: "20px",
          wordWrap: "break-word",
        }}
      >
        {pageData?.mission.title ?? "ミッションが見つかりません"}
      </div>
      <div
        style={{
          fontFamily: "Noto Sans JP",
          width: "60%",
          fontSize: 28,
          margin: "0 48px",
          color: "black",
          fontWeight: "700",
          textAlign: "left",
          borderRadius: "15px",
          wordWrap: "break-word",
        }}
      >
        #テクノロジーで誰も取り残さない日本へ
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: await loadGoogleFont(
            "Noto+Sans+JP",
            `${pageData?.mission.title ?? ""} #テクノロジーで誰も取り残さない日本へ`,
          ),
          style: "normal",
        },
      ],
    },
  );
}
