"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

interface SiteSettings {
  [key: string]: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  getSetting: (key: string, defaultValue?: string) => string;
  updateSetting: (key: string, value: string) => void;
  refreshSettings: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000;
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp: number = 0;

const ctx = React.createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SiteSettings>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchSettings = React.useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cachedSettings && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setSettings(cachedSettings);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) {
        console.error("Error fetching site settings:", error);
        return;
      }

      const settingsMap: SiteSettings = {};
      data?.forEach((setting: { key: string; value: string }) => {
        settingsMap[setting.key] = setting.value;
      });

      cachedSettings = settingsMap;
      cacheTimestamp = Date.now();
      setSettings(settingsMap);
    } catch (err) {
      console.error("Error in fetchSettings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const getSetting = React.useCallback((key: string, defaultValue: string = ""): string => {
    return settings[key] ?? defaultValue;
  }, [settings]);

  const updateSetting = React.useCallback((key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (cachedSettings) {
      cachedSettings[key] = value;
    }
  }, []);

  const refreshSettings = React.useCallback(async () => {
    setIsLoading(true);
    await fetchSettings(true);
  }, [fetchSettings]);

  const value = {
    settings,
    isLoading,
    getSetting,
    updateSetting,
    refreshSettings,
  };

  return React.createElement(ctx.Provider, { value }, children);
}

export function useSiteSettings() {
  const context = React.useContext(ctx);
  if (!context) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return context;
}

export function useSetting(key: string, defaultValue: string = ""): string {
  const { getSetting } = useSiteSettings();
  return getSetting(key, defaultValue);
}
