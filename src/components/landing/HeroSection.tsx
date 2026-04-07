"use client";
import Image from "next/image";
import SupabaseImage from "@/components/shared/SupabaseImage";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface HeroSectionProps {
  heroImageUrl?: string;
  tagline?: string;
}

export default function HeroSection({ heroImageUrl, tagline }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      {heroImageUrl ? (
        <SupabaseImage
          src={heroImageUrl}
          alt="Daddy SoSo Closet boutique interior"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0">
          <Image
            src="/boutique-hero.jpg"
            alt="Daddy SoSo Closet boutique"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#023E8A]/80 via-[#0077B6]/60 to-[#023E8A]/40" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <div
          className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm animate-fadeIn"
        >
          <MapPin size={12} />
          Kwaebibirim Municipal, Eastern Region, Ghana
        </div>

        <h1
          className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-4 animate-fadeInUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          Daddy SoSo
          <span className="block text-[#D4AF37]">Closet</span>
        </h1>

        <p
          className="font-playfair italic text-xl sm:text-2xl text-white/90 mb-10 animate-fadeInUp"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          {tagline || "Fashion. Style. Elegance."}
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <Link
            href="/tweapease"
            className="bg-white text-[#0077B6] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#023E8A] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Tweapease Branch
          </Link>
          <Link
            href="/abaam"
            className="bg-white text-[#023E8A] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#228B22] hover:text-white active:bg-[#1a6b1a] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Abaam Branch
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
        <div className="w-0.5 h-10 bg-white/40 rounded-full" />
        <span className="text-white/60 text-xs">Scroll</span>
      </div>
    </section>
  );
}
