const {
  formatUserDisplayName,
  formatUserPrefecture,
} = require("../../../lib/utils/ranking-utils");

describe("formatUserDisplayName", () => {
  it("正常な名前でフォーマット", () => {
    const result = formatUserDisplayName("テストユーザー");
    expect(result).toBe("テストユーザー");
  });

  it("null名前でデフォルト表示", () => {
    const result = formatUserDisplayName(null);
    expect(result).toBe("名前未設定");
  });
});

describe("formatUserPrefecture", () => {
  it("正常な都道府県でフォーマット", () => {
    const result = formatUserPrefecture("東京都");
    expect(result).toBe("東京都");
  });

  it("null都道府県でデフォルト表示", () => {
    const result = formatUserPrefecture(null);
    expect(result).toBe("未設定");
  });
});
