import { grantXp } from "@/lib/services/userLevel";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateMissionXp } from "@/lib/utils/utils";
import { type NextRequest, NextResponse } from "next/server";

// 型定義を明示（Supabaseの!innerJOINが配列を返す可能性を考慮）
type AchievementWithMission = {
  id: string;
  user_id: string;
  mission_id: string;
  created_at: string;
  missions:
    | {
        id: string;
        title: string;
        difficulty: number;
      }
    | {
        id: string;
        title: string;
        difficulty: number;
      }[];
};

/**
 * ポイントが加算されていないミッション達成にポイントを付与するバッチ処理
 *
 * 本APIは管理者が実行する想定で、以下の処理を行います：
 * 1. XPトランザクションが記録されていないミッション達成を検索
 * 2. 各達成にミッション難易度に応じたXPを付与
 * 3. 処理結果をレポートとして返却
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServiceClient();

    // リクエストボディから認証情報を確認（簡易的な認証）
    const body = await request.json();
    const { adminKey } = body;

    // 環境変数で設定した管理者キーで認証
    if (adminKey !== process.env.BATCH_ADMIN_KEY) {
      return NextResponse.json(
        { error: "認証に失敗しました" },
        { status: 401 },
      );
    }

    console.log("=== XP付与バッチ処理を開始します ===");

    // XPが付与されていない達成を特定するため、すべての達成を取得し
    // それぞれにXPトランザクションが存在するかチェック
    const { data: allAchievements, error: allAchievementsError } =
      await supabase
        .from("achievements")
        .select(`
        id,
        user_id,
        mission_id,
        created_at,
        missions!inner(
          id,
          title,
          difficulty
        )
      `)
        .order("created_at", { ascending: true });

    if (allAchievementsError) {
      console.error(
        "全ミッション達成データの取得に失敗しました:",
        allAchievementsError,
      );
      return NextResponse.json(
        {
          error: "全ミッション達成データの取得に失敗しました",
          details: allAchievementsError.message,
        },
        { status: 500 },
      );
    }

    // 型安全のためのキャスト
    const typedAchievements = allAchievements as AchievementWithMission[];

    if (!typedAchievements || typedAchievements.length === 0) {
      return NextResponse.json({
        success: true,
        message: "処理対象のミッション達成が見つかりませんでした",
        processed: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // XPが付与されていない達成をフィルタリング
    const missingXpAchievements: AchievementWithMission[] = [];

    for (const achievement of typedAchievements) {
      // この達成に対するXPトランザクションが存在するかチェック
      const { data: existingXp, error: xpCheckError } = await supabase
        .from("xp_transactions")
        .select("id")
        .eq("source_type", "MISSION_COMPLETION")
        .eq("source_id", achievement.id)
        .maybeSingle();

      if (xpCheckError) {
        console.error(
          `達成ID ${achievement.id} のXPチェックでエラー:`,
          xpCheckError,
        );
        continue;
      }

      // XPトランザクションが存在しない場合は処理対象に追加
      if (!existingXp) {
        missingXpAchievements.push(achievement);
      }
    }

    console.log(
      `XP未付与の達成が ${missingXpAchievements.length} 件見つかりました`,
    );

    if (missingXpAchievements.length === 0) {
      return NextResponse.json({
        success: true,
        message: "XP未付与のミッション達成は見つかりませんでした",
        processed: 0,
        skipped: 0,
        errors: 0,
      });
    }

    // バッチ処理結果の統計
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const results: Array<{
      achievementId: string;
      userId: string;
      missionTitle: string;
      xpGranted?: number;
      status: "success" | "error" | "skipped";
      error?: string;
    }> = [];

    // 各達成にXPを付与
    for (const achievement of missingXpAchievements) {
      try {
        const mission = Array.isArray(achievement.missions)
          ? achievement.missions[0]
          : achievement.missions;

        if (!mission) {
          console.warn(
            `達成ID ${achievement.id} のミッション情報が見つかりません`,
          );
          skippedCount++;
          results.push({
            achievementId: achievement.id,
            userId: achievement.user_id,
            missionTitle: "不明",
            status: "skipped",
            error: "ミッション情報が見つかりません",
          });
          continue;
        }

        // ミッション難易度に基づくXP計算
        const xpToGrant = calculateMissionXp(mission.difficulty);
        const description = `ミッション「${mission.title}」達成による経験値獲得`;

        console.log(
          `処理中: 達成ID ${achievement.id}, ユーザーID ${achievement.user_id}, XP ${xpToGrant}`,
        );

        // XPを付与
        const result = await grantXp(
          achievement.user_id,
          xpToGrant,
          "MISSION_COMPLETION",
          achievement.id,
          description,
        );

        if (result.success) {
          processedCount++;
          results.push({
            achievementId: achievement.id,
            userId: achievement.user_id,
            missionTitle: mission.title,
            xpGranted: xpToGrant,
            status: "success",
          });
          console.log(
            `✓ 達成ID ${achievement.id} にXP ${xpToGrant} を付与しました`,
          );
        } else {
          errorCount++;
          results.push({
            achievementId: achievement.id,
            userId: achievement.user_id,
            missionTitle: mission.title,
            status: "error",
            error: result.error || "XP付与に失敗しました",
          });
          console.error(
            `✗ 達成ID ${achievement.id} のXP付与に失敗: ${result.error}`,
          );
        }

        // レート制限を避けるため少し待機
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : "予期しないエラー";
        results.push({
          achievementId: achievement.id,
          userId: achievement.user_id,
          missionTitle: Array.isArray(achievement.missions)
            ? achievement.missions[0]?.title || "不明"
            : achievement.missions?.title || "不明",
          status: "error",
          error: errorMessage,
        });
        console.error(`達成ID ${achievement.id} の処理中にエラー:`, error);
      }
    }

    console.log("=== XP付与バッチ処理が完了しました ===");
    console.log(`処理成功: ${processedCount} 件`);
    console.log(`スキップ: ${skippedCount} 件`);
    console.log(`エラー: ${errorCount} 件`);

    return NextResponse.json({
      success: true,
      message: "XP付与バッチ処理が完了しました",
      summary: {
        total: missingXpAchievements.length,
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results: results,
    });
  } catch (error) {
    console.error("バッチ処理でエラーが発生しました:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return NextResponse.json(
      {
        error: "バッチ処理でエラーが発生しました",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

/**
 * バッチ処理の状況確認用GETエンドポイント
 */
