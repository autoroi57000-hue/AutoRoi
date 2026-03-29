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
    title: "Politique de Confidentialité — Auto Roi",
    description: "Politique de confidentialité d'Auto Roi — gestion de vos données personnelles, cookies et droits RGPD.",
  };
}

function Val({ value, fallback }: { value: string; fallback: string }) {
  if (value && value.trim()) {
    return <>{value}</>;
  }
  return (
    <span className="text-orange-400 italic">
      {fallback}
    </span>
  );
}

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const placeholder = "[À compléter dans les Paramètres admin]";
  const email = settings.email_public || settings.contact_email;
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-ar-black py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Politique de Confidentialité
          </h1>
          <p className="mt-4 text-[#C9A84C] text-lg font-medium">
            {settings.business_name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-10">

          {/* Responsable */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Responsable du traitement
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li><Val value={settings.legal_entity_name} fallback={placeholder} /> — SIRET <Val value={settings.legal_siret} fallback={placeholder} /></li>
                <li><Val value={settings.legal_address} fallback={placeholder} /></li>
                <li>Email DPO : {email}</li>
              </ul>
            </div>
          </section>

          {/* Données collectées */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Données collectées
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">
                Dans le cadre de nos services, nous collectons :
              </p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Données d&apos;identification : nom, prénom, date de naissance</li>
                <li>Coordonnées : email, téléphone, adresse</li>
                <li>Données de paiement : traitées par Stripe (non stockées par {settings.business_name})</li>
                <li>Documents : permis de conduire, pièce d&apos;identité (vérification uniquement)</li>
                <li>Données de navigation : cookies techniques uniquement</li>
              </ul>
            </div>
          </section>

          {/* Finalités */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Finalités du traitement
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Gestion des réservations et contrats de location</li>
                <li>Communication relative à vos réservations</li>
                <li>Facturation et comptabilité (obligation légale)</li>
                <li>Amélioration de nos services</li>
              </ul>
            </div>
          </section>

          {/* Base légale */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Base légale
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Exécution du contrat (réservations)</li>
                <li>Obligation légale (facturation, 10 ans)</li>
                <li>Intérêt légitime (sécurité, amélioration des services)</li>
                <li>Consentement (communications marketing — opt-in)</li>
              </ul>
            </div>
          </section>

          {/* Durée de conservation */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Durée de conservation
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Données contractuelles : 5 ans après fin de relation</li>
                <li>Données comptables : 10 ans (obligation légale)</li>
                <li>Données de navigation : 13 mois maximum</li>
                <li>Documents d&apos;identité : supprimés après vérification</li>
              </ul>
            </div>
          </section>

          {/* Partage des données */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Partage des données
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">
                Vos données ne sont jamais vendues. Prestataires sous-traitants (contrats RGPD) :
              </p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Stripe : paiements sécurisés</li>
                <li>Resend : emails transactionnels</li>
                <li>Supabase : hébergement des données (UE)</li>
                <li>Vercel : hébergement du site (certifié SOC2)</li>
              </ul>
            </div>
          </section>

          {/* Vos droits */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Vos droits
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Accès à vos données</li>
                <li>Rectification</li>
                <li>Suppression (&quot;droit à l&apos;oubli&quot;)</li>
                <li>Portabilité</li>
                <li>Opposition au traitement</li>
                <li>Limitation du traitement</li>
              </ul>
              <p className="text-ar-silver mt-4">
                Exercice des droits : {email}
              </p>
              <p className="text-ar-silver">
                Réponse sous 30 jours.
              </p>
              <p className="text-ar-silver mt-2">
                Réclamation possible auprès de la CNIL :{" "}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
                  className="text-[#C9A84C] underline hover:text-[#FFE08A]">
                  cnil.fr
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Cookies
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">
                Cookies strictement nécessaires uniquement :
              </p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Session d&apos;authentification (admin)</li>
                <li>Préférence de langue</li>
              </ul>
              <p className="text-ar-silver mt-2 font-semibold">
                Aucun cookie publicitaire ou de tracking tiers.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Sécurité
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Connexions chiffrées HTTPS/TLS</li>
                <li>Accès aux données restreint au personnel habilité</li>
                <li>Hébergement en Union Européenne</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </div>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Modifications
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver leading-relaxed">
                Toute modification de cette politique sera notifiée par email
                aux utilisateurs concernés.
              </p>
              <p className="mt-6 text-sm text-ar-silver/70">
                Dernière mise à jour : {today}
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
