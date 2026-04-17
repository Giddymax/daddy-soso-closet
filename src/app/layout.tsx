import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { createServerClient } from "@/lib/supabase-server";

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
    openGraph: {
      title: "Daddy SoSo Closet",
      description: "Fashion. Style. Elegance.",
      url: "https://www.daddysosocloset.com",
      siteName: "Daddy SoSo Closet",
      type: "website",
    },
    ...(logoUrl && {
      icons: {
        icon: [
          { url: logoUrl, sizes: "32x32" },
          { url: logoUrl, sizes: "64x64" },
          { url: logoUrl, sizes: "192x192" },
        ],
        apple: [{ url: logoUrl, sizes: "180x180" }],
      },
    }),
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
