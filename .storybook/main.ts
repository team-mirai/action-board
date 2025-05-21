import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";
import type { InlineConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
  ],
  framework: {
    name: "@storybook/experimental-nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  // 追加: viteFinal
  async viteFinal(config: InlineConfig) {
    if (config.optimizeDeps) {
      config.optimizeDeps.exclude = [
        ...(config.optimizeDeps.exclude || []),
        "@storybook/blocks", // DocsRendererが含まれる可能性のあるパッケージ
      ];
    }
    return config;
  },
};
export default config;
