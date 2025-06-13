import { getLevelProgress, getXpToNextLevel } from "@/lib/utils/utils";

describe("次のレベルまでのXP計算", () => {
  it("XPが0の場合、次のレベルまでのXPは40", () => {
    expect(getXpToNextLevel(0)).toBe(40);
  });

  it("XPが40の場合、次のレベルまでのXPは55", () => {
    expect(getXpToNextLevel(40)).toBe(55);
  });

  it("XPが100の場合、次のレベルまでのXPは65", () => {
    expect(getXpToNextLevel(100)).toBe(65);
  });

  it("XPが750の場合、次のレベルまでのXPは150", () => {
    expect(getXpToNextLevel(750)).toBe(150);
  });
});

describe("レベル進捗率計算", () => {
  it("レベル1のXPが0の場合は進捗率0", () => {
    expect(getLevelProgress(0)).toBe(0);
  });

  it("レベル1のXPが20の場合は進捗率0.5", () => {
    expect(getLevelProgress(20)).toBe(0.5);
  });

  it("レベル1のXPが39の場合は進捗率ほぼ1", () => {
    expect(getLevelProgress(39)).toBe(39 / 40);
  });

  it("レベル2のXPが40の場合は進捗率0", () => {
    expect(getLevelProgress(40)).toBe(0);
  });

  it("レベル2のXPが94の場合は進捗率ほぼ1", () => {
    expect(getLevelProgress(94)).toBeGreaterThan(0.9);
  });

  it("レベル3のXPが95の場合は進捗率0", () => {
    expect(getLevelProgress(95)).toBe(0);
  });

  it("レベル5のXPが300の場合は進捗率0.5", () => {
    expect(getLevelProgress(300)).toBe(0.5);
  });

  it("レベル10のXPが900の場合は進捗率0", () => {
    expect(getLevelProgress(900)).toBe(0);
  });

  it("レベル20のXPが3325の場合は進捗率0", () => {
    expect(getLevelProgress(3325)).toBe(0);
  });

  it("レベル50のXPが19600の場合は進捗率0", () => {
    expect(getLevelProgress(19600)).toBe(0);
  });

  it("レベル100のXPが76725の場合は進捗率0", () => {
    expect(getLevelProgress(76725)).toBe(0);
  });
});
