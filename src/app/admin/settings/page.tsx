"use client";
import { useEffect, useState, useCallback } from "react";
import SupabaseImage from "@/components/shared/SupabaseImage";
import { Upload, Save, Check } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

const SETTINGS_KEYS = [
  // ── Branding ──────────────────────────────────────────────
  { key: "logo_url",         label: "Company Logo",              type: "image",    bucket: "site-assets", group: "Branding" },
  { key: "site_tagline",     label: "Site Tagline",              type: "text",     placeholder: "Fashion. Style. Elegance.", group: "Branding" },
  { key: "footer_tagline",   label: "Footer Description",        type: "textarea", placeholder: "Your premier boutique destination in Eastern Region, Ghana.", group: "Branding" },

  // ── Contact ───────────────────────────────────────────────
  { key: "phone_number",     label: "Phone Number",              type: "text",     placeholder: "0594299293", group: "Contact" },
  { key: "email",            label: "Email Address",             type: "text",     placeholder: "example@gmail.com", group: "Contact" },
  { key: "map_embed_url",    label: "Google Maps Embed URL",     type: "textarea", placeholder: "Paste the Google Maps embed src URL here…", group: "Contact" },

  // ── WhatsApp Numbers ──────────────────────────────────────
  { key: "whatsapp_number",          label: "Main / Admin WhatsApp",      type: "text", placeholder: "0594299293", group: "WhatsApp Numbers" },
  { key: "tweapease_whatsapp",       label: "Tweapease Branch WhatsApp",  type: "text", placeholder: "0594299293", group: "WhatsApp Numbers" },
  { key: "abaam_whatsapp",           label: "Abaam Branch WhatsApp",      type: "text", placeholder: "0594299293", group: "WhatsApp Numbers" },

  // ── Social ────────────────────────────────────────────────
  { key: "instagram_url",    label: "Instagram Link",            type: "text",     placeholder: "https://instagram.com/yourpage", group: "Social" },
  { key: "facebook_url",     label: "Facebook Link",             type: "text",     placeholder: "https://facebook.com/yourpage", group: "Social" },

  // ── Homepage Images ───────────────────────────────────────
  { key: "hero_image_url",   label: "Main Hero Image",           type: "image",    bucket: "site-assets", group: "Homepage" },
  { key: "mid_hero_url",     label: "Mid-Section Banner Image",  type: "image",    bucket: "site-assets", group: "Homepage" },

  // ── Branches ──────────────────────────────────────────────
  { key: "tweapease_hero_url",        label: "Tweapease Branch Image",       type: "image",    bucket: "site-assets", group: "Branches" },
  { key: "tweapease_description",     label: "Tweapease Branch Description", type: "textarea", placeholder: "Describe the Tweapease branch…", group: "Branches" },
  { key: "abaam_hero_url",            label: "Abaam Branch Image",           type: "image",    bucket: "site-assets", group: "Branches" },
  { key: "abaam_description",         label: "Abaam Branch Description",     type: "textarea", placeholder: "Describe the Abaam branch…", group: "Branches" },
  { key: "abaam_salon_description",   label: "Abaam Salon Description",      type: "textarea", placeholder: "Describe the salon services…", group: "Branches" },

  // ── Abaam Salon ───────────────────────────────────────────
  { key: "abaam_salon_banner_url",   label: "Abaam Salon Banner Image",     type: "image",    bucket: "site-assets", group: "Abaam Salon" },
  { key: "abaam_salon_tagline",      label: "Abaam Salon Tagline",          type: "text",     placeholder: "Premium Hair Care & Beauty Services", group: "Abaam Salon" },
  { key: "abaam_salon_hours",        label: "Abaam Salon Hours",            type: "text",     placeholder: "Mon – Sat · 8:00 AM – 6:00 PM", group: "Abaam Salon" },
  { key: "abaam_salon_whatsapp",     label: "Abaam Salon WhatsApp Number",  type: "text",     placeholder: "0594299293", group: "Abaam Salon" },
  { key: "abaam_salon_featured_1",   label: "Abaam Salon Featured Image 1", type: "image",    bucket: "site-assets", group: "Abaam Salon" },
  { key: "abaam_salon_featured_2",   label: "Abaam Salon Featured Image 2", type: "image",    bucket: "site-assets", group: "Abaam Salon" },
  { key: "abaam_salon_featured_3",   label: "Abaam Salon Featured Image 3", type: "image",    bucket: "site-assets", group: "Abaam Salon" },

  // ── Salon General ─────────────────────────────────────────
  { key: "salon_hero_url",   label: "Salon Hero Image",  type: "image", bucket: "site-assets", group: "Salon General" },
  { key: "salon_about_url",  label: "Salon About Image", type: "image", bucket: "site-assets", group: "Salon General" },

  // ── Salon Gallery ─────────────────────────────────────────
  { key: "salon_gallery_1", label: "Salon Gallery Photo 1", type: "image", bucket: "site-assets", group: "Salon Gallery" },
  { key: "salon_gallery_2", label: "Salon Gallery Photo 2", type: "image", bucket: "site-assets", group: "Salon Gallery" },
  { key: "salon_gallery_3", label: "Salon Gallery Photo 3", type: "image", bucket: "site-assets", group: "Salon Gallery" },
  { key: "salon_gallery_4", label: "Salon Gallery Photo 4", type: "image", bucket: "site-assets", group: "Salon Gallery" },
  { key: "salon_gallery_5", label: "Salon Gallery Photo 5", type: "image", bucket: "site-assets", group: "Salon Gallery" },
  { key: "salon_gallery_6", label: "Salon Gallery Photo 6", type: "image", bucket: "site-assets", group: "Salon Gallery" },
] as const;

