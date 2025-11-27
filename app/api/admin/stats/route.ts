import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "../../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();

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

    // Get total users count (users who have created books)
    const { data: usersData, error: usersError } = await supabase
      .from("books")
      .select("user_id");

    if (usersError) {
      console.error("Error getting users:", usersError);
    }

    const totalUsers =
      new Set(usersData?.map((book) => book.user_id)).size || 0;

    // Get total books count
    const { count: totalBooks, error: booksError } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    if (booksError) {
      console.error("Error counting books:", booksError);
    }

    // Get total words count
    const { data: chaptersData, error: chaptersError } = await supabase
      .from("chapters")
      .select("word_count");

    if (chaptersError) {
      console.error("Error getting chapters:", chaptersError);
    }

    const totalWords =
      chaptersData?.reduce(
        (sum, chapter) => sum + (chapter.word_count || 0),
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
