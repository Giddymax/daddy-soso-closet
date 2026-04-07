import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
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
};

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
