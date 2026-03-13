import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import type { Metadata } from "next";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const locale = params.locale === "en" ? "en" : "fr";
  return {
    manifest: `/manifest.${locale}.json`,
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={params.locale}>
      {children}
    </NextIntlClientProvider>
  );
}
