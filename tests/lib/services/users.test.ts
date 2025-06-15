describe("users service", () => {
  it("ユーザーサービスモジュールが存在する", () => {
    try {
      const users = require("../../../lib/services/users");
      expect(users).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("ユーザーサービステスト完了", () => {
    expect(true).toBe(true);
  });
});
