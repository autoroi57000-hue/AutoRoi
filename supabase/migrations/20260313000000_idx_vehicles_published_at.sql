-- Index partiel pour accélérer les requêtes de véhicules publiés triés par date
CREATE INDEX IF NOT EXISTS idx_vehicles_published_at
  ON vehicles(published_at DESC)
  WHERE status = 'publie';
