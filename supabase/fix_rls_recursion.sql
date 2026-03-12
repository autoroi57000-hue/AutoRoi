-- =============================================================================
-- CORRECTION RLS PROFILES - Récursion infinie
-- =============================================================================

-- Supprimer les anciennes policies problématiques sur profiles
DROP POLICY IF EXISTS "self_view" ON profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_manage_profiles" ON profiles;

-- Créer une fonction pour vérifier le rôle sans récursion
-- Cette fonction utilise SECURITY DEFINER pour bypass RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER  -- ← Important : bypass RLS
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id;
  
  RETURN user_role;
END;
$$;

-- Recréer les policies corrigées sur profiles

-- 1. Chaque utilisateur peut voir SON propre profil
CREATE POLICY "self_view" ON profiles
  FOR SELECT TO authenticated 
  USING (id = auth.uid());

-- 2. Les admins peuvent voir TOUS les profils (sans récursion)
CREATE POLICY "admin_view_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- 3. Les admins peuvent tout modifier (sans récursion)
CREATE POLICY "admin_manage_profiles" ON profiles
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =============================================================================
-- CORRECTION AUTRES TABLES - Policies utilisant EXISTS(SELECT profiles...)
-- =============================================================================

-- VEHICLES - Mise à jour par admin
DROP POLICY IF EXISTS "admin_update_all" ON vehicles;
CREATE POLICY "admin_update_all" ON vehicles
  FOR UPDATE TO authenticated
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  );

-- VEHICLES - Suppression par admin  
DROP POLICY IF EXISTS "admin_delete" ON vehicles;
CREATE POLICY "admin_delete" ON vehicles
  FOR DELETE TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- CONTACT_MESSAGES - Vue par admin
DROP POLICY IF EXISTS "admin_view_messages" ON contact_messages;
CREATE POLICY "admin_view_messages" ON contact_messages
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- CONTACT_MESSAGES - Modification par admin
DROP POLICY IF EXISTS "admin_update_messages" ON contact_messages;
CREATE POLICY "admin_update_messages" ON contact_messages
  FOR UPDATE TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- SITE_SETTINGS - Gestion par admin
DROP POLICY IF EXISTS "admin_manage_settings" ON site_settings;
CREATE POLICY "admin_manage_settings" ON site_settings
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================
SELECT 'RLS policies corrigées avec succès' AS status;
