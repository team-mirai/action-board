"use server";

import { createClient } from "@/utils/supabase/server";
import type { TablesInsert } from "@/utils/types/supabase"; // ARTIFACT_TYPESのimportより前に移動
import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(`${error.code} ${error.message}`);
    return encodedRedirect("error", "/sign-up", error.message);
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

import { ARTIFACT_TYPES } from "@/lib/artifactTypes"; // パス変更

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

  if (!missionId) {
    return encodedRedirect("error", "/missions", "ミッションIDがありません。");
  }
  if (!userId) {
    // 本来はサーバーサイドで認証情報から取得するべき
    return encodedRedirect(
      "error",
      `/missions/${missionId}`,
      "ユーザーIDがありません。",
    );
  }

  const supabase = await createClient();

  // ユーザーがログイン済みかチェック (念のため)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser || authUser.id !== userId) {
    return encodedRedirect(
      "error",
      `/missions/${missionId}`,
      "認証エラーが発生しました。",
    );
  }

  // ミッション情報を取得して、max_achievement_count を確認
  const { data: missionData, error: missionFetchError } = await supabase
    .from("missions")
    .select("max_achievement_count")
    .eq("id", missionId)
    .single();

  if (missionFetchError) {
    console.error(`Mission fetch error: ${missionFetchError.message}`);
    return encodedRedirect(
      "error",
      `/missions/${missionId}`,
      "ミッション情報の取得に失敗しました。",
    );
  }

  if (missionData?.max_achievement_count !== null) {
    // ユーザーの達成回数を取得
    const { data: userAchievements, error: userAchievementError } =
      await supabase
        .from("achievements")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("mission_id", missionId);

    if (userAchievementError) {
      console.error(
        `User achievement count fetch error: ${userAchievementError.message}`,
      );
      return encodedRedirect(
        "error",
        `/missions/${missionId}`,
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
        `/missions/${missionId}`,
        "あなたはこのミッションの達成回数の上限に達しています。",
      );
    }

    // ミッション全体の達成回数を取得（全体の上限がある場合）
    const { data: countData, error: countError } = await supabase
      .from("mission_achievement_count_view")
      .select("achievement_count")
      .eq("mission_id", missionId)
      .single();

    if (countError) {
      console.error(`Achievement count fetch error: ${countError.message}`);
      return encodedRedirect(
        "error",
        `/missions/${missionId}`,
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
        `/missions/${missionId}`,
        "このミッションは全体の達成回数の上限に達しています。",
      );
    }
  }

  // ミッション達成を記録
  const achievementPayload = {
    user_id: userId,
    mission_id: missionId,
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
      `/missions/${missionId}`,
      `ミッション達成の記録に失敗しました: ${achievementError.message}`,
    );
  }

  if (!achievement) {
    return encodedRedirect(
      "error",
      `/missions/${missionId}`,
      "達成記録の作成に失敗しました。",
    );
  }

  // 成果物がある場合は mission_artifacts に記録
  if (
    requiredArtifactType &&
    requiredArtifactType !== ARTIFACT_TYPES.NONE.key
  ) {
    const artifactPayload: TablesInsert<"mission_artifacts"> = {
      achievement_id: achievement.id,
      user_id: userId,
      artifact_type: requiredArtifactType,
      description: artifactDescription || null,
    };

    let artifactTypeLabel = "OTHER";
    let validationError = null;

    // formDataの内容を全てログ出力
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = String(value);
    });
    console.log("[achieveMissionAction] formData:", formDataObj);

    if (requiredArtifactType === ARTIFACT_TYPES.LINK.key) {
      artifactTypeLabel = "LINK";
      if (!artifactLink) {
        validationError = "リンクURLが入力されていません。";
      } else {
        artifactPayload.link_url = artifactLink;
      }
      // CHECK制約: link_url必須、image_storage_pathはnull
      artifactPayload.image_storage_path = null;
    } else if (requiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
      artifactTypeLabel = "IMAGE";
      // image_storage_pathはnull許容だが、UIで必須ならここでチェック
      if (!artifactImagePath) {
        validationError = "画像がアップロードされていません。";
      }
      artifactPayload.image_storage_path = artifactImagePath || null;
      // CHECK制約: link_urlはnull
      artifactPayload.link_url = null;
    } else if (
      requiredArtifactType === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      artifactTypeLabel = "IMAGE_WITH_GEOLOCATION";
      if (!artifactImagePath) {
        validationError = "画像がアップロードされていません。";
      }
      artifactPayload.image_storage_path = artifactImagePath || null;
      artifactPayload.link_url = null;
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
        `/missions/${missionId}`,
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
        `/missions/${missionId}`,
        `成果物の保存に失敗しました: ${artifactError.message}`,
      );
    }

    if (!newArtifact) {
      return encodedRedirect(
        "error",
        `/missions/${missionId}`,
        "成果物レコードの作成に失敗しました。",
      );
    }

    // 位置情報がある場合は mission_artifact_geolocations に記録
    if (
      requiredArtifactType === ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key &&
      latitude &&
      longitude
    ) {
      const geolocationPayload: TablesInsert<"mission_artifact_geolocations"> =
        {
          mission_artifact_id: newArtifact.id,
          lat: Number.parseFloat(latitude),
          lon: Number.parseFloat(longitude),
          accuracy: accuracy ? Number.parseFloat(accuracy) : null,
          altitude: altitude ? Number.parseFloat(altitude) : null,
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
          `/missions/${missionId}`,
          `位置情報の保存に失敗しました: ${geoError.message}`,
        );
      }
    }
  }

  return encodedRedirect(
    "success",
    `/missions/${missionId}/complete`,
    "ミッションを達成しました！",
  );
};

export const cancelSubmissionAction = async (formData: FormData) => {
  const achievementId = formData.get("achievementId")?.toString();
  const missionId = formData.get("missionId")?.toString();

  if (!achievementId) {
    return { success: false, error: "達成IDがありません。" };
  }
  if (!missionId) {
    return { success: false, error: "ミッションIDがありません。" };
  }

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
    .eq("id", achievementId)
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
    .eq("id", achievementId);

  if (deleteError) {
    console.error(`Delete Error: ${deleteError.code} ${deleteError.message}`);
    return {
      success: false,
      error: `提出のキャンセルに失敗しました: ${deleteError.message}`,
    };
  }

  return { success: true, message: "提出をキャンセルしました。" };
};
