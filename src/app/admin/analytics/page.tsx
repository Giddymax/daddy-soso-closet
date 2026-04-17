"use client";
import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download, TrendingUp, ShoppingBag, Users, BarChart2,
  Calendar, ChevronDown, RefreshCw,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";
import { formatCurrency, generateCSV } from "@/lib/utils";
import {
  format, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  subDays, eachDayOfInterval,
  eachMonthOfInterval, parseISO,
} from "date-fns";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ── Types ───────────────────────────────────────────────────────────────────
type Period = "today" | "yesterday" | "week" | "month" | "year" | "custom";

interface Sale {
  id: string;
  total_amount: number;
  created_at: string;
  branch_id: string;
  payment_method: string;
  sale_items: { quantity: number; unit_price: number; product: { name: string; category?: { name: string } } | null }[];
}

interface Branch { id: string; name: string; display_name: string }

const PERIOD_LABELS: Record<Period, string> = {
  today: "Today", yesterday: "Yesterday",
  week: "This Week", month: "This Month", year: "This Year", custom: "Custom",
};

const PIE_COLORS = ["#0077B6", "#D4AF37", "#023E8A", "#00B4D8", "#90E0EF", "#ADE8F4"];
const BRANCH_COLORS: Record<string, string> = { tweapease: "#0077B6", abaam: "#D4AF37" };

function getRange(period: Period, customFrom: string, customTo: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "today":     return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
    case "week":      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "month":     return { from: startOfMonth(now), to: endOfMonth(now) };
    case "year":      return { from: startOfYear(now), to: endOfYear(now) };
    case "custom":    return {
      from: customFrom ? startOfDay(parseISO(customFrom)) : startOfMonth(now),
      to:   customTo   ? endOfDay(parseISO(customTo))     : endOfDay(now),
    };
  }
}

function bucketLabel(date: Date, period: Period): string {
  if (period === "today" || period === "yesterday")
    return format(date, "HH:00");
  if (period === "week")
    return format(date, "EEE d");
  if (period === "month")
    return format(date, "d MMM");
  return format(date, "MMM");
}

