const { dateTimeFormatter, dateFormatter } = require("../../lib/formatter");

describe("dateTimeFormatter", () => {
  it("正常な日付フォーマット", () => {
    const result = dateTimeFormatter(new Date("2024-01-01"));
    expect(result).toContain("2024");
  });

  it("空の日付でエラー処理", () => {
    const result = dateTimeFormatter(null);
    expect(result).toBeDefined();
  });
});

describe("dateFormatter", () => {
  it("正常な日付フォーマット", () => {
    const result = dateFormatter(new Date("2024-01-01"));
    expect(result).toContain("2024");
  });

  it("空の日付でエラー処理", () => {
    const result = dateFormatter(null);
    expect(result).toBeDefined();
  });
});
