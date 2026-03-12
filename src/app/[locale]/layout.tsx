import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import type { ReactNode } from "react";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={params.locale}>
      {children}
    </NextIntlClientProvider>
  );
}
