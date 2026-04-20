"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BarChart2, Package,
  Users, FileEdit, Settings, LogOut, Menu, X,
  ShoppingCart, Boxes, Home, Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/sales", label: "Make a Sale", icon: ShoppingCart },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/sales-edit", label: "Sales", icon: FileEdit },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { role, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/auth/login");
    } else if (role && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, role, router]);

  if (!user || role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#EFF6FF] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#023E8A] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="font-playfair font-bold text-white text-lg">Daddy SoSo Closet</h2>
          <span className="text-[#D4AF37] text-xs font-bold bg-[#D4AF37]/20 px-2 py-0.5 rounded-full">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-[#D4AF37] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home size={18} /> Go to Main Site
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#D4AF37]/80 hover:bg-white/10 hover:text-[#D4AF37] transition-colors"
          >
            <LayoutDashboard size={18} /> Staff Dashboard
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-stone-100 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden p-2 text-stone-500" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="text-sm font-bold text-[#023E8A]">
            {navItems.find((n) => n.href === pathname)?.label ?? "Admin"}
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#023E8A] transition-colors"
            >
              <Home size={14} /> Main Site
            </Link>
            <span className="text-xs text-stone-400">
              {new Date().toLocaleDateString("en-GH", {
                timeZone: "Africa/Accra", weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
