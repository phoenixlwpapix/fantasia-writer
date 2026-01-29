import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userAuthError,
    } = await supabase.auth.getUser();
    if (userAuthError || !user) {
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

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(`
        id,
        user_id,
        email,
        full_name,
        avatar_url,
        bio,
        created_at
      `);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${profilesError.message}` },
        { status: 500 }
      );
    }

    // Get books count per user
    const { data: booksData, error: booksError } = await supabase
      .from("books")
      .select("user_id");

    if (booksError) {
      console.error("Error fetching books:", booksError);
    }

    // Count books per user
    const booksCountMap = new Map<string, number>();
    booksData?.forEach((book) => {
      const count = booksCountMap.get(book.user_id) || 0;
      booksCountMap.set(book.user_id, count + 1);
    });

    // Get all chapters with their book's user_id
    const { data: chaptersData, error: chaptersError } = await supabase
      .from("chapters")
      .select(`
        word_count,
        books!inner(user_id)
      `);

    if (chaptersError) {
      console.error("Error fetching chapters:", chaptersError);
    }

    // Sum words per user
    const wordsCountMap = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chaptersData?.forEach((chapter: any) => {
      // books is an array when using inner join
      const userId = Array.isArray(chapter.books)
        ? chapter.books[0]?.user_id
        : chapter.books?.user_id;
      if (userId) {
        const count = wordsCountMap.get(userId) || 0;
        wordsCountMap.set(userId, count + (chapter.word_count || 0));
      }
    });

    // Get user credits
    const { data: creditsData, error: creditsError } = await supabase
      .from("user_credits")
      .select("user_id, credits");

    if (creditsError) {
      console.error("Error fetching credits:", creditsError);
    }

    // Map credits per user
    const creditsMap = new Map<string, number>();
    creditsData?.forEach((record) => {
      creditsMap.set(record.user_id, record.credits || 0);
    });

    // Get auth users data for email confirmation status
    const { data: authUsers, error: authListError } =
      await supabase.auth.admin.listUsers();

    let authUsersMap = new Map();
    if (!authListError && authUsers?.users) {
      authUsersMap = authUsers.users.reduce((map, u) => {
        map.set(u.id, u.email_confirmed_at);
        return map;
      }, new Map());
    }

    // Format the data for frontend
    const userList =
      profiles?.map(
        (profile: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          bio: string;
          created_at: string;
        }) => ({
          id: profile.user_id,
          email: profile.email || "",
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          bio: profile.bio || "",
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          books: booksCountMap.get(profile.user_id) || 0,
          words: wordsCountMap.get(profile.user_id) || 0,
          credits: creditsMap.get(profile.user_id) || 0,
          status: authUsersMap.get(profile.user_id) ? "active" : "inactive",
        })
      ) || [];

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
