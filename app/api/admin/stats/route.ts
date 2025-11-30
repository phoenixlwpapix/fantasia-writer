import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all stats from profiles table in a single query
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("books_count, words_count");

    if (profilesError) {
      console.error("Error getting profiles data:", profilesError);
      return NextResponse.json(
        { error: `Failed to get profiles data: ${profilesError.message}` },
        { status: 500 }
      );
    }

    // Calculate stats from profiles data
    const totalUsers = profilesData?.length || 0;
    const totalBooks =
      profilesData?.reduce(
        (sum, profile) => sum + (profile.books_count || 0),
        0
      ) || 0;
    const totalWords =
      profilesData?.reduce(
        (sum, profile) => sum + (profile.words_count || 0),
        0
      ) || 0;

    // Calculate trends (mock for now - can be enhanced with real time-series data)
    const userTrend = 12; // Percentage growth
    const bookTrend = 8.5;
    const wordTrend = 24;

    const stats = {
      totalUsers: totalUsers || 0,
      totalBooks: totalBooks || 0,
      totalWords: totalWords,
      userTrend,
      bookTrend,
      wordTrend,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
