const { POSTING_POINTS_PER_UNIT } = require("../../lib/constants");

describe("POSTING_POINTS_PER_UNIT", () => {
  it("ポスティングポイントが定義されている", () => {
    expect(POSTING_POINTS_PER_UNIT).toBeDefined();
    expect(typeof POSTING_POINTS_PER_UNIT).toBe("number");
  });

  it("正の値である", () => {
    expect(POSTING_POINTS_PER_UNIT).toBeGreaterThan(0);
  });
});
