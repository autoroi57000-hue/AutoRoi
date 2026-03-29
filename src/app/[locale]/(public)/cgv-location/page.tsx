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
    title: "Conditions Générales de Location — Auto Roi",
    description: "Conditions générales de vente location Auto Roi — tarifs, modalités de réservation et politique d'annulation.",
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

export default async function CGVLocationPage() {
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
            Conditions Générales de Location
          </h1>
          <p className="mt-4 text-[#C9A84C] text-lg font-medium">
            {settings.business_name}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-10">

          {/* Article 1 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 1 — Objet et champ d&apos;application
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver leading-relaxed">
                Les présentes Conditions Générales de Location (CGL) régissent les relations
                contractuelles entre{" "}
                <Val value={settings.legal_entity_name} fallback={placeholder} />,{" "}
                <Val value={settings.legal_form} fallback={placeholder} /> au capital
                de <Val value={settings.legal_capital} fallback={placeholder} /> €,
                immatriculée sous le SIRET{" "}
                <Val value={settings.legal_siret} fallback={placeholder} />, dont le siège
                est situé au{" "}
                <Val value={settings.legal_address} fallback={placeholder} /> (ci-après
                &quot;{settings.business_name}&quot; ou le &quot;Loueur&quot;) et toute
                personne physique majeure effectuant une réservation (ci-après le
                &quot;Locataire&quot;).
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 2 — Conditions d&apos;accès à la location
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">
                Pour louer un véhicule, le Locataire doit :
              </p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Être titulaire d&apos;un permis de conduire valide depuis plus de 2 ans</li>
                <li>Être âgé de 21 ans minimum (23 ans pour véhicules premium)</li>
                <li>Présenter une pièce d&apos;identité en cours de validité</li>
                <li>Disposer d&apos;une carte bancaire au nom du Locataire</li>
                <li>Fournir une attestation d&apos;assurance conducteur</li>
              </ul>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 3 — Réservation et confirmation
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>3.1 — La réservation est effectuée en ligne via le site {settings.business_name}.</li>
                <li>3.2 — Elle devient ferme à réception du paiement de l&apos;acompte (30 % du montant total).</li>
                <li>3.3 — Un email de confirmation est envoyé sous 24 h ouvrées.</li>
                <li>3.4 — {settings.business_name} se réserve le droit de refuser toute réservation.</li>
              </ul>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 4 — Tarification et paiement
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>4.1 — Les prix sont indiqués en euros TTC.</li>
                <li>4.2 — Acompte : 30 % du montant total dû à la réservation (non remboursable sauf annulation par {settings.business_name}).</li>
                <li>4.3 — Solde : 70 % restant payable à la remise des clés.</li>
                <li>4.4 — Caution : une autorisation de prélèvement sera demandée selon le véhicule (montant communiqué à la réservation).</li>
                <li>4.5 — Kilométrage supplémentaire : facturation selon tarif en vigueur communiqué lors de la réservation.</li>
              </ul>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 5 — Durée et restitution
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>5.1 — La durée de location est fixée au contrat.</li>
                <li>5.2 — Tout dépassement non signalé sera facturé au tarif horaire en vigueur.</li>
                <li>5.3 — Le véhicule doit être restitué dans l&apos;état dans lequel il a été remis.</li>
                <li>5.4 — Un état des lieux contradictoire est réalisé au départ et au retour.</li>
                <li>5.5 — Plein de carburant : le véhicule est remis plein, il doit être restitué plein.</li>
              </ul>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 6 — Annulation
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver font-semibold mb-2">Par le Locataire :</p>
              <ul className="list-inside list-disc text-ar-silver space-y-1 mb-4">
                <li>Plus de 7 jours avant : remboursement de l&apos;acompte à 80 %</li>
                <li>Entre 3 et 7 jours : remboursement de 50 % de l&apos;acompte</li>
                <li>Moins de 72 h : acompte conservé intégralement</li>
              </ul>
              <p className="text-ar-silver font-semibold mb-2">Par {settings.business_name} :</p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>Annulation pour force majeure : remboursement intégral</li>
                <li>Remplacement par véhicule équivalent proposé en priorité</li>
              </ul>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 7 — Assurance et responsabilité
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>7.1 — Tout véhicule loué est assuré tous risques par {settings.business_name}.</li>
                <li>7.2 — Le Locataire est responsable des dommages non couverts par la franchise.</li>
                <li>7.3 — Franchise standard : communiquée par véhicule.</li>
                <li>7.4 — La responsabilité du Locataire est engagée en cas :</li>
              </ul>
              <ul className="list-inside list-[circle] text-ar-silver space-y-1 ml-6 mt-1">
                <li>D&apos;accident sous emprise d&apos;alcool ou stupéfiants</li>
                <li>D&apos;utilisation hors du territoire convenu</li>
                <li>D&apos;utilisation à des fins commerciales non autorisées</li>
                <li>De conduite par un tiers non déclaré</li>
              </ul>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 8 — Interdictions
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver mb-2">Il est strictement interdit :</p>
              <ul className="list-inside list-disc text-ar-silver space-y-1">
                <li>De sous-louer le véhicule</li>
                <li>De fumer dans le véhicule (pénalité de nettoyage : 150 €)</li>
                <li>De transporter des animaux sans protection (pénalité : 80 €)</li>
                <li>D&apos;utiliser le véhicule hors route ou en compétition</li>
                <li>De dépasser les frontières sans autorisation préalable</li>
              </ul>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 9 — Données personnelles
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver leading-relaxed">
                Les données collectées sont traitées conformément à notre{" "}
                <a href="/confidentialite" className="text-[#C9A84C] underline hover:text-[#FFE08A]">
                  Politique de Confidentialité
                </a>.
                Conformément au RGPD, le Locataire dispose d&apos;un droit d&apos;accès, de
                rectification et de suppression de ses données.
              </p>
              <p className="text-ar-silver mt-2">
                Contact : {email}
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="mb-4 font-display text-2xl font-bold text-white">
              Article 10 — Litiges et juridiction
            </h2>
            <div className="border-t border-[#C9A84C]/30 pt-4">
              <p className="text-ar-silver leading-relaxed">
                En cas de litige, une solution amiable sera recherchée en priorité.
                À défaut, les tribunaux compétents seront ceux du ressort
                de <Val value={settings.legal_address} fallback={placeholder} />.
              </p>
              <p className="text-ar-silver mt-2">
                Loi applicable : droit français.
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
