import type { Metadata } from "next";
import Link from "next/link";
import SupabaseImage from "@/components/shared/SupabaseImage";
import {
  ArrowLeft, Scissors, Phone, MapPin, Clock, Star, Sparkles, Heart,
} from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/salon/BookingForm";
import SalonProductGrid from "@/components/landing/SalonProductGrid";
import CartDrawer from "@/components/landing/CartDrawer";

export const metadata: Metadata = {
  title: "Salon | Daddy SoSo Closet — Abaam Branch",
  description:
    "Book a premium salon appointment at Daddy SoSo Closet, Abaam Branch. Hair care, styling, and beauty services in Kwaebibirim Municipal, Eastern Region, Ghana.",
};

async function getSalonData() {
  const supabase = await createServerClient();

  const [settingsRes, branchRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("branches").select("id, display_name, location").eq("name", "abaam").single(),
  ]);

  const map: Record<string, string> = {};
  (settingsRes.data ?? []).forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });

  const branch = branchRes.data;
  let salonProducts: unknown[] = [];

  if (branch) {
    const { data: invData } = await supabase
      .from("inventory")
      .select("quantity, product:products!inner(*, category:categories(*))")
      .eq("branch_id", branch.id)
      .eq("product.is_active", true);

    salonProducts = (invData ?? [])
      .filter((inv: { quantity: number; product: unknown }) =>
        (inv.product as Record<string, unknown> & { category?: { slug?: string } })?.category?.slug === "salon-products"
      )
      .map((inv: { quantity: number; product: unknown }) => ({
        ...(inv.product as Record<string, unknown>),
        inventory_quantity: inv.quantity,
      }));
  }

  return { settings: map, branch, salonProducts };
}

const servicesMeta = [
  { imgKey: "salon_service_relax_url",     descKey: "salon_service_relax_desc",     priceKey: "salon_service_relax_price",     name: "Hair Relaxing",           defaultDesc: "Professional relaxing treatment for smooth, manageable hair.",          defaultPrice: "GH₵ 80+",  duration: "2–3 hrs" },
  { imgKey: "salon_service_braiding_url",  descKey: "salon_service_braiding_desc",  priceKey: "salon_service_braiding_price",  name: "Hair Braiding",           defaultDesc: "Beautiful box braids, cornrows, and protective styles done with care.", defaultPrice: "GH₵ 120+", duration: "3–5 hrs" },
  { imgKey: "salon_service_weaving_url",   descKey: "salon_service_weaving_desc",   priceKey: "salon_service_weaving_price",   name: "Hair Weaving",            defaultDesc: "Sew-in weaves and extensions for a full, glamorous look.",              defaultPrice: "GH₵ 150+", duration: "2–4 hrs" },
  { imgKey: "salon_service_styling_url",   descKey: "salon_service_styling_desc",   priceKey: "salon_service_styling_price",   name: "Hair Styling",            defaultDesc: "Blow-dry, flat iron, curls, and occasion-ready styling.",               defaultPrice: "GH₵ 60+",  duration: "1–2 hrs" },
  { imgKey: "salon_service_treatment_url", descKey: "salon_service_treatment_desc", priceKey: "salon_service_treatment_price", name: "Treatment & Conditioning",defaultDesc: "Deep conditioning and protein treatments to restore hair health.",        defaultPrice: "GH₵ 50+",  duration: "1 hr"    },
  { imgKey: "salon_service_dreads_url",    descKey: "salon_service_dreads_desc",    priceKey: "salon_service_dreads_price",    name: "Dreadlocks",              defaultDesc: "Starting, retightening, and styling of dreadlocks.",                    defaultPrice: "GH₵ 100+", duration: "2–4 hrs" },
];

const galleryKeys = [
  "salon_gallery_1","salon_gallery_2","salon_gallery_3",
  "salon_gallery_4","salon_gallery_5","salon_gallery_6",
];