const GROUPS = ["Branding", "Contact", "WhatsApp Numbers", "Social", "Homepage", "Branches", "Abaam Salon", "Salon General", "Salon Gallery"] as const;

const SALON_SERVICES_CONFIG = [
  { name: "Hair Relaxing",            imgKey: "salon_service_relax_url",     descKey: "salon_service_relax_desc",     priceKey: "salon_service_relax_price",     defaultPrice: "GH₵ 80+" },
  { name: "Hair Braiding",            imgKey: "salon_service_braiding_url",   descKey: "salon_service_braiding_desc",  priceKey: "salon_service_braiding_price",  defaultPrice: "GH₵ 120+" },
  { name: "Hair Weaving",             imgKey: "salon_service_weaving_url",    descKey: "salon_service_weaving_desc",   priceKey: "salon_service_weaving_price",   defaultPrice: "GH₵ 150+" },
  { name: "Hair Styling",             imgKey: "salon_service_styling_url",    descKey: "salon_service_styling_desc",   priceKey: "salon_service_styling_price",   defaultPrice: "GH₵ 60+" },
  { name: "Treatment & Conditioning", imgKey: "salon_service_treatment_url",  descKey: "salon_service_treatment_desc", priceKey: "salon_service_treatment_price", defaultPrice: "GH₵ 50+" },
  { name: "Dreadlocks",               imgKey: "salon_service_dreads_url",     descKey: "salon_service_dreads_desc",    priceKey: "salon_service_dreads_price",    defaultPrice: "GH₵ 100+" },
] as const;

