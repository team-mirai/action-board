"use server";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes"; // パス変更
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/lib/utils/types/supabase"; // ARTIFACT_TYPESのimportより前に移動
import { encodedRedirect } from "@/lib/utils/utils";
import { z } from "zod";

// 基本スキーマ（共通項目）
const baseMissionFormSchema = z.object({
  missionId: z.string().nonempty({ message: "ミッションIDが必要です" }),
  userId: z.string().nonempty({ message: "ユーザーIDが必要です" }),
  requiredArtifactType: z
    .string()
    .nonempty({ message: "提出タイプが必要です" }),
  artifactDescription: z.string().optional(),
});

// LINKタイプ用スキーマ
const linkArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.LINK.key),
  artifactLink: z
    .string()
    .nonempty({ message: "リンクURLが必要です" })
    .url({ message: "有効なURLを入力してください" }),
});

// IMAGEタイプ用スキーマ
const imageArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.IMAGE.key),
  artifactImagePath: z.string().nonempty({ message: "画像が必要です" }),
});

// IMAGE_WITH_GEOLOCATIONタイプ用スキーマ
const imageWithGeolocationArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key),
  artifactImagePath: z.string().nonempty({ message: "画像が必要です" }),
  latitude: z
    .string()
    .nonempty({ message: "緯度が必要です" })
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な緯度を入力してください",
    }),
  longitude: z
    .string()
    .nonempty({ message: "経度が必要です" })
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な経度を入力してください",
    }),
  accuracy: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な精度を入力してください",
    }),
  altitude: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な高度を入力してください",
    }),
});

// NONEタイプ用スキーマ
const noneArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.NONE.key),
});

// 統合スキーマ
const achieveMissionFormSchema = z.discriminatedUnion("requiredArtifactType", [
  linkArtifactSchema,
  imageArtifactSchema,
  imageWithGeolocationArtifactSchema,
  noneArtifactSchema,
]);

// 提出キャンセルアクションのバリデーションスキーマ
const cancelSubmissionFormSchema = z.object({
  achievementId: z.string().nonempty({ message: "達成IDが必要です" }),
  missionId: z.string().nonempty({ message: "ミッションIDが必要です" }),
});

