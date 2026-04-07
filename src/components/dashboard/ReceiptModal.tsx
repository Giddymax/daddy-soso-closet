"use client";
import { useRef } from "react";
import { X, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

interface ReceiptModalProps {
  receiptNumber: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  staffName: string;
  branchName: string;
  branchLocation: string;
  phone?: string;
  customerName?: string;
  customerPhone?: string;
  onClose: () => void;
}

export default function ReceiptModal({
  receiptNumber, items, total, paymentMethod,
  staffName, branchName, branchLocation,
  phone = "0594299293", customerName, customerPhone, onClose,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = receiptRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt ${receiptNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 80mm;
      padding: 4mm 4mm;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .store-name { font-size: 16px; font-weight: bold; text-align: center; }
    .meta-row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; padding-bottom: 3px; border-bottom: 1px dashed #000; }
    th.right, td.right { text-align: right; }
    th.center, td.center { text-align: center; }
    td { padding: 2px 0; vertical-align: top; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin-top: 4px; }
    .footer { text-align: center; font-size: 10px; margin-top: 4px; }
  </style>
</head>
<body>${content}</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  }

  const now = new Date().toLocaleString("en-GH", {
    timeZone: "Africa/Accra", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

  const payLabel: Record<string, string> = { cash: "CASH", momo: "MOBILE MONEY", card: "CARD" };

  // Build meta rows — include customer fields only when provided
  const metaRows: [string, string][] = [
    ["Receipt #", receiptNumber],
    ["Date/Time", now],
    ["Branch", branchName],
    ["Cashier", staffName],
    ...(customerName ? [["Customer", customerName] as [string, string]] : []),
    ...(customerPhone ? [["Cust. Phone", customerPhone] as [string, string]] : []),
    ["Payment", payLabel[paymentMethod] ?? paymentMethod.toUpperCase()],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

        {/* Actions bar */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-[#023E8A]">Sale Complete!</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#0077B6] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#023E8A] transition-colors"
            >
              <Printer size={14} /> Print Receipt
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Receipt preview */}
        <div className="p-4">
          <div
            ref={receiptRef}
            style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "12px", color: "#000" }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
              DADDY SOSO CLOSET
            </div>
            <div style={{ textAlign: "center", fontSize: "11px", marginTop: "2px" }}>{branchName}</div>
            <div style={{ textAlign: "center", fontSize: "11px" }}>{branchLocation}</div>
            <div style={{ textAlign: "center", fontSize: "11px" }}>
              Tel: <a href={`tel:${phone}`} style={{ color: "inherit", textDecoration: "none" }}>{phone}</a>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

            {/* Meta */}
            <div style={{ fontSize: "11px" }}>
              {metaRows.map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                  <span>{label}:</span>
                  <span style={{ fontWeight: "bold" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px dashed #000", marginTop: "6px", marginBottom: "10px" }} />

            {/* Items */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: "3px", borderBottom: "1px dashed #000" }}>Item</th>
                  <th style={{ textAlign: "center", paddingBottom: "3px", borderBottom: "1px dashed #000", width: "28px" }}>Qty</th>
                  <th style={{ textAlign: "right", paddingBottom: "3px", borderBottom: "1px dashed #000" }}>Price</th>
                  <th style={{ textAlign: "right", paddingBottom: "3px", borderBottom: "1px dashed #000" }}>Sub</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.product_id}>
                    <td style={{ padding: "2px 4px 2px 0", verticalAlign: "top" }}>{item.name}</td>
                    <td style={{ textAlign: "center", padding: "2px 0" }}>{item.quantity}</td>
                    <td style={{ textAlign: "right", padding: "2px 0" }}>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: "right", padding: "2px 0", fontWeight: "bold" }}>
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "15px" }}>
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

            {/* Footer */}
            <div style={{ textAlign: "center", fontSize: "10px" }}>
              <div>Thank you for shopping with us!</div>
              <div>www.daddysosocloset.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
