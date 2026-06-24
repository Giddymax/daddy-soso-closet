import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
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
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["shopping", "business"],
  };
}
