import { NextRequest, NextResponse } from "next/server";
import { sendSMS, formatSalesSMS } from "@/lib/arkesel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchName, receiptNumber, items, total, staffName, paymentMethod } = body;

    const message = formatSalesSMS({ branchName, receiptNumber, items, total, staffName, paymentMethod });
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE ?? "0594299293";
    const result = await sendSMS({ to: adminPhone, message });

    if (!result.success) {
      console.error("SMS failed:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 200 }); // Don't break client
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-sale error:", err);
    return NextResponse.json({ success: false }, { status: 200 }); // Still 200 — don't break sale flow
  }
}
