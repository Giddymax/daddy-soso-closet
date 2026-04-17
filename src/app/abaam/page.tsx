import type { Metadata } from "next";
import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { ArrowLeft, ShoppingBag, MapPin, Phone, Scissors, Clock, Sparkles } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import ProductGallery from "@/components/landing/ProductGallery";
import CartDrawer from "@/components/landing/CartDrawer";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Abaam Branch | Daddy SoSo Closet",
  description:
    "Visit our Abaam branch for boutique fashion and salon services. Kwaebibirim Municipal, Eastern Region, Ghana.",
};

async function getBranchData() {
  const supabase = await createServerClient();

  const [branchRes, settingsRes, categoriesRes] = await Promise.all([
    supabase.from("branches").select("*").eq("name", "abaam").single(),
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "abaam_hero_url", "logo_url", "abaam_salon_description",
        "phone_number", "email", "instagram_url", "facebook_url", "footer_tagline", "abaam_description",
        "abaam_salon_banner_url", "abaam_salon_tagline", "abaam_salon_hours",
        "abaam_salon_whatsapp", "abaam_whatsapp", "abaam_salon_featured_1", "abaam_salon_featured_2", "abaam_salon_featured_3",
      ]),
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

  return { branch, settings: settingsMap, products, categories: categoriesRes.data ?? [] };
}

