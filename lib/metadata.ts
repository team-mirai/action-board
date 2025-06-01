// ==========================================
// 【最小限版】lib/metadata.ts - 必要最低限の機能のみ
// ==========================================

import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// ==========================================
// 基本設定
// ==========================================

const config = {
  title: "チームみらい アクションボード",
  description:
    "選挙活動をもっと身近に。選挙活動をゲーム感覚で楽しめる、チームみらいのアクションボード。",
  defaultImage: "/img/ogp-default.png",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
};

// ==========================================
// URL検証（Supabase Storage対応）
// ==========================================

// URLが有効な画像URLかどうかを検証する関数
export function isValidImageUrl(url: string): boolean {
  //TODO: URL検証を追加
  return true;
}

// 画像URLをサニタイズする関数
export function sanitizeImageUrl(url: string): string | null {
  if (!isValidImageUrl(url)) {
    return null;
  }

  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

// ==========================================
// メタデータ生成
// ==========================================

// デフォルトメタデータ
export function createDefaultMetadata(): Metadata {
  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      images: [`${defaultUrl}${config.defaultImage}`],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [`${defaultUrl}${config.defaultImage}`],
    },
    icons: config.icons,
  };
}

// 動的OGPメタデータ
export function createOgpMetadata(imageUrl: string): Metadata {
  const sanitizedImageUrl = sanitizeImageUrl(imageUrl);

  if (!sanitizedImageUrl) {
    return createDefaultMetadata();
  }

  return {
    title: config.title,
    description: config.description,
    openGraph: {
      title: config.title,
      description: config.description,
      images: [sanitizedImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [sanitizedImageUrl],
    },
    icons: config.icons,
  };
}

// ==========================================
// Next.js generateMetadata関数
// ==========================================

export async function generateRootMetadata({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params?: Promise<{ [key: string]: string | undefined }>;
}): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const searchParamsResolved = await searchParams;
    const paramsResolved = await params;

    // searchParamsがnullまたはundefinedの場合の安全な処理
    if (!searchParamsResolved) {
      return createDefaultMetadata();
    }

    let ogpImageUrl: string | null = null;

    // type=completeの場合、paramsからミッションIDを取得してogp_image_urlを取得
    if (searchParamsResolved.type === "complete" && paramsResolved?.id) {
      const missionId = paramsResolved.id;
      const { data: mission } = await supabase
        .from("missions")
        .select("ogp_image_url")
        .eq("id", missionId)
        .single();

      ogpImageUrl = mission?.ogp_image_url || null;
    }

    if (ogpImageUrl) {
      const isValid = isValidImageUrl(ogpImageUrl);
      const sanitized = sanitizeImageUrl(ogpImageUrl);
      return createOgpMetadata(ogpImageUrl);
    }
    return createDefaultMetadata();
  } catch (error) {
    // searchParamsの取得に失敗した場合はデフォルトを返す
    console.error("generateRootMetadata error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    return createDefaultMetadata();
  }
}
