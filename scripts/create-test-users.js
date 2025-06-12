#!/usr/bin/env node

/**
 * テスト用seedユーザー作成スクリプト
 *
 * 使用方法:
 * 1. 環境変数を設定: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 2. node scripts/create-test-users.js
 */

const { createClient } = require("@supabase/supabase-js");

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error("❌ 必要な環境変数が設定されていません");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください",
  );
  process.exit(1);
}

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const testUsers = [
  {
    email: "takahiroanno@example.com",
    password: "password123",
    name: "安野たかひろ",
    address_prefecture: "東京都",
    date_of_birth: "1990-12-01",
    postcode: "1000001",
  },
  {
    email: "tanaka.hanako@example.com",
    password: "password123",
    name: "田中花子",
    address_prefecture: "大阪府",
    date_of_birth: "1985-03-15",
    postcode: "5400001",
  },
  {
    email: "sato.taro@example.com",
    password: "password123",
    name: "佐藤太郎",
    address_prefecture: "愛知県",
    date_of_birth: "1992-07-20",
    postcode: "4600001",
  },
  {
    email: "suzuki.misaki@example.com",
    password: "password123",
    name: "鈴木美咲",
    address_prefecture: "福岡県",
    date_of_birth: "1988-11-10",
    postcode: "8100001",
  },
  {
    email: "takahashi.ken@example.com",
    password: "password123",
    name: "高橋健一",
    address_prefecture: "北海道",
    date_of_birth: "1995-02-28",
    postcode: "0600001",
  },
];

/**
 * テストユーザーを作成する関数
 */
async function createTestUser(userData) {
  try {
    console.log(`👤 ${userData.name} (${userData.email}) を作成中...`);

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // メール確認をスキップ
      });

    if (authError || !authData.user) {
      throw new Error(`Auth ユーザー作成失敗: ${authError?.message}`);
    }

    const authId = authData.user.id;
    console.log(`   ✅ Auth ユーザー作成完了 (ID: ${authId})`);

    const { error: insertError } = await adminClient
      .from("private_users")
      .insert({
        id: authId,
        name: userData.name,
        address_prefecture: userData.address_prefecture,
        date_of_birth: userData.date_of_birth,
        postcode: userData.postcode,
      });

    if (insertError) {
      throw new Error(`private_users 挿入失敗: ${insertError.message}`);
    }

    console.log("   ✅ private_users データ挿入完了");

    const testClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key",
    );

    const { error: signInError } = await testClient.auth.signInWithPassword({
      email: userData.email,
      password: userData.password,
    });

    if (signInError) {
      console.log(`   ⚠️  ログインテスト失敗: ${signInError.message}`);
    } else {
      console.log("   ✅ ログインテスト成功");
    }

    return { success: true, authId };
  } catch (error) {
    console.error(`   ❌ ${userData.name} の作成に失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 既存のテストユーザーをクリーンアップ
 */
async function cleanupExistingUsers() {
  console.log("🧹 既存のテストユーザーをクリーンアップ中...");

  const emails = testUsers.map((user) => user.email);

  const { data: users, error } = await adminClient.auth.admin.listUsers();

  if (error) {
    console.error("ユーザー一覧取得エラー:", error.message);
    return;
  }

  const testUsersToDelete = users.users.filter((user) =>
    emails.includes(user.email || ""),
  );

  for (const user of testUsersToDelete) {
    try {
      await adminClient.from("private_users").delete().eq("id", user.id);

      await adminClient.auth.admin.deleteUser(user.id);

      console.log(`   ✅ ${user.email} を削除しました`);
    } catch (error) {
      console.error(`   ❌ ${user.email} の削除に失敗:`, error.message);
    }
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log("🚀 テスト用seedユーザー作成スクリプト開始\n");

  await cleanupExistingUsers();
  console.log("");

  console.log("👥 テストユーザーを作成中...\n");

  const results = [];
  for (const userData of testUsers) {
    const result = await createTestUser(userData);
    results.push({ ...userData, ...result });
    console.log(""); // 空行
  }

  console.log("📊 作成結果サマリー:");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ 成功: ${successful.length}件`);
  console.log(`❌ 失敗: ${failed.length}件`);

  if (successful.length > 0) {
    console.log("\n🎉 作成されたテストユーザー:");
    for (const user of successful) {
      console.log(`   📧 ${user.email} (${user.name})`);
      console.log(`   🔑 パスワード: ${user.password}`);
    }
  }

  if (failed.length > 0) {
    console.log("\n💥 失敗したユーザー:");
    for (const user of failed) {
      console.log(`   📧 ${user.email}: ${user.error}`);
    }
  }

  console.log("\n✨ スクリプト完了");
}

main().catch((error) => {
  console.error("💥 スクリプト実行エラー:", error);
  process.exit(1);
});
