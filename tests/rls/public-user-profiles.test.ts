import { cleanupTestUser, createTestUser, getAnonClient } from "./utils";

describe("public_user_profiles テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
  });

  afterEach(async () => {
    // テストユーザーをクリーンアップ
    await cleanupTestUser(user1.user.userId);
  });

  test("匿名ユーザーはpublic_user_profilesテーブルを読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("public_user_profiles")
      .select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    // public_user_profilesはトリガーでprivate_usersから同期されるため、
    // テストユーザーのデータも含まれるはず
    expect(
      data?.some((profile) => profile.id === user1.user.userId),
    ).toBeTruthy();
  });

  test("認証済みユーザーはpublic_user_profilesテーブルを読み取れる", async () => {
    const { data, error } = await user1.client
      .from("public_user_profiles")
      .select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(
      data?.some((profile) => profile.id === user1.user.userId),
    ).toBeTruthy();
  });

  test("匿名ユーザーはpublic_user_profilesテーブルに書き込みできない", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("public_user_profiles")
      .insert({
        id: crypto.randomUUID(),
        name: "Anonymous User",
        address_prefecture: "東京都",
        created_at: new Date().toISOString(),
      });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーはpublic_user_profilesテーブルに直接書き込みできない", async () => {
    const { data, error } = await user1.client
      .from("public_user_profiles")
      .insert({
        id: crypto.randomUUID(),
        name: "Test User Direct Insert",
        address_prefecture: "東京都",
        created_at: new Date().toISOString(),
      });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("private_usersの更新がpublic_user_profilesに反映される", async () => {
    const newName = "Updated Public Profile Name";

    // private_usersテーブルを更新
    await user1.client
      .from("private_users")
      .update({ name: newName })
      .eq("id", user1.user.userId);

    // 少し待ってトリガーが実行されるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 500));

    // public_user_profilesテーブルで確認
    const { data, error } = await getAnonClient()
      .from("public_user_profiles")
      .select("name")
      .eq("id", user1.user.userId)
      .single();

    expect(error).toBeNull();
    expect(data?.name).toBe(newName);
  });
});
