"use client";
import { useState } from "react";
import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface NavbarProps {
  logoUrl?: string;
}

export default function Navbar({ logoUrl }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const { role } = useAuthStore();

  const links = [
    { href: "/", label: "Home" },
    { href: "/#branches", label: "Our Branches" },
    { href: "/#products", label: "Products" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0077B6] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <SupabaseImage
                src={logoUrl}
                alt="Daddy SoSo Closet Logo"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center font-playfair font-bold text-[#023E8A] text-lg">
                D
              </span>
            )}
            <span className="font-playfair font-bold text-white text-lg leading-tight hidden sm:block">
              Daddy SoSo Closet
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/90 hover:text-[#D4AF37] font-medium transition-colors duration-200 text-sm"
              >
                {l.label}
              </Link>
            ))}
            {role && (
              <span className="text-xs bg-[#D4AF37] text-[#023E8A] px-2 py-1 rounded-full font-bold">
                {role === "admin" ? "Admin" : "Staff"}
              </span>
            )}
          </nav>

          {/* Dashboard Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-[#D4AF37] text-[#023E8A] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#b8962e] transition-colors duration-200"
            >
              <ShoppingBag size={16} />
              Go to Dashboard
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden bg-[#023E8A] border-t border-[#00B4D8]/30 animate-fadeIn">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white/90 hover:text-[#D4AF37] font-medium py-2 border-b border-white/10 transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#D4AF37] text-[#023E8A] px-4 py-3 rounded-lg font-bold mt-2"
            >
              <ShoppingBag size={16} />
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
