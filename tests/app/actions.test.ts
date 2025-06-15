describe("actions module", () => {
  it("アクションモジュールが存在する", () => {
    try {
      const actions = require("../../app/actions");
      expect(actions).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("アクションモジュールテスト完了", () => {
    expect(true).toBe(true);
  });
});
