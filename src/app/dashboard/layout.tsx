"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Package,
  ReceiptText, LogOut, Menu, X, Home, BarChart2, ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { createBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/sales", label: "Make a Sale", icon: ShoppingCart },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/receipts", label: "Sales", icon: ReceiptText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { staff, branch, role, signOut } = useAuth();
  const { setBranch } = useAuthStore();
  const supabase = createBrowserClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showBranchPicker, setShowBranchPicker] = useState(false);

  const isAdmin = role === "admin";

  // For admins with no branch set, load branches and show picker
  useEffect(() => {
    if (isAdmin && !branch) {
      supabase.from("branches").select("*").then(({ data }) => {
        setBranches(data ?? []);
        setShowBranchPicker(true);
      });
    }
  }, [isAdmin, branch, supabase]);

  function selectBranch(b: Branch) {
    setBranch(b);
    setShowBranchPicker(false);
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Branch picker overlay for admin with no branch */}
      {showBranchPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#023E8A]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-playfair font-bold text-[#023E8A] text-xl mb-1">Select Branch</h2>
            <p className="text-gray-500 text-sm mb-5">
              Choose which branch you&apos;re operating from for this session.
            </p>
            <div className="space-y-3">
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBranch(b)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-200 hover:border-[#0077B6] hover:bg-[#0077B6]/5 transition-all group text-left"
                >
                  <div>
                    <p className="font-semibold text-[#023E8A] text-sm">{b.display_name}</p>
                    <p className="text-xs text-gray-400 capitalize">{b.type.replace("_", " ")}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0077B6] transition-colors" />
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/admin" className="block text-center text-xs text-[#0077B6] hover:underline font-medium">
                Go back to Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#023E8A] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="font-playfair font-bold text-white text-lg leading-tight">
            Daddy SoSo Closet
          </h2>
          <span className="text-[#D4AF37] text-xs font-medium">Staff Portal</span>
        </div>

        {/* Staff info */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-white font-semibold text-sm">{staff?.full_name ?? "Staff"}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="inline-block bg-[#D4AF37] text-[#023E8A] text-xs font-bold px-2 py-0.5 rounded-full">
              {branch?.display_name ?? "No Branch"}
            </span>
            {isAdmin && (
              <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
          {isAdmin && branch && (
            <button
              onClick={() => { setBranches([]); setShowBranchPicker(true); supabase.from("branches").select("*").then(({ data }) => setBranches(data ?? [])); }}
              className="text-[10px] text-white/50 hover:text-white/80 mt-1.5 transition-colors underline underline-offset-2"
            >
              Switch branch
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[#D4AF37] text-[#023E8A]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#D4AF37]/80 hover:bg-white/10 hover:text-[#D4AF37] transition-colors"
            >
              <BarChart2 size={18} /> Admin Panel
            </Link>
          )}
          {branch && (
            <Link
              href={branch.type === "boutique_salon" ? "/abaam" : "/"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Home size={18} /> View Branch Page
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home size={18} /> Go to Main Site
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <button
            className="lg:hidden p-2 text-gray-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="text-sm font-semibold text-[#023E8A] hidden sm:block">
            {navItems.find((n) => n.href === pathname)?.label ?? "Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#023E8A] transition-colors"
              >
                <BarChart2 size={14} /> Admin Panel
              </Link>
            )}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0077B6] hover:text-[#023E8A] transition-colors"
            >
              <Home size={14} /> Main Site
            </Link>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString("en-GH", {
                timeZone: "Africa/Accra",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