export default function AdminSettingsPage() {
  const supabase = createBrowserClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    const map: Record<string, string> = {};
    (data ?? []).forEach((s) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function saveSetting(key: string, value: string) {
    await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000);
  }

  async function handleImageUpload(key: string, bucket: string, file: File) {
    setUploading((prev) => ({ ...prev, [key]: true }));
    setUploadError((prev) => ({ ...prev, [key]: "" }));
    const ext = file.name.split(".").pop();
    const path = `${key}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUploadError((prev) => ({ ...prev, [key]: error.message }));
      setUploading((prev) => ({ ...prev, [key]: false }));
      return;
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    await saveSetting(key, urlData.publicUrl);
    setUploading((prev) => ({ ...prev, [key]: false }));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-[#023E8A]">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Update all content, images, and links visible on the website.</p>
      </div>

      {/* ── Salon Services (combined image + desc + price per service) ── */}
      <div>
        <h2 className="font-semibold text-[#0077B6] text-xs uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Salon Services</h2>
        <div className="space-y-6">
          {SALON_SERVICES_CONFIG.map((svc) => (
            <div key={svc.imgKey} className="card p-6 space-y-5">
              <h3 className="font-playfair text-lg font-bold text-[#023E8A]">{svc.name}</h3>

              {/* Image */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Service Image</p>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                    {settings[svc.imgKey] ? (
                      <SupabaseImage src={settings[svc.imgKey]} alt={svc.name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors">
                      {uploading[svc.imgKey] ? "Uploading…" : <><Upload size={14} /> {settings[svc.imgKey] ? "Change Image" : "Upload Image"}</>}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(svc.imgKey, "site-assets", file);
                        }}
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WEBP — max 5MB</p>
                    {saved[svc.imgKey] && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><Check size={12} /> Saved!</p>}
                    {uploadError[svc.imgKey] && <p className="text-red-500 text-xs mt-1">Upload failed: {uploadError[svc.imgKey]}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Description</p>
                <textarea
                  rows={2}
                  value={settings[svc.descKey] ?? ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [svc.descKey]: e.target.value }))}
                  placeholder={`Describe the ${svc.name} service…`}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  {saved[svc.descKey] && <span className="text-green-600 text-xs flex items-center gap-1"><Check size={12} /> Saved!</span>}
                  <button onClick={() => saveSetting(svc.descKey, settings[svc.descKey] ?? "")}
                    className="flex items-center gap-1.5 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors ml-auto">
                    <Save size={13} /> Save
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Price</p>
                <input
                  type="text"
                  value={settings[svc.priceKey] ?? ""}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [svc.priceKey]: e.target.value }))}
                  placeholder={svc.defaultPrice}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                />
                <div className="flex items-center justify-between mt-2">
                  {saved[svc.priceKey] && <span className="text-green-600 text-xs flex items-center gap-1"><Check size={12} /> Saved!</span>}
                  <button onClick={() => saveSetting(svc.priceKey, settings[svc.priceKey] ?? "")}
                    className="flex items-center gap-1.5 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors ml-auto">
                    <Save size={13} /> Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {GROUPS.map((group) => {
        const items = SETTINGS_KEYS.filter((s) => s.group === group);
        return (
          <div key={group}>
            <h2 className="font-semibold text-[#0077B6] text-xs uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">{group}</h2>
            <div className="space-y-4">
              {items.map(({ key, label, type, ...rest }) => (
                <div key={key} className="card p-6">
                  <label className="block font-semibold text-[#023E8A] mb-3">{label}</label>

                  {type === "image" ? (
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
                        {settings[key] ? (
                          <SupabaseImage src={settings[key]} alt={label} width={80} height={80} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-2 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors">
                          {uploading[key] ? "Uploading…" : <><Upload size={14} /> {settings[key] ? "Change Image" : "Upload Image"}</>}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(key, (rest as { bucket: string }).bucket, file);
                            }}
                          />
                        </label>
                        <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WEBP — max 5MB</p>
                        {saved[key] && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><Check size={12} /> Saved!</p>}
                        {uploadError[key] && <p className="text-red-500 text-xs mt-1">Upload failed: {uploadError[key]}</p>}
                      </div>
                    </div>
                  ) : type === "textarea" ? (
                    <div>
                      <textarea
                        rows={3}
                        value={settings[key] ?? ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={(rest as { placeholder?: string }).placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        {saved[key] && <span className="text-green-600 text-xs flex items-center gap-1"><Check size={12} /> Saved!</span>}
                        <button onClick={() => saveSetting(key, settings[key] ?? "")}
                          className="flex items-center gap-1.5 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors ml-auto">
                          <Save size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input type="text"
                        value={settings[key] ?? ""}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={(rest as { placeholder?: string }).placeholder}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0077B6] focus:outline-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        {saved[key] && <span className="text-green-600 text-xs flex items-center gap-1"><Check size={12} /> Saved!</span>}
                        <button onClick={() => saveSetting(key, settings[key] ?? "")}
                          className="flex items-center gap-1.5 bg-[#0077B6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#023E8A] transition-colors ml-auto">
                          <Save size={13} /> Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
