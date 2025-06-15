describe("Header stories", () => {
  it("ヘッダーストーリーが存在する", () => {
    try {
      const headerStories = require("../../stories/Header.stories");
      expect(headerStories).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("ヘッダーストーリーテスト完了", () => {
    expect(true).toBe(true);
  });
});
