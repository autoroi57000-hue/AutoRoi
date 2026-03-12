-- Migration: Compléter site_settings avec toutes les clés requises
-- Safe: ON CONFLICT DO NOTHING — ne modifie aucune valeur existante

-- Créer la table si elle n'existe pas encore (schema initial peut l'avoir déjà)
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value, description) VALUES

-- Contact
('email_public',          'contact@autoroi.fr',           'Email affiché publiquement (footer, page contact)'),
('email_notifications',   'auto.roi57000@gmail.com',      'Email qui reçoit les notifications admin'),
('opening_hours',         'Lun-Sam 9h-19h, Dim sur RDV',  'Horaires affichés sur la page contact'),
('email_sender_domain',   'autoroi.fr',                   'Domaine expéditeur Resend (noreply@[domaine])'),

-- Contenu
('slogan_fr',             'Votre partenaire automobile premium', 'Slogan FR (footer, hero)'),
('slogan_en',             'Your premium automotive partner',     'Slogan EN (footer, hero)'),
('about_text_fr',         '',                             'Texte à propos FR'),
('about_text_en',         '',                             'Texte à propos EN'),

-- Réseaux sociaux
('facebook_url',          '',  'URL page Facebook (vide = masqué)'),
('instagram_url',         '',  'URL profil Instagram (vide = masqué)'),
('snapchat_url',          '',  'URL profil Snapchat (vide = masqué)'),
('tiktok_url',            '',  'URL profil TikTok (vide = masqué)'),
('youtube_url',           '',  'URL chaîne YouTube (vide = masqué)'),

-- WhatsApp messages localisés
('whatsapp_message_fr',   'Bonjour, je suis intéressé(e) par un véhicule sur Auto Roi.', 'Message WhatsApp FR'),
('whatsapp_message_en',   'Hello, I am interested in a vehicle on Auto Roi.',             'Message WhatsApp EN'),
('whatsapp_tooltip_fr',   'Comment pouvons-nous vous aider ?',  'Tooltip bouton WhatsApp FR'),
('whatsapp_tooltip_en',   'How can we help you?',               'Tooltip bouton WhatsApp EN'),
('whatsapp_subtitle_fr',  'Notre équipe vous répond sous 24h.', 'Sous-titre bouton WhatsApp FR'),
('whatsapp_subtitle_en',  'Our team responds within 24h.',      'Sous-titre bouton WhatsApp EN'),

-- Mentions légales
('legal_entity_name',     '',  'Nom du responsable légal / éditeur'),
('legal_siret',           '',  'Numéro SIRET'),
('legal_capital',         '',  'Capital social'),
('legal_form',            '',  'Forme juridique (SAS, SARL, EI...)'),
('legal_address',         '',  'Adresse siège social complète'),
('legal_host_name',       'Vercel Inc.',         'Hébergeur — nom'),
('legal_host_address',    '440 N Barranca Ave #4133, Covina, CA 91723, USA', 'Hébergeur — adresse'),

-- Affichage catalogue
('vehicles_per_page',     '12',     'Nombre de véhicules par page'),
('show_view_count',       'true',   'Afficher le compteur de vues sur les fiches'),
('default_sort',          'newest', 'Tri par défaut du catalogue'),
('admin_welcome_message', '',       'Message d accueil dashboard admin')

ON CONFLICT (key) DO NOTHING;