function AnalyticsPage() {
  const supabase = createBrowserClient();
  const searchParams = useSearchParams();

  const [branches, setBranches]     = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState("all");
  const [period, setPeriod]         = useState<Period>("week");
  const [customFrom, setCustomFrom] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [customTo,   setCustomTo]   = useState(format(new Date(), "yyyy-MM-dd"));
  const [showCustom, setShowCustom] = useState(false);
  const [sales, setSales]           = useState<Sale[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.from("branches").select("id, name, display_name").then(({ data }) => {
      const list = data ?? [];
      setBranches(list);
      // Apply ?branch=<id> from overview link
      const branchId = searchParams.get("branch");
      if (branchId) {
        const match = list.find((b) => b.id === branchId);
        if (match) setBranchFilter(match.name);
      }
    });
  }, [supabase, searchParams]);

  const { from, to } = useMemo(() => getRange(period, customFrom, customTo), [period, customFrom, customTo]);

  const loadData = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("sales")
      .select("id, total_amount, created_at, branch_id, payment_method, sale_items(quantity, unit_price, product:products(name, category:categories(name)))")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: true });

    if (branchFilter !== "all") {
      const b = branches.find((b) => b.name === branchFilter);
      if (b) q = q.eq("branch_id", b.id);
    }

    const { data } = await q;
    setSales((data ?? []) as unknown as Sale[]);
    setLoading(false);
  }, [supabase, from, to, branchFilter, branches]);

  useEffect(() => { if (branches.length) loadData(); }, [branches, loadData, refreshKey]);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const totalRevenue  = useMemo(() => sales.reduce((s, r) => s + Number(r.total_amount), 0), [sales]);
  const totalOrders   = sales.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const totalItems    = useMemo(() =>
    sales.reduce((s, r) => s + r.sale_items.reduce((a, i) => a + i.quantity, 0), 0), [sales]);

  // ── Revenue trend ────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    if (period === "today" || period === "yesterday") {
      const buckets: Record<string, number> = {};
      for (let h = 0; h < 24; h++) buckets[`${String(h).padStart(2,"0")}:00`] = 0;
      sales.forEach((s) => {
        const h = format(new Date(s.created_at), "HH") + ":00";
        buckets[h] = (buckets[h] ?? 0) + Number(s.total_amount);
      });
      return Object.entries(buckets).map(([label, revenue]) => ({ label, revenue }));
    }
    if (period === "week") {
      const days = eachDayOfInterval({ start: from, end: to });
      return days.map((d) => ({
        label: format(d, "EEE d"),
        revenue: sales.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"))
          .reduce((a, s) => a + Number(s.total_amount), 0),
      }));
    }
    if (period === "month" || period === "custom") {
      const days = eachDayOfInterval({ start: from, end: to });
      return days.map((d) => ({
        label: format(d, "d MMM"),
        revenue: sales.filter((s) => format(new Date(s.created_at), "yyyy-MM-dd") === format(d, "yyyy-MM-dd"))
          .reduce((a, s) => a + Number(s.total_amount), 0),
      }));
    }
    // year
    const months = eachMonthOfInterval({ start: from, end: to });
    return months.map((m) => ({
      label: format(m, "MMM"),
      revenue: sales.filter((s) => format(new Date(s.created_at), "yyyy-MM") === format(m, "yyyy-MM"))
        .reduce((a, s) => a + Number(s.total_amount), 0),
    }));
  }, [sales, period, from, to]);

  // ── Branch comparison ────────────────────────────────────────────────────
  const branchData = useMemo(() => {
    return branches.map((b) => ({
      name: b.display_name,
      revenue: sales.filter((s) => s.branch_id === b.id).reduce((a, s) => a + Number(s.total_amount), 0),
      orders: sales.filter((s) => s.branch_id === b.id).length,
      color: BRANCH_COLORS[b.name] ?? "#0077B6",
    }));
  }, [sales, branches]);

  // ── Top products ─────────────────────────────────────────────────────────
  const topProducts = useMemo(() => {
    const map: Record<string, { qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.sale_items.forEach((i) => {
        const name = i.product?.name ?? "Unknown";
        if (!map[name]) map[name] = { qty: 0, revenue: 0 };
        map[name].qty += i.quantity;
        map[name].revenue += i.quantity * i.unit_price;
      });
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [sales]);

  // ── Top products by quantity ─────────────────────────────────────────────
  const topByQty = useMemo(() => {
    const map: Record<string, { qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.sale_items.forEach((i) => {
        const name = i.product?.name ?? "Unknown";
        if (!map[name]) map[name] = { qty: 0, revenue: 0 };
        map[name].qty += i.quantity;
        map[name].revenue += i.quantity * i.unit_price;
      });
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [sales]);

  // ── Category breakdown ───────────────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      s.sale_items.forEach((i) => {
        const cat = (i.product as { category?: { name: string } } | null)?.category?.name ?? "Uncategorised";
        map[cat] = (map[cat] ?? 0) + i.quantity * i.unit_price;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [sales]);

  // ── Payment methods ──────────────────────────────────────────────────────
  const paymentData = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => { map[s.payment_method] = (map[s.payment_method] ?? 0) + Number(s.total_amount); });
    return Object.entries(map).map(([name, value]) => ({
      name: name === "momo" ? "MoMo" : name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [sales]);

  // ── Daily orders heatmap (week view) ────────────────────────────────────
  const hourlyHeatmap = useMemo(() => {
    const rows: { day: string; hour: string; count: number }[] = [];
    const days = eachDayOfInterval({ start: from, end: to }).slice(0, 7);
    days.forEach((d) => {
      for (let h = 7; h <= 19; h++) {
        const count = sales.filter((s) => {
          const sd = new Date(s.created_at);
          return format(sd, "yyyy-MM-dd") === format(d, "yyyy-MM-dd") && sd.getHours() === h;
        }).length;
        rows.push({ day: format(d, "EEE"), hour: `${String(h).padStart(2,"0")}:00`, count });
      }
    });
    return rows;
  }, [sales, from, to]);

  // ── Peak hour ────────────────────────────────────────────────────────────
  const peakHour = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach((s) => {
      const h = format(new Date(s.created_at), "HH:00");
      map[h] = (map[h] ?? 0) + Number(s.total_amount);
    });
    const [hour] = Object.entries(map).sort((a, b) => b[1] - a[1])[0] ?? ["—", 0];
    return hour;
  }, [sales]);

  function handlePeriodClick(p: Period) {
    setPeriod(p);
    setShowCustom(p === "custom");
  }

  function exportCSV() {
    generateCSV(
      trendData.map((d) => ({ Period: d.label, Revenue: formatCurrency(d.revenue) })),
      `analytics_${period}`
    );
  }

  const periodLabel = `${PERIOD_LABELS[period]}${period === "custom" && customFrom ? ` (${customFrom} → ${customTo})` : ""}`;

  // ── Stat Card ────────────────────────────────────────────────────────────
  function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
    return (
      <div className={`card p-5 border-l-4`} style={{ borderColor: color }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{label}</span>
          <span style={{ color }}>{icon}</span>
        </div>
        <p className="text-2xl font-bold text-[#023E8A]">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Sales Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">{periodLabel} · {branchFilter === "all" ? "All Branches" : branches.find(b=>b.name===branchFilter)?.display_name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRefreshKey((k) => k + 1)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Period pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-xl">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodClick(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                period === p ? "bg-white text-[#023E8A] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "custom" ? <span className="flex items-center gap-1"><Calendar size={12} /> Custom</span> : PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {showCustom && (
          <div className="flex items-center gap-2">
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none" />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none" />
          </div>
        )}

        {/* Branch filter */}
        <div className="relative">
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none bg-white">
            <option value="all">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.name}>{b.display_name}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub={`${totalOrders} orders`} icon={<TrendingUp size={18} />} color="#0077B6" />
            <StatCard label="Total Orders"  value={String(totalOrders)} sub={`${totalItems} items sold`} icon={<ShoppingBag size={18} />} color="#D4AF37" />
            <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} sub="per transaction" icon={<BarChart2 size={18} />} color="#023E8A" />
            <StatCard label="Peak Hour" value={peakHour} sub="highest revenue window" icon={<Users size={18} />} color="#00B4D8" />
          </div>

          {/* ── Revenue Trend ── */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#023E8A] mb-1">Revenue Trend</h2>
            <p className="text-xs text-gray-400 mb-5">{periodLabel}</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0077B6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0077B6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} width={60} />
                <Tooltip formatter={(v: unknown) => [formatCurrency(v as number), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#0077B6" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Branch Comparison + Payment Methods ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branch Revenue */}
            <div className="card p-6">
              <h2 className="font-semibold text-[#023E8A] mb-5">Revenue by Branch</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip formatter={(v: unknown) => [formatCurrency(v as number), "Revenue"]} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {branchData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {branchData.map((b) => (
                  <div key={b.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                      <span className="text-gray-600">{b.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#023E8A]">{formatCurrency(b.revenue)}</span>
                      <span className="text-gray-400 text-xs ml-2">{b.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card p-6">
              <h2 className="font-semibold text-[#023E8A] mb-5">Payment Methods</h2>
              {paymentData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-16">No data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                        {paymentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 space-y-2">
                    {paymentData.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-gray-600">{p.name}</span>
                        </div>
                        <span className="font-semibold text-[#023E8A]">{formatCurrency(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Top Products ── */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#023E8A] mb-1">Top Products by Revenue</h2>
            <p className="text-xs text-gray-400 mb-5">Top 10 · {periodLabel}</p>
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No sales data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={topProducts.length * 42 + 20}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₵${v}`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip formatter={(v: unknown, name: unknown) => [name === "revenue" ? formatCurrency(v as number) : `${v} units`, name === "revenue" ? "Revenue" : "Units"]} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#0077B6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="qty" name="Units Sold" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Top Sales by Quantity ── */}
          <div className="card p-6">
            <h2 className="font-semibold text-[#023E8A] mb-1">Top Sales by Quantity Sold</h2>
            <p className="text-xs text-gray-400 mb-5">Top 10 best-selling products · {periodLabel}</p>
            {topByQty.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No sales data yet.</p>
            ) : (
              <div className="space-y-3">
                {topByQty.map((p, i) => {
                  const maxQty = topByQty[0].qty;
                  const pct = maxQty ? Math.round((p.qty / maxQty) * 100) : 0;
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  const barClass = i === 0 ? "bg-[#D4AF37]" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-[#0077B6]";
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base w-6 shrink-0">{medal ?? <span className="text-xs text-gray-400 font-bold">{i + 1}</span>}</span>
                          <span className="font-medium text-[#2C1A0E] truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-xs text-gray-400">{formatCurrency(p.revenue)}</span>
                          <span className="font-bold text-[#023E8A] tabular-nums">{p.qty} sold</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Category Revenue ── */}
          {categoryData.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold text-[#023E8A] mb-1">Revenue by Category</h2>
              <p className="text-xs text-gray-400 mb-5">{periodLabel}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={2}>
                      {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {categoryData.map((c, i) => {
                    const pct = totalRevenue ? Math.round((c.value / totalRevenue) * 100) : 0;
                    return (
                      <div key={c.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-gray-700">{c.name}</span>
                          </div>
                          <span className="font-semibold text-[#023E8A]">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 text-right">{formatCurrency(c.value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Order Activity Heatmap (week/month only) ── */}
          {(period === "week" || period === "month") && hourlyHeatmap.length > 0 && (
            <div className="card p-6 overflow-x-auto">
              <h2 className="font-semibold text-[#023E8A] mb-1">Order Activity Heatmap</h2>
              <p className="text-xs text-gray-400 mb-5">Orders per hour per day</p>
              <div className="min-w-[500px]">
                {/* Build grid: rows = hours, cols = days */}
                {(() => {
                  const days = [...new Set(hourlyHeatmap.map((r) => r.day))];
                  const hours = [...new Set(hourlyHeatmap.map((r) => r.hour))];
                  const maxCount = Math.max(...hourlyHeatmap.map((r) => r.count), 1);
                  return (
                    <div>
                      {/* Day headers */}
                      <div className="flex gap-1 mb-1 ml-14">
                        {days.map((d) => (
                          <div key={d} className="flex-1 text-center text-xs font-semibold text-gray-500">{d}</div>
                        ))}
                      </div>
                      {hours.map((h) => (
                        <div key={h} className="flex gap-1 mb-1 items-center">
                          <div className="w-12 text-xs text-gray-400 text-right pr-2 shrink-0">{h}</div>
                          {days.map((d) => {
                            const cell = hourlyHeatmap.find((r) => r.day === d && r.hour === h);
                            const count = cell?.count ?? 0;
                            const intensity = count / maxCount;
                            const bg = count === 0
                              ? "#f3f4f6"
                              : `rgba(0, 119, 182, ${0.15 + intensity * 0.85})`;
                            return (
                              <div key={d} title={`${d} ${h}: ${count} order${count !== 1 ? "s" : ""}`}
                                className="flex-1 h-7 rounded-md transition-all cursor-default"
                                style={{ backgroundColor: bg }}
                              />
                            );
                          })}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-3 justify-end">
                        <span className="text-xs text-gray-400">Low</span>
                        {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                          <div key={v} className="w-5 h-4 rounded" style={{ backgroundColor: `rgba(0, 119, 182, ${v})` }} />
                        ))}
                        <span className="text-xs text-gray-400">High</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── No data state ── */}
          {totalOrders === 0 && (
            <div className="card p-12 text-center">
              <BarChart2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No sales recorded for this period.</p>
              <p className="text-gray-300 text-sm mt-1">Try selecting a different date range.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPageWrapper() {
  return <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading analytics…</div>}><AnalyticsPage /></Suspense>;
}
