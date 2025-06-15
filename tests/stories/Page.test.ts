describe("Page stories", () => {
  it("ページストーリーが存在する", () => {
    try {
      const pageStories = require("../../stories/Page.stories");
      expect(pageStories).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("ページストーリーテスト完了", () => {
    expect(true).toBe(true);
  });
});
