import type { Metadata } from "next";
import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { ArrowLeft, ShoppingBag, MapPin, Phone } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import ProductGallery from "@/components/landing/ProductGallery";
import CartDrawer from "@/components/landing/CartDrawer";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Tweapease Branch | Daddy SoSo Closet",
  description:
    "Visit our Tweapease boutique for the latest clothing, accessories, and footwear.",
};

async function getBranchData() {
  const supabase = await createServerClient();

  const [branchRes, settingsRes, categoriesRes] = await Promise.all([
    supabase.from("branches").select("*").eq("name", "tweapease").single(),
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["tweapease_hero_url", "logo_url", "phone_number", "email", "instagram_url", "facebook_url", "tiktok_url", "footer_tagline", "tweapease_description", "tweapease_whatsapp", "feature_cart", "feature_salon_link"]),
    supabase.from("categories").select("*").order("name"),
  ]);

  const branch = branchRes.data;
  const settingsMap: Record<string, string> = {};
  (settingsRes.data ?? []).forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  const productsRes = await supabase
    .from("inventory")
    .select("quantity, product:products(*, category:categories(*))")
    .eq("branch_id", branch?.id ?? "")
    .gt("quantity", 0);

  const products = (productsRes.data ?? []).map((inv: { quantity: number; product: unknown }) => ({
    ...(inv.product as Record<string, unknown>),
    inventory_quantity: inv.quantity,
  }));

  return {
    branch,
    settings: settingsMap,
    products,
    categories: categoriesRes.data ?? [],
  };
}

export default async function TweapeasePage() {
  const { branch, settings, products, categories } = await getBranchData();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-[#2C1A0E] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Main Site</span>
          </Link>
          <span className="font-playfair font-bold text-[#2C1A0E] text-sm hidden sm:block">
            Daddy SoSo Closet — Tweapease Branch
          </span>
          <Link href="/auth/login" className="flex items-center gap-1.5 bg-[#2C1A0E] text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-[#8B5E3C] transition-colors">
            <ShoppingBag size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative h-80 overflow-hidden">
          <SupabaseImage
            src={settings.tweapease_hero_url || "/boutique-hero.jpg"}
            alt="Tweapease Branch"
            fill
            sizes="100vw"
            className="object-cover object-center contrast-110 saturate-110 brightness-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C1A0E]/60 to-[#5C3520]/25" />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-7xl mx-auto">
            <span className="bg-[#C4954A] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">Boutique</span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-2">
              {branch?.display_name ?? "Tweapease Branch"}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1 text-[#C4954A] font-medium drop-shadow"><MapPin size={14} /> {branch?.location ?? "Tweapease, Kwaebibirim Municipal, Eastern Region"}</span>
              <a href={`tel:${settings.phone_number || "0594299293"}`} className="flex items-center gap-1 hover:text-[#C4954A] transition-colors">
                <Phone size={14} /> {settings.phone_number || "0594299293"}
              </a>
            </div>
          </div>
        </section>

        {settings.tweapease_description && (
          <section className="bg-white py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-stone-500 leading-relaxed text-base">{settings.tweapease_description}</p>
            </div>
          </section>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ProductGallery
          products={products as any}
          categories={categories}
          branchConfig={{ branchId: branch?.id ?? "", storageKey: "tweapease", branchName: "Tweapease Branch" }}
        />
      </main>

      {settings.feature_cart !== "false" && (
        <CartDrawer
          whatsappPhone={settings.tweapease_whatsapp || settings.phone_number}
          branchId={branch?.id}
          branchName="Tweapease Branch"
          storageKey="tweapease"
        />
      )}

      <Footer
        instagramUrl={settings.instagram_url}
        facebookUrl={settings.facebook_url}
        tiktokUrl={settings.tiktok_url}
        phone={settings.phone_number}
        email={settings.email}
        tagline={settings.footer_tagline}
        showSalonLink={settings.feature_salon_link !== "false"}
      />
    </>
  );
}
