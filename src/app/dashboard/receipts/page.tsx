"use client";
import { useEffect, useState, useCallback } from "react";
import { ReceiptText, Printer } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatGhanaDateTime } from "@/lib/utils";
import ReceiptModal from "@/components/dashboard/ReceiptModal";
import type { CartItem } from "@/types";

interface SaleRow {
  id: string;
  receipt_number: string;
  total_amount: number;
  payment_method: string;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  staff: { full_name: string } | null;
  sale_items: { quantity: number; unit_price: number; product: { name: string } | null }[];
}

const PAY_LABEL: Record<string, string> = { cash: "Cash", momo: "MoMo", card: "Card" };

export default function StaffSalesPage() {
  const { staff, branch } = useAuthStore();
  const supabase = createBrowserClient();
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
  const [phone, setPhone] = useState("0594299293");

  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "phone_number").single()
      .then(({ data }) => { if (data?.value) setPhone(data.value); });
  }, [supabase]);

  const load = useCallback(async () => {
    if (!branch) return;
    setLoading(true);
    let query = supabase
      .from("sales")
      .select("id, receipt_number, total_amount, payment_method, created_at, customer_name, customer_phone, staff:staff(full_name), sale_items(quantity, unit_price, product:products(name))")
      .eq("branch_id", branch.id)
      .order("created_at", { ascending: false });

    if (dateFilter) {
      const start = new Date(dateFilter); start.setHours(0, 0, 0, 0);
      const end = new Date(dateFilter); end.setHours(23, 59, 59, 999);
      query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());
    }

    const { data } = await query;
    setSales((data as unknown as SaleRow[]) ?? []);
    setLoading(false);
  }, [branch, supabase, dateFilter]);

  useEffect(() => { load(); }, [load]);

  function saleToCartItems(sale: SaleRow): CartItem[] {
    return sale.sale_items.map((si) => ({
      product_id: "",
      name: si.product?.name ?? "Unknown",
      price: si.unit_price,
      quantity: si.quantity,
      max_quantity: 99,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Sales</h1>
          <p className="text-gray-500 text-sm">{branch?.display_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F9FA]">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Receipt #</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Date & Time</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Cashier</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Customer</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Items</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td></tr>
                  ))
                : sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#0077B6] font-semibold">{sale.receipt_number}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">{formatGhanaDateTime(sale.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{(sale.staff as { full_name: string } | null)?.full_name ?? staff?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                        {sale.customer_name
                          ? <span>{sale.customer_name}{sale.customer_phone ? <span className="text-gray-400 ml-1">· {sale.customer_phone}</span> : null}</span>
                          : <span className="text-gray-300 italic">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 text-sm">{sale.sale_items.length}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#023E8A]">{formatCurrency(Number(sale.total_amount))}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          sale.payment_method === "cash" ? "bg-green-100 text-green-700" :
                          sale.payment_method === "momo" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{PAY_LABEL[sale.payment_method] ?? sale.payment_method}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="flex items-center gap-1 bg-[#0077B6]/10 text-[#0077B6] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0077B6] hover:text-white transition-colors ml-auto"
                          title="Print receipt"
                        >
                          <Printer size={12} /> Print
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {!loading && sales.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <ReceiptText size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No sales found{dateFilter ? " for this date" : ""}.</p>
            </div>
          )}
        </div>
      </div>

      {selectedSale && (
        <ReceiptModal
          receiptNumber={selectedSale.receipt_number}
          items={saleToCartItems(selectedSale)}
          total={Number(selectedSale.total_amount)}
          paymentMethod={selectedSale.payment_method}
          staffName={(selectedSale.staff as { full_name: string } | null)?.full_name ?? staff?.full_name ?? ""}
          branchName={branch?.display_name ?? ""}
          branchLocation={branch?.location ?? ""}
          phone={phone}
          customerName={selectedSale.customer_name ?? ""}
          customerPhone={selectedSale.customer_phone ?? ""}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
