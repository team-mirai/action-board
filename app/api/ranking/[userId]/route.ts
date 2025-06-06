import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch current user ranking:", error);
      return NextResponse.json(
        { error: "Failed to fetch user ranking" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Current user ranking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
