import { calculateMissionXp, totalXp, xpDelta } from "@/lib/services/userLevel";

describe("userLevel service", () => {
  describe("ミッション経験値計算", () => {
    describe("calculateMissionXp", () => {
      it("難易度1（★1 Easy）は50XP", () => {
        expect(calculateMissionXp(1)).toBe(50);
      });

      it("難易度2（★2 Normal）は100XP", () => {
        expect(calculateMissionXp(2)).toBe(100);
      });

      it("難易度3（★3 Hard）は200XP", () => {
        expect(calculateMissionXp(3)).toBe(200);
      });

      it("無効な難易度（0）はデフォルト50XP", () => {
        expect(calculateMissionXp(0)).toBe(50);
      });

      it("無効な難易度（4）はデフォルト50XP", () => {
        expect(calculateMissionXp(4)).toBe(50);
      });

      it("負の難易度はデフォルト50XP", () => {
        expect(calculateMissionXp(-1)).toBe(50);
      });
    });
  });
});

describe("XP差分計算", () => {
  describe("xpDelta", () => {
    it("レベル1から2の差分は40XP", () => {
      expect(xpDelta(1)).toBe(40);
    });

    it("レベル2から3の差分は55XP", () => {
      expect(xpDelta(2)).toBe(55);
    });

    it("レベル3から4の差分は70XP", () => {
      expect(xpDelta(3)).toBe(70);
    });

    it("レベル4から5の差分は85XP", () => {
      expect(xpDelta(4)).toBe(85);
    });

    it("レベル10から11の差分は160XP", () => {
      expect(xpDelta(10)).toBe(175);
    });
  });

  describe("totalXp", () => {
    it("レベル1までの累計XPは0", () => {
      expect(totalXp(1)).toBe(0);
    });

    it("レベル2までの累計XPは40XP", () => {
      expect(totalXp(2)).toBe(totalXp(1) + 40);
    });

    it("レベル3までの累計XPは95XP", () => {
      expect(totalXp(3)).toBe(totalXp(2) + 55);
    });

    it("レベル4までの累計XPは165XP", () => {
      expect(totalXp(4)).toBe(totalXp(3) + 70);
    });

    it("レベル5までの累計XPは275XP", () => {
      expect(totalXp(5)).toBe(totalXp(4) + 85);
    });

    it("レベル10までの累計XPは900XP", () => {
      expect(totalXp(10)).toBe(totalXp(9) + 160);
    });
  });
});
