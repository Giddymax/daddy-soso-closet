import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase-server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import BranchCard from "@/components/landing/BranchCard";
import MidBanner from "@/components/landing/MidBanner";
import ProductGallery from "@/components/landing/ProductGallery";
import ContactSection from "@/components/landing/ContactSection";
import VideoSection from "@/components/landing/VideoSection";
import CartDrawer from "@/components/landing/CartDrawer";
import { ProductSkeleton } from "@/components/shared/LoadingSkeleton";

async function getPageData() {
  const supabase = await createServerClient();

  const [settingsRes, productsRes, categoriesRes, videosRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase
      .from("site_videos")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  const settingsMap: Record<string, string> = {};
  (settingsRes.data ?? []).forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  return {
    settings: settingsMap,
    products: productsRes.data ?? [],
    categories: categoriesRes.data ?? [],
    videos: videosRes.data ?? [],
  };
}

export default async function HomePage() {
  const { settings, products, categories, videos } = await getPageData();

  return (
    <>
      <Navbar logoUrl={settings.logo_url} />

      <main>
        {/* Hero */}
        <HeroSection
          heroImageUrl={settings.hero_image_url || undefined}
          tagline={settings.site_tagline}
        />

        {/* Branches */}
        <section id="branches" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#0077B6] font-semibold text-sm uppercase tracking-widest mb-2">
                Our Locations
              </p>
              <h2 className="section-title">Choose Your Branch</h2>
              <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <BranchCard
                name="tweapease"
                displayName="Tweapease Branch"
                location="Tweapease, Kwaebibirim Municipal, Eastern Region"
                type="boutique"
                imageUrl={settings.tweapease_hero_url || undefined}
                href="/tweapease"
              />
              <BranchCard
                name="abaam"
                displayName="Abaam Branch"
                location="Abaam, Kwaebibirim Municipal, Eastern Region"
                type="boutique_salon"
                imageUrl={settings.abaam_hero_url || undefined}
                href="/abaam"
              />
            </div>
          </div>
        </section>

        {/* Mid-section banner */}
        {settings.feature_mid_banner !== "false" && (
          <MidBanner imageUrl={settings.mid_hero_url || undefined} />
        )}

        {/* Products */}
        <Suspense
          fallback={
            <section className="py-20 bg-[#F8F9FA]">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              </div>
            </section>
          }
        >
          <ProductGallery products={products} categories={categories} branchConfig={undefined} />
        </Suspense>

        {/* Videos */}
        <VideoSection videos={videos} />

        {/* Contact */}
        <ContactSection
          phone={settings.phone_number}
          email={settings.email}
          mapEmbedUrl={settings.map_embed_url}
        />
      </main>

      {settings.feature_cart !== "false" && (
        <CartDrawer whatsappPhone={settings.whatsapp_number || settings.phone_number} />
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
