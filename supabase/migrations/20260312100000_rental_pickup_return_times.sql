-- =============================================================================
-- Migration : Ajout heures de prise en charge et restitution
-- =============================================================================

-- Ajouter les colonnes pickup_time et return_time
ALTER TABLE rentals
  ADD COLUMN IF NOT EXISTS pickup_time  TIME NOT NULL DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS return_time  TIME NOT NULL DEFAULT '18:00';

COMMENT ON COLUMN rentals.pickup_time IS 'Heure de prise en charge du véhicule';
COMMENT ON COLUMN rentals.return_time IS 'Heure de restitution du véhicule';

-- Recréer la fonction de vérification de disponibilité
-- pour prendre en compte les heures (date + time combinés)
CREATE OR REPLACE FUNCTION check_rental_availability(
  p_vehicle_id UUID,
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ,
  p_exclude_rental_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM rentals
    WHERE rental_vehicle_id = p_vehicle_id
      AND status NOT IN ('cancelled', 'no_show', 'completed')
      AND id IS DISTINCT FROM p_exclude_rental_id
      AND (
        (start_date + pickup_time, end_date + return_time)
        OVERLAPS
        (p_start, p_end)
      )
  );
END;
$$;
