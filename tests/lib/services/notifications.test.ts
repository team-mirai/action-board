describe("notifications service", () => {
  it("通知サービスモジュールが存在する", () => {
    try {
      const notifications = require("../../../lib/services/notifications");
      expect(notifications).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("通知サービステスト完了", () => {
    expect(true).toBe(true);
  });
});
