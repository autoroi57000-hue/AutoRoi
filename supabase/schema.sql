-- =============================================================================
-- AUTO ROI — Schéma PostgreSQL complet
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- =============================================================================
-- 2. CUSTOM TYPES (ENUMs)
-- =============================================================================
CREATE TYPE vehicle_type AS ENUM ('voiture', 'moto', 'utilitaire', 'autre');

CREATE TYPE fuel_type AS ENUM ('essence', 'diesel', 'hybride', 'electrique', 'gpl', 'autre');

CREATE TYPE transmission_type AS ENUM ('manuelle', 'automatique', 'semi-automatique');

CREATE TYPE body_type AS ENUM (
  'berline', 'suv', 'break', 'coupe', 'cabriolet',
  'monospace', 'pickup', 'utilitaire', 'moto', 'autre'
);

CREATE TYPE condition_type AS ENUM ('excellent', 'bon', 'passable', 'pieces');

CREATE TYPE ct_status AS ENUM ('valide', 'a_passer', 'non_requis');

CREATE TYPE vehicle_status AS ENUM ('brouillon', 'publie', 'vendu', 'archive');

CREATE TYPE user_role AS ENUM ('admin', 'collaborateur');

CREATE TYPE message_status AS ENUM ('non_lu', 'lu', 'traite', 'archive');

CREATE TYPE drive_type AS ENUM ('2RM', '4RM', 'integral');

-- =============================================================================
-- 3. TABLE PROFILES (liée à auth.users)
-- =============================================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  role        user_role NOT NULL DEFAULT 'collaborateur',
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLE VEHICLES (table principale)
-- =============================================================================
CREATE TABLE vehicles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identité
  brand             TEXT NOT NULL,
  model             TEXT NOT NULL,
  version           TEXT,
  year              INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  vehicle_type      vehicle_type NOT NULL DEFAULT 'voiture',

  -- Motorisation
  fuel              fuel_type NOT NULL,
  engine_size       INTEGER,
  power_hp          INTEGER,
  power_kw          INTEGER,
  transmission      transmission_type,
  drive             drive_type,

  -- Carrosserie
  body              body_type,
  doors             INTEGER CHECK (doors BETWEEN 1 AND 10),
  seats             INTEGER CHECK (seats BETWEEN 1 AND 20),
  color_ext         TEXT,
  color_int         TEXT,

  -- Kilométrage & Prix
  mileage           INTEGER NOT NULL CHECK (mileage >= 0),
  price             DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  price_negotiable  BOOLEAN NOT NULL DEFAULT false,
  first_sale_date   DATE,

  -- État
  condition         condition_type NOT NULL DEFAULT 'bon',
  ct_status         ct_status NOT NULL DEFAULT 'non_requis',
  ct_date           DATE,

  -- Descriptions bilingues
  description_fr    TEXT,
  description_en    TEXT,

  -- Slug SEO
  slug              TEXT UNIQUE,

  -- Statut & méta
  status            vehicle_status NOT NULL DEFAULT 'brouillon',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  views_count       INTEGER NOT NULL DEFAULT 0,

  -- Relations
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ,
  sold_at           TIMESTAMPTZ
);

-- =============================================================================
-- 5. TABLE VEHICLE_PHOTOS
-- =============================================================================
CREATE TABLE vehicle_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  is_primary    BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  width         INTEGER,
  height        INTEGER,
  size_bytes    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. TABLE VEHICLE_FEATURES (options / équipements)
-- =============================================================================
CREATE TABLE vehicle_features (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  feature     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'confort'
);

-- =============================================================================
-- 7. TABLE CONTACT_MESSAGES
-- =============================================================================
CREATE TABLE contact_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_ref TEXT,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  message     TEXT NOT NULL,
  status      message_status NOT NULL DEFAULT 'non_lu',
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at     TIMESTAMPTZ,
  replied_at  TIMESTAMPTZ
);

-- =============================================================================
-- 8. TABLE SITE_SETTINGS
-- =============================================================================
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id)
);

-- Valeurs par défaut
INSERT INTO site_settings (key, value, description) VALUES
  ('phone_number',             '+33 6 00 00 00 00',       'Numéro de téléphone principal'),
  ('whatsapp_number',          '33600000000',             'Numéro WhatsApp sans +'),
  ('whatsapp_default_message', 'Bonjour, je suis intéressé par un véhicule sur votre site Auto Roi.', 'Message WhatsApp par défaut'),
  ('contact_email',            'contact@auto-roi.fr',     'Email de réception des messages'),
  ('business_name',            'Auto Roi',                'Nom de l''entreprise'),
  ('business_address',         'France',                  'Adresse'),
  ('meta_description_fr',      'Auto Roi — Achat, vente et reprise automobile. Large choix de véhicules toutes marques.', 'Meta description FR'),
  ('meta_description_en',      'Auto Roi — Buy, sell and trade-in vehicles. Wide choice of all makes and models.',        'Meta description EN');

-- =============================================================================
-- 9. INDEX DE PERFORMANCE
-- =============================================================================
CREATE INDEX idx_vehicles_status     ON vehicles(status);
CREATE INDEX idx_vehicles_brand      ON vehicles(brand);
CREATE INDEX idx_vehicles_fuel       ON vehicles(fuel);
CREATE INDEX idx_vehicles_year       ON vehicles(year);
CREATE INDEX idx_vehicles_price      ON vehicles(price);
CREATE INDEX idx_vehicles_mileage    ON vehicles(mileage);
CREATE INDEX idx_vehicles_type       ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_published  ON vehicles(published_at DESC) WHERE status = 'publie';
CREATE INDEX idx_vehicles_featured   ON vehicles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_vehicles_slug       ON vehicles(slug);

