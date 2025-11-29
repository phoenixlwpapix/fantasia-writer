import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "../../../../lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient();

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

    // Get all users with their stats from profiles table
    const { data: profiles, error } = await supabase.from("profiles").select(`
        id,
        user_id,
        email,
        full_name,
        avatar_url,
        bio,
        books_count,
        words_count,
        credits_count,
        created_at
      `);

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json(
        { error: `Failed to fetch profiles: ${error.message}` },
        { status: 500 }
      );
    }

    // Get auth users data for email confirmation status
    const userIds = profiles?.map((p) => p.user_id) || [];
    const { data: authUsers, error: authListError } =
      await supabase.auth.admin.listUsers();

    let authUsersMap = new Map();
    if (!authListError && authUsers.users) {
      authUsersMap = authUsers.users.reduce((map, user) => {
        map.set(user.id, user.email_confirmed_at);
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
          books_count: number;
          words_count: number;
          credits_count: number;
          created_at: string;
        }) => ({
          id: profile.user_id,
          email: profile.email || "",
          fullName: profile.full_name || "",
          avatarUrl: profile.avatar_url || "",
          bio: profile.bio || "",
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          books: profile.books_count || 0,
          words: profile.words_count || 0,
          credits: profile.credits_count || 0,
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
