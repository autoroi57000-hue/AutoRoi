import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { cn } from "@/lib/utils";

const CustomCursor = dynamic(() => import("@/components/CustomCursor").then(m => m.CustomCursor), {
  ssr: false,
});

const GoldParticles = dynamic(() => import("@/components/GoldParticles").then(m => m.GoldParticles), {
  ssr: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Auto Roi — Véhicules Premium",
  description: "Découvrez notre sélection de véhicules premium chez Auto Roi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn("dark", inter.variable, playfair.variable)}>
      <body className={cn("min-h-screen font-sans antialiased grain")}>
        {children}
        <GoldParticles mode="fixed" count={18} />
        <CustomCursor />
      </body>
    </html>
  );
}
