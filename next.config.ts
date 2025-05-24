import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用の最適化設定
  output: "standalone",

  // 画像最適化の設定
  images: {
    unoptimized: true,
  },

  // 実験的機能
  experimental: {
    // サーバーコンポーネントの最適化
    serverComponentsExternalPackages: [],
  },

  // 環境変数の設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
