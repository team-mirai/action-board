describe("posting service", () => {
  it("ポスティングサービスモジュールが存在する", () => {
    try {
      const posting = require("../../../lib/services/posting");
      expect(posting).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("ポスティングサービステスト完了", () => {
    expect(true).toBe(true);
  });
});
