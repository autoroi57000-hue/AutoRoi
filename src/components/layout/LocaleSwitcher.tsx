"use client";

import { usePathname, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DEFAULT_LOCALE, localePath } from "@/lib/constants";

interface LocaleSwitcherProps {
  className?: string;
}

const locales = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) || "fr";

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    // Extract the path without the current locale prefix
    let pathWithoutLocale = pathname;
    if (currentLocale !== DEFAULT_LOCALE) {
      // Current locale has a prefix (e.g. /en/vehicules → /vehicules)
      pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
    }
    // Build new path with the target locale
    const newPathname = localePath(newLocale, pathWithoutLocale === "/" ? "" : pathWithoutLocale);
    router.push(newPathname);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {locales.map((locale) => (
        <button
          key={locale.code}
          onClick={() => switchLocale(locale.code)}
          className={cn(
            "rounded px-2 py-1 text-sm font-medium transition-all",
            currentLocale === locale.code
              ? "bg-ar-gold text-ar-black"
              : "text-ar-silver hover:text-ar-gold"
          )}
          aria-label={`Switch to ${locale.label}`}
          aria-current={currentLocale === locale.code ? "true" : undefined}
        >
          {locale.label}
        </button>
      ))}
    </div>
  );
}
