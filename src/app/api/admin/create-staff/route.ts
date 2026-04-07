import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { full_name, email, password, phone, branch_id } = await req.json();

    if (!full_name || !email || !password || !branch_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use service role client for admin operations
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
    }

    // Insert staff record
    const { error: staffError } = await adminSupabase.from("staff").insert({
      id: authData.user.id,
      full_name,
      email,
      phone: phone ?? null,
      role: "staff",
      branch_id,
      is_active: true,
    });

    if (staffError) {
      // Rollback: delete the auth user
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: staffError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    console.error("create-staff error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
