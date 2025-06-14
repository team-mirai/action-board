import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getMissionPageData } from "./_lib/data";

export const runtime = "nodejs";
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
    /src:\s*url\(([^)]+)\)\s*format\('(opentype|truetype|woff2)'\)/,
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
  const baseImagePath = join(process.cwd(), "public/img/ogo_mission_base.png");
  const baseImageBuffer = await readFile(baseImagePath);
  const baseImageBase64 = `data:image/png;base64,${baseImageBuffer.toString("base64")}`;

  // titleに()や（）が含まれる場合は(や（の手前で改行する
  const title = pageData?.mission.title ?? "ミッションが見つかりません";
  const titleWithLineBreak = title.replace(/（/g, "\n（").replace(/\(/g, "\n(");

  return new ImageResponse(
    <div
      style={{
        fontFamily: "Noto Sans JP",
        width: "100%",
        height: "100%",
        padding: "40px",
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
          width: "62%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 40,
            color: "black",
            fontWeight: "700",
            marginBottom: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {titleWithLineBreak}
        </div>
        <div
          style={{
            fontFamily: "Noto Sans JP",
            fontSize: 28,
            color: "black",
            fontWeight: "700",
            marginBottom: "24px",
          }}
        >
          #テクノロジーで誰も取り残さない日本へ
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              fontFamily: "Noto Sans JP",
              fontSize: "58px",
              color: "#0d9488",
              textAlign: "center",
              lineHeight: "1",
            }}
          >
            {(pageData?.totalAchievementCount ?? 0).toLocaleString()}
          </div>
          <div
            style={{
              marginLeft: "8px",
              fontFamily: "Noto Sans JP",
              fontSize: "24px",
              color: "#0d9488",
              textAlign: "center",
            }}
          >
            件のアクションが達成されました！
          </div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: await loadGoogleFont(
            "Noto+Sans+JP",
            `${pageData?.mission.title ?? ""} #テクノロジーで誰も取り残さない日本へ ${pageData?.totalAchievementCount ?? 0}件のアクションが達成されました！`,
          ),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
