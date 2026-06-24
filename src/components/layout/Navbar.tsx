"use client";
import { useState } from "react";
import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  logoUrl?: string;
}

export default function Navbar({ logoUrl }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/#branches", label: "Our Branches" },
    { href: "/#products", label: "Products" },
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {logoUrl ? (
              <SupabaseImage
                src={logoUrl}
                alt="Daddy SoSo Closet Logo"
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <span className="w-16 h-16 bg-[#2C1A0E] flex items-center justify-center font-playfair font-bold text-[#C4954A] text-xl">
                D
              </span>
            )}
            <span className="font-playfair font-bold text-[#2C1A0E] text-lg leading-tight hidden sm:block">
              Daddy SoSo Closet
            </span>
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="hidden md:flex items-center justify-center gap-6 flex-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-stone-600 hover:text-[#8B5E3C] font-medium transition-colors duration-200 text-sm"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Spacer to balance the logo on desktop */}
          <div className="hidden md:block w-16 shrink-0" />

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#2C1A0E] p-2 ml-auto"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 animate-fadeIn">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-stone-600 hover:text-[#8B5E3C] font-medium py-2 border-b border-stone-100 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
