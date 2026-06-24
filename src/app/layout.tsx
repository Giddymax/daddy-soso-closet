import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
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

export const metadata: Metadata = {
  title: "Daddy SoSo Closet | Fashion Boutique in Ghana",
  description:
    "Shop the latest fashion at Daddy SoSo Closet. Two branches in Tweapease and Abaam, Kwaebibirim Municipal, Eastern Region, Ghana. Clothing, jewelry, footwear and more.",
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
    icon: [{ url: "/api/app-icon", sizes: "any" }],
    shortcut: [{ url: "/api/app-icon" }],
    apple: [{ url: "/api/app-icon", sizes: "180x180" }],
  },
};

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