export default async function SalonPage() {
  const { settings: s, branch, salonProducts } = await getSalonData();
  const phone = s.phone_number || "0594299293";

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#065F46] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/abaam" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Abaam Branch</span>
          </Link>
          <span className="font-playfair font-bold text-[#003153] hidden sm:block">
            Daddy SoSo Closet — Salon
          </span>
          <a href={`tel:${phone}`} className="flex items-center gap-1.5 bg-[#003153] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#004080] transition-colors">
            <Phone size={14} /> Call Us
          </a>
        </div>
      </header>

      <main className="pt-16">
        {/* ─── Hero ─── */}
        <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#065F46] to-[#10B981]">
            {s.salon_hero_url && (
              <SupabaseImage
                src={s.salon_hero_url}
                alt="Daddy SoSo Closet Salon"
                fill
                className="object-cover object-center opacity-85 contrast-110 saturate-110 brightness-105"
                sizes="100vw"
                priority
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#065F46]/55 via-[#10B981]/30 to-transparent" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#003153]/20 border border-[#003153]/40 text-[#003153] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <Scissors size={12} /> Abaam Branch Salon
            </div>
            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-4">
              Look Your <span className="block text-[#003153]">Very Best</span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl mb-10">
              Premium hair care &amp; styling services crafted with skill and passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book" className="bg-[#003153] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#004080] transition-all duration-300 shadow-xl hover:-translate-y-0.5">
                Book Appointment
              </a>
              <a href="#services" className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300">
                View Services
              </a>
            </div>
          </div>
        </section>

        {/* ─── Info strip ─── */}
        <section className="bg-[#10B981] py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-[#065F46]">
            {[
              { icon: <Star size={18} />, text: "Premium Quality" },
              { icon: <Heart size={18} />, text: "Made with Care" },
              { icon: <Clock size={18} />, text: s.abaam_salon_hours || "Mon – Sat · 8 AM – 6 PM" },
              { icon: <MapPin size={18} />, text: "Abaam, Kwaebibirim Municipal" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 font-semibold text-sm">
                {item.icon}{item.text}
              </div>
            ))}
          </div>
        </section>

        {/* ─── About ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-[#10B981]/10 to-[#065F46]/20">
                {s.salon_about_url ? (
                  <SupabaseImage
                    src={s.salon_about_url}
                    alt="About our salon"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-[#10B981]/40">
                      <Scissors size={56} />
                      <p className="mt-2 text-sm font-medium">Upload salon about image in settings</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[#10B981] font-semibold text-sm uppercase tracking-widest mb-2">About Us</p>
                <h2 className="font-playfair text-4xl font-bold text-[#065F46] mb-4">Your Beauty, Our Passion</h2>
                <div className="w-16 h-1 bg-[#003153] rounded-full mb-6" />
                <p className="text-gray-600 leading-relaxed mb-4">
                  {s.abaam_salon_description ||
                    "Nestled within Daddy SoSo Closet's Abaam Branch, our salon brings professional beauty services to the heart of the Eastern Region. From protective styles to glamorous blowouts, every client leaves feeling confident and beautiful."}
                </p>
                <div className="flex flex-wrap gap-4">
                  {[["5+", "Years Experience"], ["500+", "Happy Clients"], ["6+", "Services"]].map(([stat, label]) => (
                    <div key={label} className="text-center">
                      <div className="font-playfair text-3xl font-bold text-[#003153]">{stat}</div>
                      <div className="text-sm text-gray-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Services ─── */}
        <section id="services" className="py-20 bg-[#ECFDF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#10B981] font-semibold text-sm uppercase tracking-widest mb-2">What We Offer</p>
              <h2 className="font-playfair text-4xl font-bold text-[#065F46]">Our Services</h2>
              <div className="w-16 h-1 bg-[#003153] mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesMeta.map((service) => (
                <div key={service.imgKey} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="relative h-48 bg-gradient-to-br from-[#10B981]/10 to-[#065F46]/20 overflow-hidden">
                    {s[service.imgKey] ? (
                      <SupabaseImage
                        src={s[service.imgKey]}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-[#10B981]/30">
                          <Sparkles size={36} />
                          <p className="text-xs mt-1">Upload in settings</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-playfair text-xl font-bold text-[#065F46] mb-2">{service.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      {s[service.descKey] || service.defaultDesc}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#003153] text-lg">
                        {s[service.priceKey] || service.defaultPrice}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> {service.duration}</span>
                    </div>
                    <a href="#book" className="mt-4 block text-center bg-[#10B981]/10 text-[#10B981] py-2 rounded-lg text-sm font-semibold hover:bg-[#10B981] hover:text-white transition-colors duration-200">
                      Book This Service
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Salon Products ─── */}
        {salonProducts.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="text-[#10B981] font-semibold text-sm uppercase tracking-widest mb-2">Take Home the Goodness</p>
                <h2 className="font-playfair text-4xl font-bold text-[#065F46]">Salon Products</h2>
                <div className="w-16 h-1 bg-[#003153] mx-auto mt-3 rounded-full" />
                <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
                  Professional-grade hair care products used and sold at our salon. Add to cart and pick up at the Abaam Branch.
                </p>
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <SalonProductGrid products={salonProducts as any} storageKey="abaam" hideHeading />
            </div>
          </section>
        )}

        {/* ─── Gallery ─── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#10B981] font-semibold text-sm uppercase tracking-widest mb-2">Our Work</p>
              <h2 className="font-playfair text-4xl font-bold text-[#065F46]">Gallery</h2>
              <div className="w-16 h-1 bg-[#003153] mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryKeys.map((key, idx) => (
                <div key={key} className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#10B981]/10 to-[#065F46]/20 group cursor-pointer">
                  {s[key] ? (
                    <SupabaseImage
                      src={s[key]}
                      alt={`Salon gallery photo ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-[#10B981]/20 rounded-2xl">
                      <div className="text-center text-[#10B981]/30">
                        <Sparkles size={28} />
                        <p className="text-xs mt-1">Gallery photo {idx + 1}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#065F46]/0 group-hover:bg-[#065F46]/30 transition-colors duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Booking Form ─── */}
        <section id="book" className="py-20 bg-[#065F46]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[#003153] font-semibold text-sm uppercase tracking-widest mb-2">Reserve Your Spot</p>
              <h2 className="font-playfair text-4xl font-bold text-white">Book an Appointment</h2>
              <div className="w-16 h-1 bg-[#003153] mx-auto mt-3 rounded-full" />
            </div>
            <BookingForm
              services={servicesMeta.map((sv) => ({
                name: sv.name,
                priceDisplay: s[sv.priceKey] || sv.defaultPrice,
              }))}
              phone={phone}
              whatsappNumber={`233${phone.replace(/^0/, "")}`}
            />
          </div>
        </section>

        {/* ─── Contact / Location ─── */}
        <section className="py-20 bg-[#ECFDF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-[#10B981] font-semibold text-sm uppercase tracking-widest mb-2">Find Us</p>
              <h2 className="font-playfair text-4xl font-bold text-[#065F46]">Visit the Salon</h2>
              <div className="w-16 h-1 bg-[#003153] mx-auto mt-3 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={22} className="text-[#10B981]" />
                </div>
                <h3 className="font-semibold text-[#065F46] mb-1">Location</h3>
                <p className="text-gray-500 text-sm">Abaam, Kwaebibirim Municipal<br />Eastern Region, Ghana</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone size={22} className="text-[#10B981]" />
                </div>
                <h3 className="font-semibold text-[#065F46] mb-1">Phone</h3>
                <a href={`tel:${phone}`} className="text-[#10B981] text-sm font-medium hover:underline">{phone}</a>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 text-center">
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={22} className="text-[#10B981]" />
                </div>
                <h3 className="font-semibold text-[#065F46] mb-1">Hours</h3>
                <p className="text-gray-500 text-sm">Mon – Sat<br />8:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {salonProducts.length > 0 && (
        <CartDrawer
          whatsappPhone={s.abaam_salon_whatsapp || s.phone_number}
          branchId={branch?.id}
          branchName="Abaam Branch — Salon"
          storageKey="abaam"
        />
      )}

      <Footer
        instagramUrl={s.instagram_url}
        facebookUrl={s.facebook_url}
        phone={s.phone_number}
        email={s.email}
        tagline={s.footer_tagline}
        theme="emerald"
      />
    </div>
  );
}
