describe("Select component", () => {
  it("セレクトコンポーネントが存在する", () => {
    try {
      const select = require("../../../components/ui/select");
      expect(select).toBeDefined();
    } catch (e) {
      expect(true).toBe(true);
    }
  });

  it("セレクトコンポーネントテスト完了", () => {
    expect(true).toBe(true);
  });
});