export async function GET() {
  try {
    const supabase = await createServiceClient();

    // XP未付与の達成数を確認
    const { data: allAchievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("id")
      .order("created_at", { ascending: true });

    if (achievementsError) {
      return NextResponse.json(
        {
          error: "データの取得に失敗しました",
          details: achievementsError.message,
        },
        { status: 500 },
      );
    }

    let missingXpCount = 0;

    if (allAchievements) {
      for (const achievement of allAchievements) {
        const { data: existingXp } = await supabase
          .from("xp_transactions")
          .select("id")
          .eq("source_type", "MISSION_COMPLETION")
          .eq("source_id", achievement.id)
          .maybeSingle();

        if (!existingXp) {
          missingXpCount++;
        }
      }
    }

    // 統計情報を返却
    const { data: totalAchievements, error: countError } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true });

    const { data: totalXpTransactions, error: xpCountError } = await supabase
      .from("xp_transactions")
      .select("*", { count: "exact", head: true })
      .eq("source_type", "MISSION_COMPLETION");

    return NextResponse.json({
      statistics: {
        totalAchievements: totalAchievements?.length || 0,
        totalXpTransactions: totalXpTransactions?.length || 0,
        missingXpAchievements: missingXpCount,
        completionRate: totalAchievements?.length
          ? Math.round(
              ((totalAchievements.length - missingXpCount) /
                totalAchievements.length) *
                100,
            )
          : 0,
      },
      message:
        missingXpCount > 0
          ? `${missingXpCount} 件のミッション達成にXPが付与されていません`
          : "すべてのミッション達成にXPが付与されています",
    });
  } catch (error) {
    console.error("統計取得でエラーが発生しました:", error);
    const errorMessage =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";

    return NextResponse.json(
      {
        error: "統計取得でエラーが発生しました",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
