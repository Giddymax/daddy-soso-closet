import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { createServerClient } from "@/lib/supabase-server";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#2C1A0E",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "logo_url")
    .single();

  const logoUrl = data?.value;

  return {
    title: "Daddy SoSo Closet | Fashion Boutique in Ghana",
    description:
      "Shop the latest fashion at Daddy SoSo Closet. Two branches in Tweapease and Abaam, Kwaebibirim Municipal, Eastern Region, Ghana. Clothing, jewelry, footwear and more.",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "DaddySoSo",
    },
    openGraph: {
      title: "Daddy SoSo Closet",
      description: "Fashion. Style. Elegance.",
      url: "https://www.daddysosocloset.com",
      siteName: "Daddy SoSo Closet",
      type: "website",
    },
    icons: {
      icon: logoUrl
        ? [
            { url: logoUrl, sizes: "32x32" },
            { url: logoUrl, sizes: "64x64" },
            { url: logoUrl, sizes: "192x192" },
          ]
        : [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
      apple: logoUrl
        ? [{ url: logoUrl, sizes: "180x180" }]
        : [{ url: "/icons/icon.svg" }],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
