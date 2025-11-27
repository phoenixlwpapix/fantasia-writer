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

    // Get all users with their stats using admin function
    const { data: users, error } = await supabase.rpc("get_admin_users");

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Format the data for frontend
    const userList =
      users?.map((user: any) => ({
        id: user.id,
        email: user.email || "",
        fullName: user.full_name || "",
        avatarUrl: user.avatar_url || "",
        bio: user.bio || "",
        joinDate: new Date(user.created_at).toLocaleDateString(),
        books: user.total_books || 0,
        words: user.total_words || 0,
        credits: user.credits || 0,
        status: user.email_confirmed_at ? "active" : "inactive",
      })) || [];

    return NextResponse.json({ users: userList });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
