import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS, formatSalesSMS } from "@/lib/arkesel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchName, receiptNumber, items, total, staffName, paymentMethod } = body;

    // Query today's cumulative totals for every branch
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [salesRes, branchesRes] = await Promise.all([
      supabase
        .from("sales")
        .select("branch_id, total_amount")
        .gte("created_at", todayStart.toISOString()),
      supabase
        .from("branches")
        .select("id, display_name")
        .order("name"),
    ]);

    const allSales = salesRes.data ?? [];
    const allBranches = branchesRes.data ?? [];

    const dailyTotals = allBranches.map((b) => {
      const branchSales = allSales.filter((s) => s.branch_id === b.id);
      return {
        branchName: b.display_name,
        total: branchSales.reduce((sum, s) => sum + Number(s.total_amount), 0),
        count: branchSales.length,
      };
    });

    const message = formatSalesSMS({
      branchName, receiptNumber, items, total, staffName, paymentMethod, dailyTotals,
    });

    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE ?? "0594299293";
    const result = await sendSMS({ to: adminPhone, message });

    if (!result.success) {
      console.error("SMS failed:", result.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-sale error:", err);
    return NextResponse.json({ success: false }, { status: 200 }); // Don't break sale flow
  }
}
