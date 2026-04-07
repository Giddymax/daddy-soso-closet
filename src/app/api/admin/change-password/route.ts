import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();
    if (!userId || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password too short" }, { status: 400 });

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await adminSupabase.auth.admin.updateUserById(userId, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("change-password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
