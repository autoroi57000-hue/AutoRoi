import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "./SettingsContent";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin" });
  return {
    title: `${t("settings")} | Auto Roi`,
  };
}

// Vérifier que l'utilisateur est admin
async function checkAdmin() {
  const supabase = await createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile?.role !== "admin") {
    return false;
  }

  return true;
}

// Charger tous les settings
async function loadSettings() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value, description");

  if (error) {
    console.error("Error loading settings:", error);
    return {};
  }

  const settings: Record<string, string> = {};
  data?.forEach((s: { key: string; value: string }) => {
    settings[s.key] = s.value;
  });

  return settings;
}

export default async function SettingsPage() {
  // Vérifier les droits admin
  const isAdmin = await checkAdmin();
  
  if (!isAdmin) {
    redirect("/fr/login");
  }

  // Charger les settings
  const settings = await loadSettings();

  return <SettingsContent initialSettings={settings} />;
}
