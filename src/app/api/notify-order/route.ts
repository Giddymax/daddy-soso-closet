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

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["sms_recipient_phone", "order_whatsapp_number"]);

    const map: Record<string, string> = {};
    (settings ?? []).forEach((r) => { map[r.key] = r.value; });

    const smsPhone      = map.sms_recipient_phone   || "0552315639";
    const whatsappPhone = map.order_whatsapp_number || "0201668641";

    const message = formatOrderSMS({ branchName, customerName, customerPhone, customerLocation, items, total });

    const recipients = [...new Set([smsPhone, whatsappPhone])];
    await Promise.all(recipients.map((to) => sendSMS({ to, message })));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-order error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
