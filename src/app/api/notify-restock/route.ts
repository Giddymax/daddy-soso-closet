import { NextRequest, NextResponse } from "next/server";
import { sendSMS, formatRestockSMS } from "@/lib/arkesel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { branchName, productName, quantityAdded, staffName } = body;

    const message = formatRestockSMS({ branchName, productName, quantityAdded, staffName });
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE ?? "0594299293";
    const result = await sendSMS({ to: adminPhone, message });

    if (!result.success) {
      console.error("Restock SMS failed:", result.error);
    }

    return NextResponse.json({ success: result.success });
  } catch (err) {
    console.error("notify-restock error:", err);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
