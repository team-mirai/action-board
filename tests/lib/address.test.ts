const { PREFECTURES } = require("../../lib/address");

describe("PREFECTURES", () => {
  it("都道府県配列が定義されている", () => {
    expect(PREFECTURES).toBeDefined();
    expect(Array.isArray(PREFECTURES)).toBe(true);
  });

  it("東京都が含まれている", () => {
    expect(PREFECTURES).toContain("東京都");
  });
});

describe("PREFECTURES array", () => {
  it("47都道府県+海外が含まれている", () => {
    expect(PREFECTURES.length).toBe(48);
  });

  it("空でない配列", () => {
    expect(PREFECTURES.length).toBeGreaterThan(0);
  });
});
