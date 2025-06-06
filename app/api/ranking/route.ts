import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("*")
      .limit(100);

    if (error) {
      console.error("Failed to fetch ranking:", error);
      return NextResponse.json(
        { error: "Failed to fetch ranking data" },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Ranking API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
