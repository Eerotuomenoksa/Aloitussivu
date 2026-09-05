-- Aloitussivu / MariaDB 12
-- Ylläpidosta muokattavat julkiset sivu- ja käyttöliittymätekstit.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS site_content (
  content_key VARCHAR(100) NOT NULL,
  locale ENUM('fi', 'sv', 'en', 'se', 'uk', 'et', 'ru') NOT NULL,
  value LONGTEXT NOT NULL,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  updated_by VARCHAR(128) NULL,
  PRIMARY KEY (content_key, locale),
  KEY idx_site_content_updated (updated_at),
  CONSTRAINT fk_site_content_updated_by
    FOREIGN KEY (updated_by) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('011_site_content_editor');

COMMIT;
