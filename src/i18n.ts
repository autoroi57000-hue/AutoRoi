import { getRequestConfig } from "next-intl/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/constants";

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request (async in v4)
  let locale = await requestLocale;

  // Validate that the incoming locale is supported
  if (!locale || !LOCALES.includes(locale as Locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