export default async function AbaamPage() {
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
            Daddy SoSo Closet — Abaam Branch
          </span>
          <Link href="/auth/login" className="flex items-center gap-1.5 bg-[#2C1A0E] text-white px-3 py-1.5 rounded-full font-bold text-xs hover:bg-[#8B5E3C] transition-colors">
            <ShoppingBag size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative h-80 overflow-hidden">
          <SupabaseImage
            src={settings.abaam_hero_url || "/boutique-hero.jpg"}
            alt="Abaam Branch"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C1A0E]/80 to-[#5C3520]/45" />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-7xl mx-auto">
            <span className="bg-[#C4954A] text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">Boutique & Salon</span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-2">
              {branch?.display_name ?? "Abaam Branch"}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1 text-[#C4954A] font-medium drop-shadow"><MapPin size={14} /> {branch?.location ?? "Abaam, Kwaebibirim Municipal, Eastern Region"}</span>
              <a href={`tel:${settings.phone_number || "0594299293"}`} className="flex items-center gap-1 hover:text-[#C4954A] transition-colors">
                <Phone size={14} /> {settings.phone_number || "0594299293"}
              </a>
            </div>
          </div>
        </section>

        {settings.abaam_description && (
          <section className="bg-white py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-stone-500 leading-relaxed text-base">{settings.abaam_description}</p>
            </div>
          </section>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ProductGallery
          products={products as any}
          categories={categories}
          branchConfig={{ branchId: branch?.id ?? "", storageKey: "abaam", branchName: "Abaam Branch" }}
        />

        {/* ─── Salon Section ─── */}
        <section className="bg-white">
          {/* Banner */}
          {settings.abaam_salon_banner_url && (
            <div className="relative h-64 overflow-hidden">
              <SupabaseImage
                src={settings.abaam_salon_banner_url}
                alt="Abaam Salon"
                fill
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C1A0E]/70 to-[#5C3520]/35" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-[#C4954A]/20 border border-[#C4954A]/50 text-[#C4954A] text-xs font-bold px-4 py-1.5 rounded-full mb-3">
                    <Scissors size={12} /> Abaam Branch Salon
                  </div>
                  <p className="font-playfair text-3xl font-bold text-white">
                    {settings.abaam_salon_tagline || "Premium Hair Care & Beauty"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 py-16">
            {/* Heading */}
            {!settings.abaam_salon_banner_url && (
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#8B5E3C]/10 rounded-full flex items-center justify-center shrink-0">
                  <Scissors size={20} className="text-[#8B5E3C]" />
                </div>
                <h2 className="font-playfair text-3xl font-bold text-[#2C1A0E]">Visit Our Salon</h2>
              </div>
            )}
            {settings.abaam_salon_banner_url && (
              <h2 className="font-playfair text-3xl font-bold text-[#2C1A0E] mb-2">Visit Our Salon</h2>
            )}
            <div className="w-12 h-1 bg-[#C4954A] rounded-full mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* Left — description + info */}
              <div>
                <p className="text-stone-500 leading-relaxed mb-6">
                  {settings.abaam_salon_description ||
                    "Visit our salon for premium beauty services in Abaam. We offer expert hair care and styling to complement your boutique experience."}
                </p>

                <div className="space-y-3 mb-8">
                  {settings.abaam_salon_hours && (
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <div className="w-8 h-8 bg-[#8B5E3C]/10 rounded-full flex items-center justify-center shrink-0">
                        <Clock size={15} className="text-[#8B5E3C]" />
                      </div>
                      {settings.abaam_salon_hours}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <div className="w-8 h-8 bg-[#8B5E3C]/10 rounded-full flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-[#8B5E3C]" />
                    </div>
                    Abaam, Kwaebibirim Municipal, Eastern Region, Ghana
                  </div>
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <div className="w-8 h-8 bg-[#8B5E3C]/10 rounded-full flex items-center justify-center shrink-0">
                      <Phone size={15} className="text-[#8B5E3C]" />
                    </div>
                    <a href={`tel:${settings.abaam_salon_whatsapp || settings.phone_number || "0594299293"}`} className="hover:text-[#8B5E3C] transition-colors">
                      {settings.abaam_salon_whatsapp || settings.phone_number || "0594299293"}
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/salon" className="inline-flex items-center gap-2 bg-[#2C1A0E] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#8B5E3C] transition-colors">
                    <Scissors size={15} /> Book an Appointment
                  </Link>
                  {(settings.abaam_salon_whatsapp || settings.phone_number) && (
                    <a
                      href={`https://wa.me/233${(settings.abaam_salon_whatsapp || settings.phone_number || "").replace(/^0/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#1da851] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp Us
                    </a>
                  )}
                </div>
              </div>

              {/* Right — featured images grid */}
              {(settings.abaam_salon_featured_1 || settings.abaam_salon_featured_2 || settings.abaam_salon_featured_3) ? (
                <div className="grid grid-cols-2 gap-3">
                  {settings.abaam_salon_featured_1 && (
                    <div className="relative col-span-2 h-48 rounded-2xl overflow-hidden">
                      <SupabaseImage src={settings.abaam_salon_featured_1} alt="Salon featured 1" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  )}
                  {settings.abaam_salon_featured_2 && (
                    <div className="relative h-36 rounded-xl overflow-hidden">
                      <SupabaseImage src={settings.abaam_salon_featured_2} alt="Salon featured 2" fill className="object-cover" sizes="25vw" />
                    </div>
                  )}
                  {settings.abaam_salon_featured_3 && (
                    <div className="relative h-36 rounded-xl overflow-hidden">
                      <SupabaseImage src={settings.abaam_salon_featured_3} alt="Salon featured 3" fill className="object-cover" sizes="25vw" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`relative ${n === 1 ? "col-span-2 h-48" : "h-36"} rounded-xl border-2 border-dashed border-[#8B5E3C]/20 bg-[#FAF8F5] flex items-center justify-center`}>
                      <div className="text-center text-[#8B5E3C]/30">
                        <Sparkles size={24} />
                        <p className="text-xs mt-1">Featured photo {n}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <CartDrawer
        whatsappPhone={settings.abaam_whatsapp || settings.phone_number}
        branchId={branch?.id}
        branchName="Abaam Branch"
        storageKey="abaam"
      />

      <Footer
        instagramUrl={settings.instagram_url}
        facebookUrl={settings.facebook_url}
        phone={settings.phone_number}
        email={settings.email}
        tagline={settings.footer_tagline}
      />
    </>
  );
}
