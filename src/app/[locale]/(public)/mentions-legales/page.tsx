import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("legalTitle"),
    description: t("homeDescription"),
  };
}

function Val({ value, fallback }: { value: string; fallback: string }) {
  if (value && value.trim()) {
    return <>{value}</>;
  }
  return (
    <em className="text-ar-silver/40">
      {fallback}
    </em>
  );
}

export default async function LegalPage() {
  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();
  const placeholder = "Non renseigné — à compléter dans les paramètres admin";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-ar-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Mentions légales
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              1. Éditeur du site
            </h2>
            <p className="text-ar-silver">
              Le site {settings.business_name} est édité par :
            </p>
            <ul className="mt-2 list-inside list-disc text-ar-silver">
              <li>Raison sociale : <Val value={settings.legal_entity_name} fallback={placeholder} /></li>
              <li>Forme juridique : <Val value={settings.legal_form} fallback={placeholder} /></li>
              <li>Capital social : <Val value={settings.legal_capital} fallback={placeholder} /></li>
              <li>SIRET : <Val value={settings.legal_siret} fallback={placeholder} /></li>
              <li>Siège social : <Val value={settings.legal_address} fallback={placeholder} /></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              2. Directeur de la publication
            </h2>
            <p className="text-ar-silver">
              <Val value={settings.legal_entity_name} fallback={placeholder} />
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              3. Hébergement
            </h2>
            <p className="text-ar-silver">
              Le site est hébergé par :
            </p>
            <ul className="mt-2 list-inside list-disc text-ar-silver">
              <li>Nom de l&apos;hébergeur : <Val value={settings.legal_host_name} fallback={placeholder} /></li>
              <li>Adresse : <Val value={settings.legal_host_address} fallback={placeholder} /></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              4. Contact
            </h2>
            <p className="text-ar-silver">
              Pour toute question concernant ce site, vous pouvez nous contacter :
            </p>
            <ul className="mt-2 list-inside list-disc text-ar-silver">
              <li>Par email : {settings.email_public || settings.contact_email}</li>
              <li>Par téléphone : {settings.phone_number}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              5. Propriété intellectuelle
            </h2>
            <p className="text-ar-silver">
              L&apos;ensemble du contenu de ce site (textes, images, logos, vidéos, etc.)
              est la propriété exclusive de {settings.business_name} ou de ses partenaires.
              Toute reproduction, représentation, modification, publication, adaptation
              de tout ou partie des éléments du site, quel que soit le moyen ou le
              procédé utilisé, est interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              6. Limitation de responsabilité
            </h2>
            <p className="text-ar-silver">
              {settings.business_name} s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour
              des informations diffusées sur ce site. Toutefois, {settings.business_name} ne peut
              garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations
              mises à disposition sur le site.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              7. Droit applicable
            </h2>
            <p className="text-ar-silver">
              Les présentes mentions légales sont soumises au droit français.
              En cas de litige, les tribunaux français seront compétents.
            </p>
            <p className="mt-4 text-sm text-ar-silver/70">
              Dernière mise à jour : {currentYear}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
