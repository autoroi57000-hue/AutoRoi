import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedVehiclesSection } from "@/components/home/FeaturedVehiclesSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { LatestArrivalsSection } from "@/components/home/LatestArrivalsSection";
import { ContactCTASection } from "@/components/home/ContactCTASection";
import { RentalShowcaseSection } from "@/components/home/RentalShowcaseSection";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { getRentalVehicles } from "@/lib/rentals";
import type { VehicleCard } from "@/types/vehicle";

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
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        en: "/en",
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      type: "website",
    },
  };
}

// Helper to fetch featured vehicles
async function getFeaturedVehicles(): Promise<VehicleCard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vehicles_with_cover")
    .select(
      `
      id,
      slug,
      brand,
      model,
      version,
      year,
      fuel,
      mileage,
      price,
      price_negotiable,
      transmission,
      power_hp,
      body,
      condition,
      status,
      is_featured,
      published_at,
      cover_url
    `
    )
    .eq("status", "publie")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(6);

  // If no featured vehicles, get the 6 latest published
  if (!data || data.length === 0) {
    const { data: latestData } = await supabase
      .from("vehicles_with_cover")
      .select(
        `
        id,
        slug,
        brand,
        model,
        version,
        year,
        fuel,
        mileage,
        price,
        price_negotiable,
        transmission,
        power_hp,
        body,
        condition,
        status,
        is_featured,
        published_at,
        cover_url
      `
      )
      .eq("status", "publie")
      .order("published_at", { ascending: false })
      .limit(6);

    return (latestData as VehicleCard[]) || [];
  }

  return (data as VehicleCard[]) || [];
}

// Helper to fetch latest arrivals
async function getLatestArrivals(): Promise<VehicleCard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vehicles_with_cover")
    .select(
      `
      id,
      slug,
      brand,
      model,
      version,
      year,
      fuel,
      mileage,
      price,
      price_negotiable,
      transmission,
      power_hp,
      body,
      condition,
      status,
      is_featured,
      published_at,
      cover_url
    `
    )
    .eq("status", "publie")
    .order("published_at", { ascending: false })
    .limit(3);

  return (data as VehicleCard[]) || [];
}

// Helper to fetch category counts
async function getCategoryCounts(): Promise<{
  voiture: number;
  moto: number;
  utilitaire: number;
  total: number;
}> {
  const supabase = await createClient();

  // Get counts by type
  const { data: typeData } = await supabase
    .from("vehicles")
    .select("vehicle_type")
    .eq("status", "publie");

  const counts = {
    voiture: 0,
    moto: 0,
    utilitaire: 0,
    total: 0,
  };

  if (typeData) {
    typeData.forEach((v: { vehicle_type: string }) => {
      counts.total++;
      if (v.vehicle_type === "voiture") counts.voiture++;
      else if (v.vehicle_type === "moto") counts.moto++;
      else if (v.vehicle_type === "utilitaire") counts.utilitaire++;
    });
  }

  return counts;
}

// Helper to fetch unique brands
async function getBrands(): Promise<string[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vehicles")
    .select("brand")
    .eq("status", "publie")
    .order("brand");

  if (!data) return [];

  // Get unique brands
  const brands = Array.from(new Set(data.map((v: { brand: string }) => v.brand))).filter(Boolean);
  return brands;
}

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

  return (
    <div className="min-h-screen">
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
