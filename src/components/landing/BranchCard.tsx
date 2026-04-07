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
    <div className="card group overflow-hidden border border-[#00B4D8]/20 hover:border-[#D4AF37]/60 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-[#0077B6]/20 to-[#023E8A]/30 overflow-hidden">
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
              <Scissors size={48} className="text-[#0077B6]/40" />
            ) : (
              <ShoppingBag size={48} className="text-[#0077B6]/40" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#023E8A]/60 to-transparent" />
        <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#023E8A] text-xs font-bold px-3 py-1 rounded-full">
          {isSalon ? "Boutique & Salon" : "Boutique"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-playfair text-xl font-bold text-[#023E8A] mb-2">
          {displayName}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
          <MapPin size={13} className="text-[#0077B6]" />
          {location}
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs bg-[#0077B6]/10 text-[#0077B6] px-2.5 py-1 rounded-full font-medium">
            Clothing
          </span>
          <span className="text-xs bg-[#0077B6]/10 text-[#0077B6] px-2.5 py-1 rounded-full font-medium">
            Accessories
          </span>
          <span className="text-xs bg-[#0077B6]/10 text-[#0077B6] px-2.5 py-1 rounded-full font-medium">
            Footwear
          </span>
          {isSalon && (
            <span className="text-xs bg-[#D4AF37]/20 text-[#023E8A] px-2.5 py-1 rounded-full font-medium">
              Salon
            </span>
          )}
        </div>
        <Link
          href={href}
          className="flex items-center gap-2 text-[#0077B6] font-semibold hover:gap-3 transition-all duration-200 group/link"
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
