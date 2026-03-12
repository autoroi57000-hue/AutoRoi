"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

// Revalider toutes les pages publiques qui consomment des settings
function revalidateAllSettingsPages() {
  const locales = ["fr", "en"];
  locales.forEach((locale) => {
    revalidatePath(`/${locale}`, "layout");
    revalidatePath(`/${locale}/contact`);
    revalidatePath(`/${locale}/mentions-legales`);
    revalidatePath(`/${locale}/confidentialite`);
    revalidatePath(`/${locale}/vehicules`, "layout");
    revalidatePath(`/${locale}/location`, "layout");
  });
  revalidatePath("/", "layout");
}

// Helper pour vérifier si l'utilisateur est admin
async function checkAdmin(supabase: Awaited<ReturnType<typeof createActionClient>>): Promise<{ user: { id: string } | null; error?: string }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { user: null, error: "Non authentifié" };
  }

  // Vérifier le rôle
  const { data: profile, error: profileError } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile?.role !== "admin") {
    return { user: null, error: "Accès réservé aux administrateurs" };
  }

  return { user: { id: user.id } };
}

// Mettre à jour un paramètre individuel
export async function updateSetting(
  key: string,
  value: string,
  description?: string
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    
    const { user, error: authError } = await checkAdmin(supabase);
    if (!user) {
      return { success: false, error: authError || "Non autorisé" };
    }


    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert({
        key,
        value,
        description: description || null,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }, {
        onConflict: "key",
      });

    if (error) {
      console.error("Error updating setting:", error);
      return { success: false, error: "Erreur lors de la sauvegarde" };
    }

    // Revalider TOUTES les pages qui affichent des settings
    revalidateAllSettingsPages();

    return { success: true };
  } catch (error) {
    console.error("Error in updateSetting:", error);
    return { success: false, error: "Erreur inattendue" };
  }
}

// Mettre à jour plusieurs paramètres en une fois
export async function bulkUpdateSettings(
  settings: { key: string; value: string; description?: string }[]
): Promise<ActionResult> {
  try {
    const supabase = await createActionClient();
    
    const { user, error: authError } = await checkAdmin(supabase);
    if (!user) {
      return { success: false, error: authError || "Non autorisé" };
    }

    const now = new Date().toISOString();
    
    const settingsToUpsert = settings.map((s) => ({
      key: s.key,
      value: s.value,
      description: s.description || null,
      updated_at: now,
      updated_by: user.id,
    }));


    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert(settingsToUpsert, {
        onConflict: "key",
      });

    if (error) {
      console.error("Error bulk updating settings:", error);
      return { success: false, error: "Erreur lors de la sauvegarde" };
    }

    // Revalider TOUTES les pages qui affichent des settings
    revalidateAllSettingsPages();

    return { success: true };
  } catch (error) {
    console.error("Error in bulkUpdateSettings:", error);
    return { success: false, error: "Erreur inattendue" };
  }
}

// Récupérer tous les paramètres
export async function getAllSettings(): Promise<{ success: boolean; data?: Record<string, string>; error?: string }> {
  try {
    const supabase = await createActionClient();
    
    const { user, error: authError } = await checkAdmin(supabase);
    if (!user) {
      return { success: false, error: authError || "Non autorisé" };
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (error) {
      console.error("Error fetching settings:", error);
      return { success: false, error: "Erreur lors du chargement" };
    }

    const settingsMap: Record<string, string> = {};
    data?.forEach((setting: { key: string; value: string }) => {
      settingsMap[setting.key] = setting.value;
    });

    return { success: true, data: settingsMap };
  } catch (error) {
    console.error("Error in getAllSettings:", error);
    return { success: false, error: "Erreur inattendue" };
  }
}
