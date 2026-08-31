-- Aloitussivu / MariaDB 12
-- Yllapitajan linkkihuomioiden kasittely: varmennukset ja maaritetyt poikkeukset.
-- Tehtavat LC-05 ja LC-10.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS link_check_overrides (
  id CHAR(36) NOT NULL,
  url_hash CHAR(64) NOT NULL,
  status ENUM('verified', 'exception', 'needs_review', 'retired') NOT NULL,
  scope ENUM('all', 'bot_protection', 'redirect') NOT NULL,
  reason VARCHAR(1000) NOT NULL,
  expected_final_url VARCHAR(2048) NULL,
  verified_at DATETIME(6) NOT NULL,
  next_review_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by VARCHAR(128) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_link_check_overrides_target (url_hash),
  KEY idx_link_check_overrides_review (status, next_review_at),
  KEY idx_link_check_overrides_created_by (created_by),
  CONSTRAINT fk_link_check_overrides_target
    FOREIGN KEY (url_hash) REFERENCES link_check_targets (url_hash)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_link_check_overrides_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('007_link_check_admin_actions');

COMMIT;
