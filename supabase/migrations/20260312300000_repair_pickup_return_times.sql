-- =============================================================================
-- Repair: Ensure pickup_time and return_time columns exist on rentals
-- (Previous migration may have been recorded without applying)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rentals' AND column_name = 'pickup_time'
  ) THEN
    ALTER TABLE rentals ADD COLUMN pickup_time TIME NOT NULL DEFAULT '09:00';
    COMMENT ON COLUMN rentals.pickup_time IS 'Heure de prise en charge du véhicule';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rentals' AND column_name = 'return_time'
  ) THEN
    ALTER TABLE rentals ADD COLUMN return_time TIME NOT NULL DEFAULT '18:00';
    COMMENT ON COLUMN rentals.return_time IS 'Heure de restitution du véhicule';
  END IF;
END;
$$;
