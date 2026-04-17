import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { userId, full_name, phone, branch_id } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const updates: Record<string, string> = {};
    if (full_name) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (branch_id) updates.branch_id = branch_id;

    const { error } = await adminSupabase.from("staff").update(updates).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-staff error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