export const achieveMissionAction = async (formData: FormData) => {
  const missionId = formData.get("missionId")?.toString();
  const userId = formData.get("userId")?.toString(); // private_users.id ではなく auth.uid() を使うべきだが、現状のフォームに合わせる
  const requiredArtifactType = formData.get("requiredArtifactType")?.toString();
  const artifactLink = formData.get("artifactLink")?.toString();
  const artifactImagePath = formData.get("artifactImagePath")?.toString();
  const artifactDescription = formData.get("artifactDescription")?.toString();
  // 位置情報データの取得
  const latitude = formData.get("latitude")?.toString();
  const longitude = formData.get("longitude")?.toString();
  const accuracy = formData.get("accuracy")?.toString();
  const altitude = formData.get("altitude")?.toString();

  // zodによるバリデーション
  const validatedFields = achieveMissionFormSchema.safeParse({
    missionId,
    userId,
    requiredArtifactType,
    artifactLink,
    artifactImagePath,
    artifactDescription,
    latitude,
    longitude,
    accuracy,
    altitude,
  });

  if (!validatedFields.success) {
    return encodedRedirect(
      "error",
      missionId ? `/missions/${missionId}` : "/missions",
      validatedFields.error.errors.map((error) => error.message).join("\n"),
    );
  }

  const validatedData = validatedFields.data;
  const {
    missionId: validatedMissionId,
    userId: validatedUserId,
    requiredArtifactType: validatedRequiredArtifactType,
    artifactDescription: validatedArtifactDescription,
  } = validatedData;

  const supabase = await createClient();

  // ユーザーがログイン済みかチェック (念のため)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || authUser.id !== validatedUserId) {
    return encodedRedirect(
      "error",
      `/missions/${validatedMissionId}`,
      "認証エラーが発生しました。",
    );
  }

  // ミッション情報を取得して、max_achievement_count を確認
  const { data: missionData, error: missionFetchError } = await supabase
    .from("missions")
    .select("max_achievement_count")
    .eq("id", validatedMissionId)
    .single();

  if (missionFetchError) {
    console.error(`Mission fetch error: ${missionFetchError.message}`);
    return encodedRedirect(
      "error",
      `/missions/${validatedMissionId}`,
      "ミッション情報の取得に失敗しました。",
    );
  }

  if (missionData?.max_achievement_count !== null) {
    // ユーザーの達成回数を取得
    const { data: userAchievements, error: userAchievementError } =
      await supabase
        .from("achievements")
        .select("id", { count: "exact" })
        .eq("user_id", validatedUserId)
        .eq("mission_id", validatedMissionId);

    if (userAchievementError) {
      console.error(
        `User achievement count fetch error: ${userAchievementError.message}`,
      );
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        "ユーザーの達成回数の取得に失敗しました。",
      );
    }

    // ユーザーの達成回数が最大達成回数に達しているかチェック
    if (
      userAchievements &&
      typeof missionData.max_achievement_count === "number" &&
      userAchievements.length >= missionData.max_achievement_count
    ) {
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        "あなたはこのミッションの達成回数の上限に達しています。",
      );
    }

    // ミッション全体の達成回数を取得（全体の上限がある場合）
    const { data: countData, error: countError } = await supabase
      .from("mission_achievement_count_view")
      .select("achievement_count")
      .eq("mission_id", validatedMissionId)
      .single();

    if (countError) {
      console.error(`Achievement count fetch error: ${countError.message}`);
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        "達成回数の取得に失敗しました。",
      );
    }

    // ミッション全体の達成回数が上限に達しているかチェック
    if (
      countData &&
      typeof countData.achievement_count === "number" &&
      typeof missionData.max_achievement_count === "number" &&
      countData.achievement_count >= missionData.max_achievement_count
    ) {
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        "このミッションは全体の達成回数の上限に達しています。",
      );
    }
  }

  // ミッション達成を記録
  const achievementPayload = {
    user_id: validatedUserId,
    mission_id: validatedMissionId,
  };

  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .insert(achievementPayload)
    .select("id")
    .single();

  if (achievementError) {
    console.error(
      `Achievement Error: ${achievementError.code} ${achievementError.message}`,
    );
    return encodedRedirect(
      "error",
      `/missions/${validatedMissionId}`,
      `ミッション達成の記録に失敗しました: ${achievementError.message}`,
    );
  }

  if (!achievement) {
    return encodedRedirect(
      "error",
      `/missions/${validatedMissionId}`,
      "達成記録の作成に失敗しました。",
    );
  }

  // 成果物がある場合は mission_artifacts に記録
  if (
    validatedRequiredArtifactType &&
    validatedRequiredArtifactType !== ARTIFACT_TYPES.NONE.key
  ) {
    const artifactPayload: TablesInsert<"mission_artifacts"> = {
      achievement_id: achievement.id,
      user_id: validatedUserId,
      artifact_type: validatedRequiredArtifactType,
      description: validatedArtifactDescription || null,
    };

    let artifactTypeLabel = "OTHER";
    let validationError = null;

    // formDataの内容を全てログ出力
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = String(value);
    });
    console.log("[achieveMissionAction] formData:", formDataObj);

    if (validatedRequiredArtifactType === ARTIFACT_TYPES.LINK.key) {
      artifactTypeLabel = "LINK";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.LINK.key) {
        artifactPayload.link_url = validatedData.artifactLink;
        // CHECK制約: link_url必須、image_storage_pathはnull
        artifactPayload.image_storage_path = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
      artifactTypeLabel = "IMAGE";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
        artifactPayload.image_storage_path = validatedData.artifactImagePath;
        // CHECK制約: link_urlはnull
        artifactPayload.link_url = null;
      }
    } else if (
      validatedRequiredArtifactType ===
      ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      artifactTypeLabel = "IMAGE_WITH_GEOLOCATION";
      if (
        validatedData.requiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
      ) {
        artifactPayload.image_storage_path = validatedData.artifactImagePath;
        artifactPayload.link_url = null;
      }
    } else {
      // その他のタイプは両方nullに
      artifactPayload.link_url = null;
      artifactPayload.image_storage_path = null;
    }

    // CHECK制約: link_urlかimage_storage_pathのどちらか一方は必須
    if (!artifactPayload.link_url && !artifactPayload.image_storage_path) {
      validationError =
        validationError ||
        "リンクまたは画像のいずれか一方は必須です（CHECK制約違反防止）";
    }

    // バリデーションエラー時は詳細ログとともにリダイレクト
    if (validationError) {
      console.error(
        `[Artifact Validation Error] type=${artifactTypeLabel} payload=`,
        artifactPayload,
        "formData:",
        formDataObj,
        "error:",
        validationError,
      );
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        validationError,
      );
    }

    // insert前にpayloadと分岐情報を出力
    console.log(`[Artifact Insert] type=${artifactTypeLabel}`, artifactPayload);

    const { data: newArtifact, error: artifactError } = await supabase
      .from("mission_artifacts")
      .insert(artifactPayload)
      .select("id") // 作成された artifact の ID を取得
      .single();

    if (artifactError) {
      console.error(
        `[Artifact Error] type=${artifactTypeLabel} payload=`,
        artifactPayload,
        "formData:",
        formDataObj,
        `error= ${artifactError.code} ${artifactError.message}`,
      );
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        `成果物の保存に失敗しました: ${artifactError.message}`,
      );
    }

    if (!newArtifact) {
      return encodedRedirect(
        "error",
        `/missions/${validatedMissionId}`,
        "成果物レコードの作成に失敗しました。",
      );
    }

    // 位置情報がある場合は mission_artifact_geolocations に記録
    if (
      validatedRequiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key &&
      validatedData.requiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      const geolocationPayload: TablesInsert<"mission_artifact_geolocations"> =
        {
          mission_artifact_id: newArtifact.id,
          lat: Number.parseFloat(validatedData.latitude),
          lon: Number.parseFloat(validatedData.longitude),
          accuracy: validatedData.accuracy
            ? Number.parseFloat(validatedData.accuracy)
            : null,
          altitude: validatedData.altitude
            ? Number.parseFloat(validatedData.altitude)
            : null,
        };
      const { error: geoError } = await supabase
        .from("mission_artifact_geolocations")
        .insert(geolocationPayload);

      if (geoError) {
        console.error(
          `Geolocation Error: ${geoError.code} ${geoError.message}`,
        );
        // 成果物レコードは作成済みだが、位置情報保存に失敗した場合のハンドリング
        // ここではエラーメッセージを出すに留めるが、より丁寧なエラー処理も検討可能
        return encodedRedirect(
          "error",
          `/missions/${validatedMissionId}`,
          `位置情報の保存に失敗しました: ${geoError.message}`,
        );
      }
    }
  }

  return encodedRedirect(
    "success",
    `/missions/${validatedMissionId}/complete`,
    "ミッションを達成しました！",
  );
};

