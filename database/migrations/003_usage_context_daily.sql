START TRANSACTION;

CREATE TABLE IF NOT EXISTS usage_context_daily (
  usage_date DATE NOT NULL,
  dimension VARCHAR(24) NOT NULL,
  bucket VARCHAR(32) NOT NULL,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (usage_date, dimension, bucket)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version)
VALUES ('003_usage_context_daily');

COMMIT;
