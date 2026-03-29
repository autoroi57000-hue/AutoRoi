import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import dynamic from "next/dynamic";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";

const CustomCursor = dynamic(() => import("@/components/CustomCursor").then(m => m.CustomCursor), {
  ssr: false,
});

const GoldParticles = dynamic(() => import("@/components/GoldParticles").then(m => m.GoldParticles), {
  ssr: false,
});

const InstallBanner = dynamic(() => import("@/components/pwa/InstallBanner").then(m => m.InstallBanner), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: (() => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    try { return url ? new URL(url) : new URL("http://localhost:3000"); }
    catch { return new URL("http://localhost:3000"); }
  })(),
  title: "Auto Roi — Véhicules Premium",
  description: "Découvrez notre sélection de véhicules premium chez Auto Roi.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Auto Roi",
  },
  openGraph: {
    type: "website",
    siteName: "Auto Roi",
    locale: "fr_FR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Auto Roi — Véhicules Premium" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AutoRoi",
  },
  alternates: {
    languages: {
      "fr": process.env.NEXT_PUBLIC_SITE_URL || "https://autoroi.fr",
      "en": `${process.env.NEXT_PUBLIC_SITE_URL || "https://autoroi.fr"}/en`,
    },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-TileImage": "/icons/icon-144.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("dark", inter.variable, playfair.variable)}>
      <head />
      <body className={cn("min-h-screen font-sans antialiased grain")}>
        {children}
        <GoldParticles mode="fixed" count={18} />
        <CustomCursor />
        <InstallBanner />
        <Script src="/register-sw.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
