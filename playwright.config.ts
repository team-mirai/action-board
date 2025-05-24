import { defineConfig, devices } from "@playwright/test";

// Next.jsは内部で環境変数をサポートしているためdotenvは不要

/**
 * Playwrightの設定
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* 各テスト実行の最大タイムアウト時間 */
  timeout: 30 * 1000,
  expect: {
    /* テストアサーションのタイムアウト時間 */
    timeout: 5000,
  },
  /* 並列実行の設定 */
  fullyParallel: true,
  /* CI環境での失敗時のリトライ回数 */
  retries: process.env.CI ? 2 : 0,
  /* テスト結果のレポーター設定 */
  reporter: "html",
  /* 共有の設定 */
  use: {
    /* テスト実行中のトレースを取得 */
    trace: "on-first-retry",
    /* ナビゲーションのタイムアウト */
    navigationTimeout: 10000,
    /* スクリーンショットの設定 */
    screenshot: "only-on-failure",
    /* ベースURL */
    baseURL: process.env.BASE_URL || "http://localhost:3000",
  },

  /* プロジェクト固有の設定 */
  projects: [
    /* デスクトップブラウザ */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* モバイルデバイス */
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Webサーバーの設定 */
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
