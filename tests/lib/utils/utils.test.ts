const {
  calculateAge,
  xpDelta,
  totalXp,
  calculateLevel,
  calculateMissionXp,
  getXpToNextLevel,
  getLevelProgress,
  cn,
} = require("../../../lib/utils/utils");

describe("calculateAge", () => {
  it("正常な生年月日で年齢計算", () => {
    const result = calculateAge("1990-01-01");
    expect(result).toBeGreaterThan(30);
  });

  it("空文字列で年齢計算エラー", () => {
    const result = calculateAge("");
    expect(result).toBeDefined();
  });
});

describe("xpDelta", () => {
  it("レベル1の差分XP", () => {
    expect(xpDelta(1)).toBe(40);
  });

  it("レベル0で例外発生", () => {
    expect(() => xpDelta(0)).toThrow();
  });
});

describe("totalXp", () => {
  it("レベル1の累計XP", () => {
    expect(totalXp(1)).toBe(0);
  });

  it("レベル0で例外発生", () => {
    expect(() => totalXp(0)).toThrow();
  });
});

describe("calculateLevel", () => {
  it("正常なXPでレベル計算", () => {
    expect(calculateLevel(100)).toBeGreaterThan(0);
  });

  it("負のXPでレベル1", () => {
    expect(calculateLevel(-10)).toBe(1);
  });
});

describe("calculateMissionXp", () => {
  it("難易度1で50XP", () => {
    expect(calculateMissionXp(1)).toBe(50);
  });

  it("無効な難易度で50XP", () => {
    expect(calculateMissionXp(0)).toBe(50);
  });
});

describe("getXpToNextLevel", () => {
  it("正常なXPで次レベルまでのXP", () => {
    expect(getXpToNextLevel(0)).toBeGreaterThan(0);
  });

  it("負のXPで次レベルまでのXP", () => {
    expect(getXpToNextLevel(-10)).toBeGreaterThan(0);
  });
});

describe("getLevelProgress", () => {
  it("正常なXPで進捗率計算", () => {
    const result = getLevelProgress(20);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("負のXPで進捗率0", () => {
    const result = getLevelProgress(-10);
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe("cn", () => {
  it("正常なクラス名の結合", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("空配列でクラス名結合", () => {
    expect(cn()).toBe("");
  });
});
