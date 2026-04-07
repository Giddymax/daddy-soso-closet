interface SMSPayload {
  to: string;
  message: string;
}

interface SMSResult {
  success: boolean;
  error?: string;
}

export async function sendSMS(payload: SMSPayload): Promise<SMSResult> {
  try {
    const response = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.ARKESEL_API_KEY || "",
      },
      body: JSON.stringify({
        sender: "DaddySoSo",
        message: payload.message,
        recipients: [payload.to],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: err };
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

export function formatSalesSMS(params: {
  branchName: string;
  receiptNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  staffName: string;
  paymentMethod: string;
  dailyTotals: Array<{ branchName: string; total: number; count: number }>;
}): string {
  const itemLines = params.items
    .map((i) => `  ${i.name} x${i.quantity} (GH\u20b5${i.price.toFixed(2)})`)
    .join("\n");

  const now = new Date().toLocaleString("en-GH", {
    timeZone: "Africa/Accra",
    dateStyle: "short",
    timeStyle: "short",
  });

  const dailyLines = params.dailyTotals
    .map((b) => `  ${b.branchName}: GH\u20b5${b.total.toFixed(2)} (${b.count} sale${b.count !== 1 ? "s" : ""})`)
    .join("\n");

  return `[SALE] Daddy SoSo Closet
Branch: ${params.branchName}
Receipt: ${params.receiptNumber}
Items:
${itemLines}
Sale Total: GH\u20b5${params.total.toFixed(2)}
Staff: ${params.staffName}
Payment: ${params.paymentMethod.toUpperCase()}
Time: ${now}

Today's Running Totals:
${dailyLines}`;
}

export function formatRestockSMS(params: {
  branchName: string;
  productName: string;
  quantityAdded: number;
  staffName: string;
}): string {
  const now = new Date().toLocaleString("en-GH", {
    timeZone: "Africa/Accra",
    dateStyle: "short",
    timeStyle: "short",
  });

  return `[RESTOCK] Daddy SoSo Closet
Branch: ${params.branchName}
Product: ${params.productName}
+${params.quantityAdded} units added
By: ${params.staffName}
Time: ${now}`;
}
