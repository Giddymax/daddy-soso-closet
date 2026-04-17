import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface OrderItem {
  product_id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { branchId, items } = await req.json() as { branchId: string; items: OrderItem[] };

    if (!branchId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing branchId or items" }, { status: 400 });
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = await Promise.all(
      items.map(async ({ product_id, quantity }) => {
        const { data: inv } = await adminSupabase
          .from("inventory")
          .select("id, quantity")
          .eq("branch_id", branchId)
          .eq("product_id", product_id)
          .single();

        if (!inv) return { product_id, success: false, reason: "not found" };

        const newQty = Math.max(0, inv.quantity - quantity);
        const { error } = await adminSupabase
          .from("inventory")
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq("id", inv.id);

        return { product_id, success: !error };
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("branch-order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
