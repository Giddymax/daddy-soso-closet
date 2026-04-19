import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS, formatOrderSMS } from "@/lib/arkesel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchName, customerName, customerPhone, customerLocation, items, total } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: phoneSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "sms_recipient_phone")
      .single();
    const adminPhone = phoneSetting?.value || process.env.ARKESEL_RECIPIENT_PHONE || "0552315639";

    const message = formatOrderSMS({ branchName, customerName, customerPhone, customerLocation, items, total });
    const result = await sendSMS({ to: adminPhone, message });

    if (!result.success) {
      console.error("Order SMS failed:", result.error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
