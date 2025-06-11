import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("mission_point_settings テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let testSettingId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用のポイント設定を作成（管理者権限で）
    const settingData = {
      id: crypto.randomUUID(),
      mission_type: "TEST_TYPE",
      points_per_unit: 10,
      description: "テスト用のポイント設定",
    };

    const { error } = await adminClient
      .from("mission_point_settings")
      .insert(settingData);
    if (error) {
      throw new Error(`ポイント設定作成エラー: ${error.message}`);
    }
    testSettingId = settingData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("mission_point_settings")
      .delete()
      .eq("id", testSettingId);
    await cleanupTestUser(user1.user.userId);
  });

  test("匿名ユーザーはポイント設定を読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("mission_point_settings")
      .select("*");

    expect(data?.length).toBe(0);
  });

  test("認証済みユーザーはポイント設定を読み取れる", async () => {
    const { data, error } = await user1.client
      .from("mission_point_settings")
      .select("*")
      .eq("id", testSettingId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].mission_type).toBe("TEST_TYPE");
    expect(data?.[0].points_per_unit).toBe(10);
  });

  test("認証済みユーザーはポイント設定を作成できない", async () => {
    const newSettingData = {
      id: crypto.randomUUID(),
      mission_type: "USER_CREATED_TYPE",
      points_per_unit: 15,
      description: "ユーザーが作成しようとした設定",
    };

    const { data, error } = await user1.client
      .from("mission_point_settings")
      .insert(newSettingData)
      .select();

    // 認証済みユーザーでも作成は禁止されている
    expect(data).toBeNull();
  });

  test("認証済みユーザーはポイント設定を更新できない", async () => {
    const { data, error } = await user1.client
      .from("mission_point_settings")
      .update({
        points_per_unit: 20,
      })
      .eq("id", testSettingId)
      .select();

    // 認証済みユーザーでも更新は禁止されている
    expect(data?.length).toBe(0);

    // 更新の操作後でも設定は元のままであることを確認
    const { data: checkData, error: checkError } = await adminClient
      .from("mission_point_settings")
      .select("*")
      .eq("id", testSettingId);
    expect(checkError).toBeNull();
    expect(checkData).toHaveLength(1);
    expect(checkData?.[0].points_per_unit).toBe(10);
    expect(checkData?.[0].description).toBe("テスト用のポイント設定");
  });

  test("認証済みユーザーはポイント設定を削除できない", async () => {
    const { data, error } = await user1.client
      .from("mission_point_settings")
      .delete()
      .eq("id", testSettingId)
      .select();

    // 認証済みユーザーでも削除は禁止されている
    expect(data?.length).toBe(0);

    // 削除の操作後でも設定は存在することを確認
    const { data: checkData, error: checkError } = await adminClient
      .from("mission_point_settings")
      .select("*")
      .eq("id", testSettingId);
    expect(checkError).toBeNull();
    expect(checkData).toHaveLength(1);
    expect(checkData?.[0].id).toBe(testSettingId);
  });

  test("管理者はポイント設定をCRUD操作できる", async () => {
    // 管理者による読み取り
    const { data: readData, error: readError } = await adminClient
      .from("mission_point_settings")
      .select("*")
      .eq("id", testSettingId);

    expect(readError).toBeNull();
    expect(readData).toHaveLength(1);

    // 管理者による更新
    const { data: updateData, error: updateError } = await adminClient
      .from("mission_point_settings")
      .update({
        points_per_unit: 25,
        description: "管理者によって更新された設定",
      })
      .eq("id", testSettingId)
      .select();

    expect(updateError).toBeNull();
    expect(updateData).toHaveLength(1);
    expect(updateData?.[0].points_per_unit).toBe(25);

    // 管理者による作成
    const newAdminSettingData = {
      id: crypto.randomUUID(),
      mission_type: "ADMIN_CREATED_TYPE",
      points_per_unit: 30,
      description: "管理者が作成した設定",
    };

    const { data: createData, error: createError } = await adminClient
      .from("mission_point_settings")
      .insert(newAdminSettingData)
      .select();

    expect(createError).toBeNull();
    expect(createData).toHaveLength(1);
    expect(createData?.[0].mission_type).toBe("ADMIN_CREATED_TYPE");

    // 管理者による削除（テスト用データをクリーンアップ）
    const { data: deleteData, error: deleteError } = await adminClient
      .from("mission_point_settings")
      .delete()
      .eq("id", newAdminSettingData.id)
      .select();

    expect(deleteError).toBeNull();
    expect(deleteData).toHaveLength(1);
  });

  test("POSTINGタイプのデフォルト設定が存在する", async () => {
    const { data, error } = await user1.client
      .from("mission_point_settings")
      .select("*")
      .eq("mission_type", "POSTING");

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].points_per_unit).toBe(5);
    expect(data?.[0].description).toBe("ポスティング1枚あたりのポイント");
  });
});