export const cancelSubmissionAction = async (formData: FormData) => {
  const achievementId = formData.get("achievementId")?.toString();
  const missionId = formData.get("missionId")?.toString();

  // zodによるバリデーション
  const validatedFields = cancelSubmissionFormSchema.safeParse({
    achievementId,
    missionId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
    };
  }

  const {
    achievementId: validatedAchievementId,
    missionId: validatedMissionId,
  } = validatedFields.data;

  const supabase = await createClient();

  // ユーザーがログイン済みかチェック
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { success: false, error: "認証エラーが発生しました。" };
  }

  // 達成記録が存在し、ユーザーのものかチェック
  const { data: achievement, error: achievementFetchError } = await supabase
    .from("achievements")
    .select("id, user_id")
    .eq("id", validatedAchievementId)
    .eq("user_id", authUser.id)
    .single();

  if (achievementFetchError || !achievement) {
    console.error("Achievement fetch error:", achievementFetchError);
    return {
      success: false,
      error: "達成記録が見つからないか、アクセス権限がありません。",
    };
  }

  // 達成記録を削除（CASCADE により関連する mission_artifacts と mission_artifact_geolocations も削除される）
  const { error: deleteError } = await supabase
    .from("achievements")
    .delete()
    .eq("id", validatedAchievementId);

  if (deleteError) {
    console.error(`Delete Error: ${deleteError.code} ${deleteError.message}`);
    return {
      success: false,
      error: `提出のキャンセルに失敗しました: ${deleteError.message}`,
    };
  }

  return { success: true, message: "提出をキャンセルしました。" };
};
