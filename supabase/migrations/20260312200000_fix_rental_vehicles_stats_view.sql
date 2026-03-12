-- =============================================================================
-- FIX: rental_vehicles_with_stats view
-- Problème : la vue ne fournissait que active_reservations_count
-- Le frontend utilisait total_rentals et active_rentals (inexistants) → toujours 0
--
-- Changements :
-- 1. Ajout total_rentals_count (TOUTES les réservations, tous statuts)
-- 2. Ajout has_upcoming_48h (réservation démarrant dans < 48h)
-- 3. Ajout is_rented_today (réservation active chevauchant aujourd'hui)
-- 4. Conservation de active_reservations_count et next_available_after
-- =============================================================================

DROP VIEW IF EXISTS rental_vehicles_with_stats;

CREATE VIEW rental_vehicles_with_stats AS
SELECT
  rv.*,

  -- Nombre TOTAL de réservations (tous statuts confondus)
  COUNT(r.id) AS total_rentals_count,

  -- Nombre de réservations actives (non terminées, non annulées)
  COUNT(r.id) FILTER (
    WHERE r.status NOT IN ('cancelled', 'no_show', 'completed')
  ) AS active_reservations_count,

  -- Prochaine date de disponibilité (fin de la dernière réservation active)
  MAX(r.end_date) FILTER (
    WHERE r.status NOT IN ('cancelled', 'no_show', 'completed')
  ) AS next_available_after,

  -- Réservation démarrant dans moins de 48h (non annulée)
  BOOL_OR(
    r.start_date <= (NOW() + INTERVAL '48 hours')
    AND r.start_date >= NOW()::date
    AND r.status NOT IN ('cancelled', 'no_show', 'completed')
  ) AS has_upcoming_48h,

  -- Véhicule actuellement en location (réservation active chevauchant aujourd'hui)
  BOOL_OR(
    r.start_date <= NOW()::date + 1
    AND r.end_date >= NOW()::date
    AND r.status IN ('in_progress', 'confirmed', 'deposit_paid')
  ) AS is_rented_today

FROM rental_vehicles rv
LEFT JOIN rentals r ON r.rental_vehicle_id = rv.id
GROUP BY rv.id;

COMMENT ON VIEW rental_vehicles_with_stats IS
  'Vue enrichie rental_vehicles : total résa, résa actives, prochaine dispo, départ imminent, loué aujourd''hui.';
