import Image from "next/image";
import SupabaseImage from "@/components/shared/SupabaseImage";

interface MidBannerProps {
  imageUrl?: string;
}

export default function MidBanner({ imageUrl }: MidBannerProps) {
  if (!imageUrl) return null;

  return (
    <section className="relative h-72 sm:h-96 overflow-hidden">
      <SupabaseImage
        src={imageUrl}
        alt="Daddy SoSo Closet featured banner"
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#2C1A0E]/65 via-[#5C3520]/30 to-[#2C1A0E]/45" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="font-playfair text-3xl sm:text-5xl font-bold text-white drop-shadow-lg">
            Discover Our Collection
          </p>
          <div className="w-16 h-1 bg-[#C4954A] mx-auto mt-3 rounded-full" />
        </div>
      </div>
    </section>
  );
}
