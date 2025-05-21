/** @type {import('ts-jest').JestConfigWithTsJest} */
// dotenv設定を最初に読み込む
require("dotenv").config({ path: ".env" });

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/rls/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
          esModuleInterop: true,
        },
      },
    ],
  },
};
