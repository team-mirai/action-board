import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("user_levels テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    const { error: user1LevelError } = await adminClient
      .from("user_levels")
      .insert({
        user_id: user1.user.userId,
        xp: 150,
        level: 2,
      });

    const { error: user2LevelError } = await adminClient
      .from("user_levels")
      .insert({
        user_id: user2.user.userId,
        xp: 300,
        level: 3,
      });

    if (user1LevelError) {
      throw new Error(`user1レベル作成エラー: ${user1LevelError.message}`);
    }
    if (user2LevelError) {
      throw new Error(`user2レベル作成エラー: ${user2LevelError.message}`);
    }
  });

  afterEach(async () => {
    await adminClient
      .from("user_levels")
      .delete()
      .eq("user_id", user1.user.userId);
    await adminClient
      .from("user_levels")
      .delete()
      .eq("user_id", user2.user.userId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはuser_levelsを読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient.from("user_levels").select("*");

    expect(data).toBeTruthy();
  });

  test("認証済みユーザーは自分のレベル情報を読み取れる", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_id).toBe(user1.user.userId);
    expect(data?.[0].xp).toBe(150);
    expect(data?.[0].level).toBe(2);
  });

  test("認証済みユーザーは他のユーザーのレベル情報も読み取れる（ランキング表示のため）", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user2.user.userId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_id).toBe(user2.user.userId);
    expect(data?.[0].xp).toBe(300);
    expect(data?.[0].level).toBe(3);
  });

  test("認証済みユーザーは全ユーザーのレベル情報を取得できる", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .order("xp", { ascending: false });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.length).toBeGreaterThanOrEqual(2);

    const user2Data = data?.find((u) => u.user_id === user2.user.userId);
    const user1Data = data?.find((u) => u.user_id === user1.user.userId);

    expect(user2Data?.xp).toBe(300);
    expect(user1Data?.xp).toBe(150);
  });

  test("認証済みユーザーは他のユーザーのレベル情報を更新できない", async () => {
    const { data } = await user1.client
      .from("user_levels")
      .update({ xp: 500, level: 5 })
      .eq("user_id", user2.user.userId);

    expect(data).toBeNull();

    const { data: after } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user2.user.userId);
    expect(after).toBeTruthy();
    expect(after?.[0].xp).toBe(300);
    expect(after?.[0].level).toBe(3);
  });

  test("認証済みユーザーはuser_levelsをUPDATEできない（バックエンド経由のみ許可）", async () => {
    const { data: before } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);

    const { data, error } = await user1.client
      .from("user_levels")
      .update({ xp: 500, level: 5 })
      .eq("user_id", user1.user.userId)
      .select();

    expect(error).toBeNull(); // エラーは発生しない
    expect(data).toEqual([]); // 0行更新 = 空配列

    const { data: after } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);

    expect(after).toBeTruthy();
    expect(after?.[0].xp).toBe(150); // 元の値のまま
    expect(after?.[0].level).toBe(2); // 元の値のまま
    expect(after?.[0].updated_at).toBe(before?.[0].updated_at); // updated_atも変更されていない
  });

  test("認証済みユーザーはuser_levelsをINSERTできない（バックエンド経由のみ許可）", async () => {
    const testUserId = user1.user.userId;

    await adminClient.from("user_levels").delete().eq("user_id", testUserId);

    const { data, error } = await user1.client.from("user_levels").insert({
      user_id: testUserId,
      xp: 100,
      level: 1,
    });

    expect(data).toBeNull();
    expect(error).toBeTruthy();
    expect(error?.code).toBe("42501"); // RLS violation
  });

  test("認証済みユーザーはuser_levelsからDELETEできない", async () => {
    await user1.client
      .from("user_levels")
      .delete()
      .eq("user_id", user1.user.userId);

    const { data } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(data).toBeTruthy();
  });
});
