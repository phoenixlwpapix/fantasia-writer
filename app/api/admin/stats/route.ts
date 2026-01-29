import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam) : 7;

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

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // 1. Get totals (All time)
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: totalBooks } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true });

    const { data: allChapters } = await supabase
      .from("chapters")
      .select("word_count");

    const totalWords = allChapters?.reduce((sum, c) => sum + (c.word_count || 0), 0) || 0;

    const { data: creditsData } = await supabase
      .from("user_credits")
      .select("credits");

    const totalCredits = creditsData?.reduce((sum, c) => sum + (c.credits || 0), 0) || 0;

    // 2. Get historical data for chart (Last N days)
    // We fetch raw records and aggregate in JS to avoid complex SQL via API

    // Recent Users
    const { data: recentUsers } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", startDateStr);

    // Recent Books
    const { data: recentBooks } = await supabase
      .from("books")
      .select("created_at")
      .gte("created_at", startDateStr);

    // Recent Chapters (for words)
    const { data: recentChapters } = await supabase
      .from("chapters")
      .select("created_at, word_count")
      .gte("created_at", startDateStr);

    // 3. Aggregate data by date
    const chartDataMap = new Map<string, { users: number; books: number; words: number }>();

    // Initialize map with all dates in range
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      chartDataMap.set(dateKey, { users: 0, books: 0, words: 0 });
    }

    // Helper to fill map
    const processRecords = (records: { created_at: string; word_count?: number }[] | null, type: 'users' | 'books' | 'words') => {
      records?.forEach(record => {
        const dateKey = new Date(record.created_at).toISOString().split('T')[0];
        if (chartDataMap.has(dateKey)) {
          const entry = chartDataMap.get(dateKey)!;
          if (type === 'users') entry.users += 1;
          else if (type === 'books') entry.books += 1;
          else if (type === 'words') entry.words += (record.word_count || 0);
        }
      });
    };

    processRecords(recentUsers || [], 'users');
    processRecords(recentBooks || [], 'books');
    processRecords(recentChapters || [], 'words');

    // Convert map to array and format date
    const chartData = Array.from(chartDataMap.entries()).map(([dateKey, values]) => {
      const date = new Date(dateKey);
      const name = days === 7
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        : `${date.getMonth() + 1}/${date.getDate()}`;

      return {
        name,
        date: dateKey, // keep full date for tooltip if needed
        ...values
      };
    });

    // Calculate trends (comparing last portion of range vs previous - simplified for now)
    // For now we keep mock trends or calculate based on split range if precise needed
    // Leaving trends static/mocked to focus on chart data first
    const userTrend = 12;
    const bookTrend = 8.5;
    const wordTrend = 24;

    const stats = {
      totalUsers: totalUsers || 0,
      totalBooks: totalBooks || 0,
      totalWords: totalWords,
      totalCredits: totalCredits,
      userTrend,
      bookTrend,
      wordTrend,
    };

    return NextResponse.json({ stats, chartData });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
