"use client";
import { useEffect, useState } from "react";
import { TrendingUp, Package, AlertTriangle, ReceiptText } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatGhanaDateTime } from "@/lib/utils";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";

export default function DashboardPage() {
  const { staff } = useAuthStore();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    itemsSold: 0,
    lowStock: [] as { name: string; quantity: number }[],
    recentSales: [] as { receipt_number: string; total_amount: number; created_at: string }[],
  });

  useEffect(() => {
    if (!staff) return;
    async function load() {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [salesRes, inventoryRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, total_amount, receipt_number, created_at, sale_items(quantity)")
          .eq("branch_id", staff!.branch_id ?? "")
          .gte("created_at", today.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("inventory")
          .select("quantity, restock_threshold, product:products(name)")
          .eq("branch_id", staff!.branch_id ?? ""),
      ]);

      const sales = salesRes.data ?? [];
      const todaySales = sales.reduce((s, r) => s + Number(r.total_amount), 0);
      const itemsSold = sales.reduce(
        (s, r) => s + r.sale_items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0), 0
      );

      const lowStock = (inventoryRes.data ?? [])
        .filter((i) => i.quantity <= i.restock_threshold)
        .map((i) => ({ name: (i.product as unknown as { name: string } | null)?.name ?? "Unknown", quantity: i.quantity }));

      setStats({ todaySales, itemsSold, lowStock, recentSales: sales.slice(0, 10) });
      setLoading(false);
    }
    load();
  }, [staff, supabase]);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#2C1A0E]">
          Good day, {staff?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-stone-500 text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-[#8B5E3C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">Today&apos;s Sales</span>
            <TrendingUp size={20} className="text-[#8B5E3C]" />
          </div>
          <p className="text-3xl font-bold text-[#2C1A0E]">{formatCurrency(stats.todaySales)}</p>
        </div>
        <div className="card p-6 border-l-4 border-[#C4954A]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">Items Sold Today</span>
            <Package size={20} className="text-[#C4954A]" />
          </div>
          <p className="text-3xl font-bold text-[#2C1A0E]">{stats.itemsSold}</p>
        </div>
        <div className="card p-6 border-l-4 border-red-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">Low Stock Alerts</span>
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-500">{stats.lowStock.length}</p>
        </div>
      </div>

      {/* Low stock */}
      {stats.lowStock.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-[#2C1A0E] mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" /> Low Stock Items
          </h3>
          <div className="space-y-2">
            {stats.lowStock.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-700">{item.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.quantity === 0 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                  {item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sales */}
      <div className="card p-6">
        <h3 className="font-semibold text-[#2C1A0E] mb-4 flex items-center gap-2">
          <ReceiptText size={16} /> Recent Sales
        </h3>
        {stats.recentSales.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">No sales recorded today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left py-2 px-3 text-stone-500 font-medium">Receipt</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">Total</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((s) => (
                  <tr key={s.receipt_number} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="py-2 px-3 font-mono text-xs text-[#8B5E3C]">{s.receipt_number}</td>
                    <td className="py-2 px-3 text-right font-semibold text-[#2C1A0E]">{formatCurrency(Number(s.total_amount))}</td>
                    <td className="py-2 px-3 text-right text-stone-400 text-xs">{formatGhanaDateTime(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