CREATE INDEX idx_vehicle_photos_vehicle  ON vehicle_photos(vehicle_id);
CREATE INDEX idx_vehicle_photos_primary  ON vehicle_photos(vehicle_id, is_primary);

CREATE INDEX idx_contact_messages_status  ON contact_messages(status);
CREATE INDEX idx_contact_messages_vehicle ON contact_messages(vehicle_id);

-- =============================================================================
-- 10. FULL TEXT SEARCH
-- =============================================================================
ALTER TABLE vehicles ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_vehicles_fts ON vehicles USING GIN(search_vector);

-- Fonction de mise à jour du vecteur FTS
CREATE OR REPLACE FUNCTION update_vehicle_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.brand, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.version, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(NEW.description_fr, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description_en, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_search_vector
  BEFORE INSERT OR UPDATE OF brand, model, version, description_fr, description_en
  ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_vehicle_search_vector();

-- =============================================================================
-- 11. FONCTIONS ET TRIGGERS
-- =============================================================================

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-génération du slug SEO
CREATE OR REPLACE FUNCTION generate_vehicle_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug  TEXT;
  final_slug TEXT;
  counter    INT := 0;
BEGIN
  base_slug := lower(
    regexp_replace(
      unaccent(NEW.brand || '-' || NEW.model || '-' || NEW.year::TEXT),
      '[^a-z0-9]+', '-', 'g'
    )
  );
  base_slug  := trim(both '-' from base_slug);
  final_slug := base_slug;

  WHILE EXISTS (
    SELECT 1 FROM vehicles WHERE slug = final_slug AND id != NEW.id
  ) LOOP
    counter    := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_slug
  BEFORE INSERT OR UPDATE OF brand, model, year ON vehicles
  FOR EACH ROW EXECUTE FUNCTION generate_vehicle_slug();

-- published_at et sold_at automatiques
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'publie' AND OLD.status != 'publie' THEN
    NEW.published_at := NOW();
  END IF;
  IF NEW.status = 'vendu' AND OLD.status != 'vendu' THEN
    NEW.sold_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_published_at
  BEFORE UPDATE OF status ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- 1 seule photo primaire par véhicule
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE vehicle_photos
    SET is_primary = false
    WHERE vehicle_id = NEW.vehicle_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER single_primary_photo
  BEFORE INSERT OR UPDATE OF is_primary ON vehicle_photos
  FOR EACH ROW WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_photo();

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings   ENABLE ROW LEVEL SECURITY;

-- VEHICLES
CREATE POLICY "public_view_published" ON vehicles
  FOR SELECT USING (status = 'publie');

CREATE POLICY "auth_view_all" ON vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert" ON vehicles
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "admin_update_all" ON vehicles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  );

CREATE POLICY "admin_delete" ON vehicles
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- VEHICLE_PHOTOS
CREATE POLICY "public_view_photos" ON vehicle_photos
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND status = 'publie'));

CREATE POLICY "auth_view_all_photos" ON vehicle_photos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_manage_photos" ON vehicle_photos
  FOR ALL TO authenticated USING (true);

-- VEHICLE_FEATURES
CREATE POLICY "public_view_features" ON vehicle_features
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM vehicles WHERE id = vehicle_id AND status = 'publie'));

CREATE POLICY "auth_manage_features" ON vehicle_features
  FOR ALL TO authenticated USING (true);

-- CONTACT_MESSAGES
CREATE POLICY "public_insert_message" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_view_messages" ON contact_messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_update_messages" ON contact_messages
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- PROFILES
CREATE POLICY "self_view" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "admin_view_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_manage_profiles" ON profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SITE_SETTINGS
CREATE POLICY "public_read_settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_settings" ON site_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- 13. STORAGE BUCKET (à configurer dans Supabase Dashboard > Storage)
-- =============================================================================
-- Créer manuellement le bucket "vehicle-photos" avec :
--   public          = true
--   file size limit = 15 MB  (15728640 bytes)
--   allowed MIME    = image/jpeg, image/png, image/webp, image/heic

-- Policies Storage (à exécuter après création du bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-photos',
  'vehicle-photos',
  true,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_view_vehicle_photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'vehicle-photos');

CREATE POLICY "auth_upload_vehicle_photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vehicle-photos');

CREATE POLICY "auth_update_vehicle_photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'vehicle-photos');

CREATE POLICY "auth_delete_vehicle_photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vehicle-photos');

-- =============================================================================
-- 14. TRIGGER NOUVEAU USER → PROFILE AUTO
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'collaborateur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 15. VUE UTILITAIRE : vehicles_with_cover
-- =============================================================================
CREATE OR REPLACE VIEW vehicles_with_cover AS
SELECT
  v.*,
  p.url           AS cover_url,
  p.storage_path  AS cover_storage_path
FROM vehicles v
LEFT JOIN vehicle_photos p
  ON p.vehicle_id = v.id AND p.is_primary = true;

-- =============================================================================
-- VÉRIFICATION FINALE
-- =============================================================================
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
