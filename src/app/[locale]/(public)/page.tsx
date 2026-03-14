import { Metadata } from "next";
import dynamic from "next/dynamic";
import { unstable_cache } from "next/cache";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { createAnonClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getRentalVehicles } from "@/lib/rentals";

// Below-the-fold sections — code-split for faster initial load
const FeaturedVehiclesSection = dynamic(() => import("@/components/home/FeaturedVehiclesSection").then(m => ({ default: m.FeaturedVehiclesSection })));
const CategoriesSection = dynamic(() => import("@/components/home/CategoriesSection").then(m => ({ default: m.CategoriesSection })));
const WhyChooseUsSection = dynamic(() => import("@/components/home/WhyChooseUsSection").then(m => ({ default: m.WhyChooseUsSection })));
const LatestArrivalsSection = dynamic(() => import("@/components/home/LatestArrivalsSection").then(m => ({ default: m.LatestArrivalsSection })));
const ContactCTASection = dynamic(() => import("@/components/home/ContactCTASection").then(m => ({ default: m.ContactCTASection })));
const RentalShowcaseSection = dynamic(() => import("@/components/home/RentalShowcaseSection").then(m => ({ default: m.RentalShowcaseSection })));
import type { VehicleCard } from "@/types/vehicle";
import { localePath } from '@/lib/constants'

interface HomePageProps {
  params: { locale: string };
}

// Generate metadata
export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = params;

  const titles = {
    fr: "Auto Roi — Véhicules Premium | Achat, Vente, Reprise",
    en: "Auto Roi — Premium Vehicles | Purchase, Sale, Trade-in",
  };

  const descriptions = {
    fr: "Découvrez notre sélection exclusive de véhicules premium. Plus de 100 véhicules disponibles. Auto Roi, votre expert automobile de confiance.",
    en: "Discover our exclusive selection of premium vehicles. Over 100 vehicles available. Auto Roi, your trusted automotive expert.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.fr,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    alternates: {
      canonical: locale === "fr" ? "/" : `${localePath(locale)}`,
      languages: {
        fr: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      type: "website",
    },
  };
}

// Vehicle fields used across all queries
const VEHICLE_SELECT = `id,slug,brand,model,version,year,fuel,mileage,price,price_negotiable,transmission,power_hp,body,condition,status,is_featured,published_at,cover_url`;

// Cached data fetchers — revalidate every 60s to avoid 5s+ Supabase RTT on each visit

const getFeaturedVehicles = unstable_cache(
  async (): Promise<VehicleCard[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("vehicles_with_cover")
      .select(VEHICLE_SELECT)
      .eq("status", "publie")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(6);

    if (!data || data.length === 0) {
      const { data: latestData } = await supabase
        .from("vehicles_with_cover")
        .select(VEHICLE_SELECT)
        .eq("status", "publie")
        .order("published_at", { ascending: false })
        .limit(6);
      return (latestData as VehicleCard[]) || [];
    }
    return (data as VehicleCard[]) || [];
  },
  ["home-featured-vehicles"],
  { revalidate: 60 }
);

const getLatestArrivals = unstable_cache(
  async (): Promise<VehicleCard[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("vehicles_with_cover")
      .select(VEHICLE_SELECT)
      .eq("status", "publie")
      .order("published_at", { ascending: false })
      .limit(3);
    return (data as VehicleCard[]) || [];
  },
  ["home-latest-arrivals"],
  { revalidate: 60 }
);

const getCategoryCounts = unstable_cache(
  async (): Promise<{ voiture: number; moto: number; utilitaire: number; total: number }> => {
    const supabase = createAnonClient();
    const { data: typeData } = await supabase
      .from("vehicles")
      .select("vehicle_type")
      .eq("status", "publie");

    const counts = { voiture: 0, moto: 0, utilitaire: 0, total: 0 };
    if (typeData) {
      typeData.forEach((v: { vehicle_type: string }) => {
        counts.total++;
        if (v.vehicle_type === "voiture") counts.voiture++;
        else if (v.vehicle_type === "moto") counts.moto++;
        else if (v.vehicle_type === "utilitaire") counts.utilitaire++;
      });
    }
    return counts;
  },
  ["home-category-counts"],
  { revalidate: 60 }
);

const getBrands = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createAnonClient();
    const { data } = await supabase
      .from("vehicles")
      .select("brand")
      .eq("status", "publie")
      .order("brand");
    if (!data) return [];
    return Array.from(new Set(data.map((v: { brand: string }) => v.brand))).filter(Boolean);
  },
  ["home-brands"],
  { revalidate: 60 }
);

function SectionDivider() {
  return <div className="section-divider-animated" aria-hidden="true" />;
}

// Home page component - Server Component
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  // Fetch all data in parallel
  const [featuredVehicles, latestArrivals, categoryCounts, brands, settings, rentalVehicles] = await Promise.all([
    getFeaturedVehicles(),
    getLatestArrivals(),
    getCategoryCounts(),
    getBrands(),
    getSiteSettings(),
    getRentalVehicles(),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://autoroi.fr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.business_name || "Auto Roi",
    description: locale === "en" ? settings.slogan_en : settings.slogan_fr,
    url: siteUrl,
    telephone: settings.phone_number,
    email: settings.contact_email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.business_address,
      addressCountry: "FR",
    },
    openingHours: settings.opening_hours,
    image: `${siteUrl}/icons/icon-512.png`,
    ...(settings.facebook_url && { sameAs: [settings.facebook_url, settings.instagram_url, settings.tiktok_url].filter(Boolean) }),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Section 1: Hero */}
      <HeroSection locale={locale} brands={brands} />

      {/* Section 2: Stats */}
      <StatsSection locale={locale} />
      <SectionDivider />

      {/* Section 3: Featured Vehicles */}
      <FeaturedVehiclesSection locale={locale} vehicles={featuredVehicles} />
      <SectionDivider />

      {/* Section 4: Categories */}
      <CategoriesSection locale={locale} counts={categoryCounts} />
      <SectionDivider />

      {/* Section 5: Why Choose Us */}
      <WhyChooseUsSection locale={locale} />
      <SectionDivider />

      {/* Section 6: Latest Arrivals */}
      <LatestArrivalsSection locale={locale} vehicles={latestArrivals} />

      {/* Section 7: Rental Showcase (conditional) */}
      {rentalVehicles.length > 0 && (
        <>
          <SectionDivider />
          <RentalShowcaseSection locale={locale} vehicles={rentalVehicles} />
        </>
      )}

      {/* Section 8: Contact CTA */}
      <ContactCTASection
        locale={locale}
        whatsappNumber={settings.whatsapp_number}
        phoneNumber={settings.phone_number}
        whatsappMessageFr={settings.whatsapp_message_fr}
        whatsappMessageEn={settings.whatsapp_message_en}
      />
    </div>
  );
}
