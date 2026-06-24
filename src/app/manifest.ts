import type { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase-server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .single();

  const logoUrl = data?.value;

  const icons: MetadataRoute.Manifest["icons"] = logoUrl
    ? [
        { src: logoUrl, sizes: "192x192", type: "image/png" },
        { src: logoUrl, sizes: "512x512", type: "image/png" },
      ]
    : [
        { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
        { src: "/icons/icon-maskable.svg", sizes: "any", type: "image/svg+xml" },
      ];

  return {
    name: "Daddy SoSo Closet",
    short_name: "DaddySoSo",
    description:
      "Fashion Boutique & Salon — Tweapease & Abaam, Eastern Region, Ghana",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2C1A0E",
    orientation: "portrait-primary",
    scope: "/",
    icons,
    categories: ["shopping", "business"],
  };
}
