import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsAppButton } from "@/components/contact/FloatingWhatsAppButton";
import { getSiteSettings } from "@/lib/site-settings";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const settings = await getSiteSettings();
  const locale = params.locale;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        phoneNumber={settings.phone_number}
        whatsappNumber={settings.whatsapp_number}
        businessName={settings.business_name}
      />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
      <FloatingWhatsAppButton
        locale={locale}
        whatsappNumber={settings.whatsapp_number}
        businessName={settings.business_name}
        messageFr={settings.whatsapp_message_fr}
        messageEn={settings.whatsapp_message_en}
        tooltipFr={settings.whatsapp_tooltip_fr}
        tooltipEn={settings.whatsapp_tooltip_en}
        subtitleFr={settings.whatsapp_subtitle_fr}
        subtitleEn={settings.whatsapp_subtitle_en}
      />
    </div>
  );
}
