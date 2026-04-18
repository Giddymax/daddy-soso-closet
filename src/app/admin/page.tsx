"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, Package, BarChart2, FileEdit, Settings, Scissors } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";

interface BranchStats {
  id: string;
  name: string;
  display_name: string;
  type: string;
  todayRevenue: number;
  itemsSold: number;
  lowStockCount: number;
  salonServicesCount: number;
  salonServicesRevenue: number;
}

export default function AdminPage() {
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [combined, setCombined] = useState({ today: 0, week: 0 });
  const [branches, setBranches] = useState<BranchStats[]>([]);

  useEffect(() => {
    async function load() {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);

      const [branchesRes, todaySalesRes, weekSalesRes] = await Promise.all([
        supabase.from("branches").select("id, name, display_name, type"),
        supabase.from("sales").select("id, branch_id, total_amount, sale_items(quantity)").gte("created_at", todayStart.toISOString()),
        supabase.from("sales").select("total_amount").gte("created_at", weekStart.toISOString()),
      ]);

      const allBranches = branchesRes.data ?? [];
      const todaySales = todaySalesRes.data ?? [];
      const weekSales = weekSalesRes.data ?? [];

      const todayTotal = todaySales.reduce((s, r) => s + Number(r.total_amount), 0);
      const weekTotal = weekSales.reduce((s, r) => s + Number(r.total_amount), 0);
      setCombined({ today: todayTotal, week: weekTotal });

      const todaySaleIds = todaySales.map((s) => s.id);
      const { data: salonItemsData } = todaySaleIds.length
        ? await supabase.from("salon_sale_items").select("sale_id, quantity, unit_price").in("sale_id", todaySaleIds)
        : { data: [] };
      const salonItems = salonItemsData ?? [];

      const branchStats: BranchStats[] = await Promise.all(
        allBranches.map(async (b) => {
          const bSales = todaySales.filter((s) => s.branch_id === b.id);
          const bSaleIds = bSales.map((s) => s.id);
          const todayRevenue = bSales.reduce((s, r) => s + Number(r.total_amount), 0);
          const itemsSold = bSales.reduce((s, r) => s + r.sale_items.reduce((a: number, i: { quantity: number }) => a + i.quantity, 0), 0);
          const bSalonItems = salonItems.filter((si) => bSaleIds.includes(si.sale_id));
          const salonServicesCount = bSalonItems.reduce((s, i) => s + i.quantity, 0);
          const salonServicesRevenue = bSalonItems.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
          const { data: inv } = await supabase.from("inventory").select("quantity, restock_threshold").eq("branch_id", b.id);
          const lowStockCount = (inv ?? []).filter((i) => i.quantity <= i.restock_threshold).length;
          return { ...b, type: b.type ?? "", todayRevenue, itemsSold, lowStockCount, salonServicesCount, salonServicesRevenue };
        })
      );

      setBranches(branchStats);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const quickLinks = [
    { href: "/admin/analytics", label: "Analytics", icon: BarChart2, color: "bg-purple-50 text-purple-700" },
    { href: "/admin/products", label: "Products", icon: Package, color: "bg-blue-50 text-blue-700" },
    { href: "/admin/staff", label: "Staff", icon: Users, color: "bg-green-50 text-green-700" },
    { href: "/admin/sales-edit", label: "Edit Sales", icon: FileEdit, color: "bg-orange-50 text-orange-700" },
    { href: "/admin/settings", label: "Site Settings", icon: Settings, color: "bg-pink-50 text-pink-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Admin Overview</h1>
        <p className="text-gray-500 text-sm mt-1">All branches combined performance.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Combined stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card p-6 border-l-4 border-[#0077B6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Combined Sales Today</span>
                <TrendingUp size={20} className="text-[#0077B6]" />
              </div>
              <p className="text-3xl font-bold text-[#023E8A]">{formatCurrency(combined.today)}</p>
              <p className="text-xs text-gray-400 mt-1">Both branches</p>
            </div>
            <div className="card p-6 border-l-4 border-[#D4AF37]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">This Week (7 days)</span>
                <TrendingUp size={20} className="text-[#D4AF37]" />
              </div>
              <p className="text-3xl font-bold text-[#023E8A]">{formatCurrency(combined.week)}</p>
              <p className="text-xs text-gray-400 mt-1">Both branches</p>
            </div>
          </div>

          {/* Per-branch cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((b) => (
              <div key={b.id} className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair font-bold text-[#023E8A] text-lg">{b.display_name}</h3>
                  <Link
                    href={`/admin/analytics?branch=${b.id}`}
                    className="text-xs text-[#0077B6] font-semibold hover:underline flex items-center gap-1"
                  >
                    <BarChart2 size={13} /> View Analytics
                  </Link>
                </div>
                <div className={`grid gap-2 text-center ${b.type === "boutique_salon" ? "grid-cols-2" : "grid-cols-3"}`}>
                  <div>
                    <p className="text-sm sm:text-xl font-bold text-[#0077B6] leading-tight break-all">{formatCurrency(b.todayRevenue)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Today</p>
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{b.itemsSold}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Items Sold</p>
                  </div>
                  {b.type !== "boutique_salon" && (
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-red-500">{b.lowStockCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Low Stock</p>
                    </div>
                  )}
                </div>
                {b.type === "boutique_salon" && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-[#D4AF37]">{b.salonServicesCount}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-0.5"><Scissors size={10} /> Services</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#023E8A] leading-tight break-all">{formatCurrency(b.salonServicesRevenue)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Salon Rev.</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-red-500">{b.lowStockCount}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Low Stock</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div>
            <h2 className="font-semibold text-[#023E8A] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickLinks.map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href}
                  className={`card p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-1 transition-transform ${color}`}>
                  <Icon size={24} />
                  <span className="text-xs font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
