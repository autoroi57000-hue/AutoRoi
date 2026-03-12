-- =============================================================================
-- MIGRATION : Ajout feature Location de véhicules
-- Date : 2026-03-11
-- Description : Crée les tables rental_vehicles, rental_options, rentals,
--               rental_emails_log avec leurs fonctions, triggers, RLS et index.
--               Ne modifie AUCUNE table, vue ou enum existant.
-- =============================================================================

-- Créer la fonction update_updated_at() si elle n'existe pas encore
-- (elle peut déjà exister via schema.sql initial)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE : rental_vehicles
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_vehicles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      UUID        REFERENCES profiles(id) ON DELETE SET NULL,

  -- Identité (types TEXT libres pour ne pas dépendre des enums vehicles)
  brand           TEXT        NOT NULL,
  model           TEXT        NOT NULL,
  version         TEXT,
  year            INTEGER     CHECK (year >= 1900 AND year <= 2030),
  vehicle_type    TEXT,         -- voiture | utilitaire | moto
  fuel            TEXT,         -- essence | diesel | hybride | electrique | gpl | autre
  transmission    TEXT,         -- manuelle | automatique | semi-automatique
  body            TEXT,         -- berline | suv | break | coupe | ...
  seats           INTEGER,
  doors           INTEGER,
  color           TEXT,
  mileage         INTEGER,
  power_hp        INTEGER,
  description_fr  TEXT,
  description_en  TEXT,

  -- Tarification journalière / horaire
  price_per_day   NUMERIC(10,2) NOT NULL CHECK (price_per_day > 0),
  price_per_hour  NUMERIC(10,2),

  -- Paliers dégressifs (tableau JSON)
  -- Exemple : [{"days_from": 4, "days_to": 7, "price_per_day": 85.00}]
  pricing_tiers   JSONB         NOT NULL DEFAULT '[]'::jsonb,

  -- Suppléments (en pourcentage)
  weekend_surcharge  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (weekend_surcharge >= 0),
  holiday_surcharge  NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (holiday_surcharge >= 0),

  -- Caution et acompte
  deposit_amount     NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  deposit_percentage INTEGER       NOT NULL DEFAULT 30
                        CHECK (deposit_percentage BETWEEN 0 AND 100),

  -- Kilométrage inclus
  included_km_per_day INTEGER       NOT NULL DEFAULT 200 CHECK (included_km_per_day >= 0),
  extra_km_price      NUMERIC(6,3)  NOT NULL DEFAULT 0.25 CHECK (extra_km_price >= 0),

  -- Statut de disponibilité
  status  TEXT  NOT NULL DEFAULT 'disponible'
            CHECK (status IN ('disponible', 'indisponible', 'maintenance')),

  -- Médias (tableau d'URLs JSON)
  photos      JSONB  NOT NULL DEFAULT '[]'::jsonb,
  cover_photo TEXT,

  -- SEO
  slug  TEXT  UNIQUE NOT NULL,

  -- Timestamps
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE rental_vehicles IS
  'Véhicules disponibles à la location, distincts du catalogue de vente.';

COMMENT ON COLUMN rental_vehicles.pricing_tiers IS
  'Paliers dégressifs JSON. Ex: [{"days_from":4,"days_to":7,"price_per_day":85}]';

COMMENT ON COLUMN rental_vehicles.photos IS
  'Tableau JSON d''URLs de photos. Ex: [{"url":"https://...","is_primary":true}]';

-- =============================================================================
-- TABLE : rental_options
-- Options additionnelles proposées à la réservation (siège enfant, GPS, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_options (
  id           UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT     NOT NULL,
  description  TEXT,
  category     TEXT     CHECK (category IN ('accessoire', 'assurance', 'forfait_km')),
  price_type   TEXT     NOT NULL CHECK (price_type IN ('fixed', 'per_day')),
  price        NUMERIC(8,2) NOT NULL CHECK (price >= 0),
  is_active    BOOLEAN  NOT NULL DEFAULT true,
  sort_order   INTEGER  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE rental_options IS
  'Options additionnelles proposées lors d''une réservation (siège bébé, GPS, assurance tous risques…).';

COMMENT ON COLUMN rental_options.price_type IS
  'fixed = prix unique pour toute la durée ; per_day = multiplié par le nombre de jours.';

-- =============================================================================
-- TABLE : rentals
-- Une réservation de location, du devis à la clôture
-- =============================================================================

CREATE TABLE IF NOT EXISTS rentals (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Référence lisible générée automatiquement (ex: LOC-2026-0001)
  reference  TEXT  UNIQUE NOT NULL DEFAULT '',

  -- Véhicule loué
  rental_vehicle_id  UUID  NOT NULL
    REFERENCES rental_vehicles(id) ON DELETE RESTRICT,

  -- Période de location
  start_date  TIMESTAMPTZ  NOT NULL,
  end_date    TIMESTAMPTZ  NOT NULL,
  CONSTRAINT  rentals_dates_check CHECK (end_date > start_date),

  -- Durée
  total_days   INTEGER  NOT NULL CHECK (total_days > 0),
  total_hours  INTEGER,

  -- Prix (snapshot immuable au moment de la réservation)
  base_price_per_day  NUMERIC(10,2)  NOT NULL,
  subtotal            NUMERIC(10,2)  NOT NULL,
  options_total       NUMERIC(10,2)  NOT NULL DEFAULT 0,
  surcharge_total     NUMERIC(10,2)  NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2)  NOT NULL CHECK (total_amount >= 0),

  -- Acompte
  deposit_amount   NUMERIC(10,2)  NOT NULL,
  deposit_paid     BOOLEAN        NOT NULL DEFAULT false,
  deposit_paid_at  TIMESTAMPTZ,

  -- Stripe
  stripe_payment_intent_id    TEXT,
  stripe_session_id           TEXT,
  stripe_checkout_expires_at  TIMESTAMPTZ,

  -- Options sélectionnées (snapshot)
  -- Ex: [{"option_id":"uuid","name":"GPS","price":5,"price_type":"per_day","subtotal":15}]
  selected_options  JSONB  NOT NULL DEFAULT '[]'::jsonb,

  -- Informations client (pas de compte obligatoire)
  client_first_name   TEXT  NOT NULL,
  client_last_name    TEXT  NOT NULL,
  client_email        TEXT  NOT NULL,
  client_phone        TEXT  NOT NULL,
  client_address      TEXT,
  client_city         TEXT,
  client_postal_code  TEXT,
  client_birth_date   DATE,
  client_license_number TEXT,

  -- Informations pro (facultatif)
  is_business    BOOLEAN  NOT NULL DEFAULT false,
  business_name  TEXT,
  business_siret TEXT,

  -- Consentement CGV
  cgv_accepted     BOOLEAN      NOT NULL DEFAULT false,
  cgv_accepted_at  TIMESTAMPTZ,

  -- Statut du cycle de vie
  status  TEXT  NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',       -- réservation créée, en attente de paiement
      'confirmed',     -- réservation confirmée (paiement reçu ou admin)
      'deposit_paid',  -- acompte encaissé, solde restant dû
      'in_progress',   -- véhicule remis au client
      'completed',     -- location terminée
      'cancelled',     -- annulée
      'no_show'        -- client ne s'est pas présenté
    )),
  cancelled_at         TIMESTAMPTZ,
  cancellation_reason  TEXT,

  -- Contrat PDF
  contract_url           TEXT,
  contract_generated_at  TIMESTAMPTZ,

  -- Notes internes
  internal_notes  TEXT,
  managed_by      UUID  REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE rentals IS
  'Réservations de location. Cycle: pending → confirmed/deposit_paid → in_progress → completed | cancelled | no_show.';

COMMENT ON COLUMN rentals.reference IS
  'Référence lisible auto-générée. Format: LOC-YYYY-NNNN.';

COMMENT ON COLUMN rentals.selected_options IS
  'Snapshot des options au moment de la réservation. Immuable après confirmation.';

COMMENT ON COLUMN rentals.base_price_per_day IS
  'Prix/jour appliqué (peut différer du tarif courant si palier dégressif activé).';

-- =============================================================================
-- TABLE : rental_emails_log
-- Traçabilité des emails envoyés pour chaque réservation
-- =============================================================================

CREATE TABLE IF NOT EXISTS rental_emails_log (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id          UUID        REFERENCES rentals(id) ON DELETE CASCADE,
  type               TEXT        NOT NULL
    CHECK (type IN (
      'confirmation_client',
      'confirmation_admin',
      'payment_received',
      'contract_ready',
      'reminder_24h',
      'reminder_pickup',
      'cancellation',
      'no_show'
    )),
  sent_to            TEXT        NOT NULL,
  sent_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_message_id  TEXT,
  status             TEXT        NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed', 'bounced'))
);

COMMENT ON TABLE rental_emails_log IS
  'Historique de tous les emails envoyés liés aux réservations (via Resend).';

-- =============================================================================
-- FONCTIONS
-- =============================================================================

-- Génération de la référence lisible LOC-YYYY-NNNN
-- SECURITY DEFINER pour accéder à la table rentals sans contrainte RLS
CREATE OR REPLACE FUNCTION generate_rental_reference()
RETURNS TEXT AS $$
DECLARE
  v_year   TEXT    := to_char(now(), 'YYYY');
  v_seq    INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM rentals
  WHERE EXTRACT(year FROM created_at) = EXTRACT(year FROM now());

  RETURN 'LOC-' || v_year || '-' || lpad(v_seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_rental_reference() IS
  'Génère une référence unique de type LOC-2026-0001. Appelée avant INSERT sur rentals.';

-- Trigger : assigne la référence si absente
CREATE OR REPLACE FUNCTION set_rental_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := generate_rental_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vérification de disponibilité d'un véhicule sur une plage de dates
-- Retourne TRUE si le véhicule est libre, FALSE si une réservation active chevauche
CREATE OR REPLACE FUNCTION check_rental_availability(
  p_vehicle_id        UUID,
  p_start             TIMESTAMPTZ,
  p_end               TIMESTAMPTZ,
  p_exclude_rental_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM rentals
    WHERE rental_vehicle_id = p_vehicle_id
      AND status NOT IN ('cancelled', 'no_show', 'completed')
      AND id IS DISTINCT FROM p_exclude_rental_id
      AND (start_date, end_date) OVERLAPS (p_start, p_end)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_rental_availability(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) IS
  'Retourne TRUE si le véhicule est disponible sur la plage [p_start, p_end).
   p_exclude_rental_id permet d''exclure la réservation en cours de modification.';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Référence automatique sur INSERT
CREATE TRIGGER trigger_rental_reference
  BEFORE INSERT ON rentals
  FOR EACH ROW EXECUTE FUNCTION set_rental_reference();

-- updated_at automatique (réutilise update_updated_at() de schema.sql)
CREATE TRIGGER set_rental_vehicles_updated_at
  BEFORE UPDATE ON rental_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- ---- rental_vehicles ----
ALTER TABLE rental_vehicles ENABLE ROW LEVEL SECURITY;

-- Lecture publique uniquement pour les véhicules disponibles
CREATE POLICY "rental_vehicles_public_read"
  ON rental_vehicles FOR SELECT
  TO anon, authenticated
  USING (status = 'disponible');

-- Admin : accès complet à tout
CREATE POLICY "rental_vehicles_admin_all"
  ON rental_vehicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Collaborateur : accès uniquement à ses propres véhicules
CREATE POLICY "rental_vehicles_collab_own"
  ON rental_vehicles FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'collaborateur' AND is_active = true
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'collaborateur' AND is_active = true
    )
  );

-- ---- rentals ----
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Public : création de réservation sans compte
CREATE POLICY "rentals_public_insert"
  ON rentals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin : accès complet
CREATE POLICY "rentals_admin_all"
  ON rentals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Collaborateur : lecture des réservations de ses véhicules
CREATE POLICY "rentals_collab_own_vehicles"
  ON rentals FOR SELECT
  TO authenticated
  USING (
    rental_vehicle_id IN (
      SELECT id FROM rental_vehicles WHERE created_by = auth.uid()
    )
  );

-- ---- rental_options ----
ALTER TABLE rental_options ENABLE ROW LEVEL SECURITY;

-- Lecture publique des options actives
CREATE POLICY "rental_options_public_read"
  ON rental_options FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admin : accès complet
CREATE POLICY "rental_options_admin_all"
  ON rental_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- rental_emails_log ----
ALTER TABLE rental_emails_log ENABLE ROW LEVEL SECURITY;

-- Admin uniquement
CREATE POLICY "rental_emails_log_admin"
  ON rental_emails_log FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- INDEX
-- =============================================================================

-- Index principal pour la vérification de disponibilité (partial index)
-- N'indexe que les réservations actives pour des perfs optimales
CREATE INDEX idx_rentals_vehicle_dates
  ON rentals(rental_vehicle_id, start_date, end_date)
  WHERE status NOT IN ('cancelled', 'no_show', 'completed');

CREATE INDEX idx_rentals_status
  ON rentals(status);

CREATE INDEX idx_rentals_client_email
  ON rentals(client_email);

CREATE INDEX idx_rentals_created_at
  ON rentals(created_at DESC);

CREATE INDEX idx_rentals_reference
  ON rentals(reference);

CREATE INDEX idx_rental_vehicles_status
  ON rental_vehicles(status);

CREATE INDEX idx_rental_vehicles_slug
  ON rental_vehicles(slug);

CREATE INDEX idx_rental_vehicles_created_by
  ON rental_vehicles(created_by);

-- =============================================================================
-- VUE UTILITAIRE
-- Équivalent de vehicles_with_cover pour la location,
-- avec compteurs de réservations actives
-- =============================================================================

CREATE OR REPLACE VIEW rental_vehicles_with_stats AS
SELECT
  rv.*,
  -- Nombre de réservations actives (non terminées, non annulées)
  COUNT(r.id) FILTER (
    WHERE r.status NOT IN ('cancelled', 'no_show', 'completed')
  ) AS active_reservations_count,
  -- Prochaine date de disponibilité (fin de la dernière réservation active)
  MAX(r.end_date) FILTER (
    WHERE r.status NOT IN ('cancelled', 'no_show', 'completed')
  ) AS next_available_after
FROM rental_vehicles rv
LEFT JOIN rentals r ON r.rental_vehicle_id = rv.id
GROUP BY rv.id;

COMMENT ON VIEW rental_vehicles_with_stats IS
  'Vue enrichie rental_vehicles avec nb de réservations actives et prochaine disponibilité.';

-- =============================================================================
-- FIN DE MIGRATION
-- Après exécution, régénérer les types TypeScript :
--   npx supabase gen types typescript --project-id dpiturupkchlgsjwrolf \
--     > src/types/database.ts
-- =============================================================================
