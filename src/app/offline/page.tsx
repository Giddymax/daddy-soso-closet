"use client";

import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-warm-cream px-6 text-center">
      <Image
        src="/logo.png"
        alt="Daddy SoSo Closet"
        width={80}
        height={80}
        className="w-20 h-20 object-contain mb-6"
      />
      <h1 className="font-playfair text-3xl font-bold text-[#2C1A0E] mb-3">
        You're Offline
      </h1>
      <p className="text-[#8B5E3C] max-w-sm mb-8">
        Check your internet connection and try again. Previously visited pages
        may still be available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Try Again
      </button>
    </div>
  );
}
