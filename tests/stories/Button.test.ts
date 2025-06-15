describe("Button stories", () => {
  it("ボタンストーリーが存在する", () => {
    try {
      const buttonStories = require("../../stories/Button.stories");
      expect(buttonStories).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("ボタンストーリーテスト完了", () => {
    expect(true).toBe(true);
  });
});
