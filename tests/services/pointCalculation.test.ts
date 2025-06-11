import {
  calculatePostingPoints,
  getPointSetting,
  updatePointSetting,
} from "@/lib/services/pointCalculation";
import { adminClient } from "../rls/utils";

describe("ポイント計算サービスのテスト", () => {
  const TEST_MISSION_TYPE = "TEST_POSTING";
  let testSettingId: string;

  beforeEach(async () => {
    // 既存のテストデータをクリーンアップ
    await adminClient
      .from("mission_point_settings")
      .delete()
      .eq("mission_type", TEST_MISSION_TYPE);

    // テスト用のポイント設定を作成
    const settingData = {
      id: crypto.randomUUID(),
      mission_type: TEST_MISSION_TYPE,
      points_per_unit: 3,
      description: "テスト用ポスティングポイント設定",
    };

    const { error } = await adminClient
      .from("mission_point_settings")
      .insert(settingData);
    if (error) {
      throw new Error(`テスト用ポイント設定作成エラー: ${error.message}`);
    }
    testSettingId = settingData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("mission_point_settings")
      .delete()
      .eq("mission_type", TEST_MISSION_TYPE);
  });

  describe("calculatePostingPoints", () => {
    test("デフォルトのPOSTINGタイプでポイントを正しく計算する", async () => {
      const points = await calculatePostingPoints(10);
      expect(points).toBe(50); // 10枚 × 5ポイント
    });

    test("カスタムポイント設定でポイントを正しく計算する", async () => {
      const points = await calculatePostingPoints(5, TEST_MISSION_TYPE);
      expect(points).toBe(15); // 5枚 × 3ポイント
    });

    test("存在しないミッションタイプではデフォルト値を使用する", async () => {
      const points = await calculatePostingPoints(8, "NONEXISTENT_TYPE");
      expect(points).toBe(40); // 8枚 × 5ポイント（デフォルト）
    });

    test("0枚の場合は0ポイントを返す", async () => {
      const points = await calculatePostingPoints(0);
      expect(points).toBe(0);
    });

    test("大量の枚数でも正しく計算する", async () => {
      const points = await calculatePostingPoints(1000);
      expect(points).toBe(5000); // 1000枚 × 5ポイント
    });
  });

  describe("getPointSetting", () => {
    test("既存のポイント設定を取得できる", async () => {
      const pointsPerUnit = await getPointSetting(TEST_MISSION_TYPE);
      expect(pointsPerUnit).toBe(3);
    });

    test("デフォルトのPOSTINGタイプの設定を取得できる", async () => {
      const pointsPerUnit = await getPointSetting("POSTING");
      expect(pointsPerUnit).toBe(5);
    });

    test("存在しないミッションタイプではnullを返す", async () => {
      const pointsPerUnit = await getPointSetting("NONEXISTENT_TYPE");
      expect(pointsPerUnit).toBeNull();
    });
  });

  describe("updatePointSetting", () => {
    test("既存のポイント設定を更新できる", async () => {
      const result = await updatePointSetting(TEST_MISSION_TYPE, 7);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // 更新されたことを確認
      const updatedPoints = await getPointSetting(TEST_MISSION_TYPE);
      expect(updatedPoints).toBe(7);
    });

    test("新しいミッションタイプのポイント設定を作成できる", async () => {
      const NEW_TYPE = "NEW_MISSION_TYPE";
      const result = await updatePointSetting(NEW_TYPE, 12);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // 作成されたことを確認
      const newPoints = await getPointSetting(NEW_TYPE);
      expect(newPoints).toBe(12);

      // クリーンアップ
      await adminClient
        .from("mission_point_settings")
        .delete()
        .eq("mission_type", NEW_TYPE);
    });

    test("無効な値では更新に失敗する", async () => {
      // 0以下の値は制約違反になる
      const result = await updatePointSetting(TEST_MISSION_TYPE, 0);
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe("統合テスト", () => {
    test("ポイント設定更新後の計算が正しく動作する", async () => {
      // 最初の計算
      const initialPoints = await calculatePostingPoints(4, TEST_MISSION_TYPE);
      expect(initialPoints).toBe(12); // 4枚 × 3ポイント

      // ポイント設定を更新
      await updatePointSetting(TEST_MISSION_TYPE, 6);

      // 更新後の計算
      const updatedPoints = await calculatePostingPoints(4, TEST_MISSION_TYPE);
      expect(updatedPoints).toBe(24); // 4枚 × 6ポイント
    });

    test("複数のミッションタイプで独立してポイント計算される", async () => {
      // 別のミッションタイプを作成
      const ANOTHER_TYPE = "ANOTHER_POSTING";
      await updatePointSetting(ANOTHER_TYPE, 8);

      // それぞれ独立して計算される
      const points1 = await calculatePostingPoints(5, TEST_MISSION_TYPE);
      const points2 = await calculatePostingPoints(5, ANOTHER_TYPE);

      expect(points1).toBe(15); // 5枚 × 3ポイント
      expect(points2).toBe(40); // 5枚 × 8ポイント

      // クリーンアップ
      await adminClient
        .from("mission_point_settings")
        .delete()
        .eq("mission_type", ANOTHER_TYPE);
    });
  });
});
