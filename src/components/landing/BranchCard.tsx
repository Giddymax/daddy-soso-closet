import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { MapPin, ArrowRight, Scissors, ShoppingBag } from "lucide-react";

interface BranchCardProps {
  name: string;
  displayName: string;
  location: string;
  type: "boutique" | "boutique_salon";
  imageUrl?: string;
  href: string;
}

export default function BranchCard({
  displayName,
  location,
  type,
  imageUrl,
  href,
}: BranchCardProps) {
  const isSalon = type === "boutique_salon";

  return (
    <div className="card group overflow-hidden border border-stone-100 hover:border-[#C4954A]/50 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden">
        {imageUrl ? (
          <SupabaseImage
            src={imageUrl}
            alt={displayName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isSalon ? (
              <Scissors size={48} className="text-[#8B5E3C]/30" />
            ) : (
              <ShoppingBag size={48} className="text-[#8B5E3C]/30" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1A0E]/55 to-transparent" />
        <span className="absolute top-3 right-3 bg-[#C4954A] text-white text-xs font-bold px-3 py-1 rounded-full">
          {isSalon ? "Boutique & Salon" : "Boutique"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-playfair text-xl font-bold text-[#2C1A0E] mb-2">
          {displayName}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-stone-400 mb-4">
          <MapPin size={13} className="text-[#8B5E3C]" />
          {location}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">
            Clothing
          </span>
          <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">
            Accessories
          </span>
          <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-medium">
            Footwear
          </span>
          {isSalon && (
            <span className="text-xs bg-[#C4954A]/15 text-[#8B5E3C] px-2.5 py-1 rounded-full font-medium">
              Salon
            </span>
          )}
        </div>
        <Link
          href={href}
          className="flex items-center gap-2 text-[#8B5E3C] font-semibold hover:gap-3 transition-all duration-200 group/link"
        >
          Visit Branch
          <ArrowRight
            size={16}
            className="group-hover/link:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}
