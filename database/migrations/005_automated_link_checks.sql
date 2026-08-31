-- Aloitussivu / MariaDB 12
-- Batched, persistent HTTPS link checks and operator-visible run history.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS link_check_catalogs (
  catalog_id TINYINT UNSIGNED NOT NULL,
  checksum CHAR(64) NOT NULL,
  source_count INT UNSIGNED NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  PRIMARY KEY (catalog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS link_check_targets (
  url_hash CHAR(64) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(255) NOT NULL,
  source VARCHAR(255) NOT NULL,
  catalog_active TINYINT(1) NOT NULL DEFAULT 0,
  approved_active TINYINT(1) NOT NULL DEFAULT 0,
  last_checked_at DATETIME(6) NULL,
  next_check_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  last_status ENUM('pending', 'ok', 'warning', 'failed', 'rejected') NOT NULL DEFAULT 'pending',
  http_status SMALLINT UNSIGNED NULL,
  final_url VARCHAR(2048) NULL,
  failure_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  last_error_code VARCHAR(80) NULL,
  response_ms INT UNSIGNED NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (url_hash),
  KEY idx_link_check_due (catalog_active, approved_active, next_check_at),
  KEY idx_link_check_attention (last_status, failure_count, last_checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS link_check_runs (
  id CHAR(36) NOT NULL,
  started_at DATETIME(6) NOT NULL,
  finished_at DATETIME(6) NULL,
  status ENUM('running', 'completed', 'failed', 'skipped') NOT NULL,
  catalog_count INT UNSIGNED NOT NULL DEFAULT 0,
  approved_count INT UNSIGNED NOT NULL DEFAULT 0,
  checked_count INT UNSIGNED NOT NULL DEFAULT 0,
  ok_count INT UNSIGNED NOT NULL DEFAULT 0,
  warning_count INT UNSIGNED NOT NULL DEFAULT 0,
  failed_count INT UNSIGNED NOT NULL DEFAULT 0,
  rejected_count INT UNSIGNED NOT NULL DEFAULT 0,
  history_deleted INT UNSIGNED NOT NULL DEFAULT 0,
  message_code VARCHAR(80) NULL,
  PRIMARY KEY (id),
  KEY idx_link_check_runs_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS link_check_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  run_id CHAR(36) NOT NULL,
  url_hash CHAR(64) NOT NULL,
  checked_at DATETIME(6) NOT NULL,
  status ENUM('ok', 'warning', 'failed', 'rejected') NOT NULL,
  http_status SMALLINT UNSIGNED NULL,
  final_url VARCHAR(2048) NULL,
  error_code VARCHAR(80) NULL,
  response_ms INT UNSIGNED NULL,
  consecutive_failures SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_link_check_results_target (url_hash, checked_at),
  KEY idx_link_check_results_run (run_id),
  KEY idx_link_check_results_checked (checked_at),
  CONSTRAINT fk_link_check_result_run FOREIGN KEY (run_id) REFERENCES link_check_runs (id) ON DELETE CASCADE,
  CONSTRAINT fk_link_check_result_target FOREIGN KEY (url_hash) REFERENCES link_check_targets (url_hash) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MariaDB commits DDL implicitly. INSERT IGNORE makes a safe verification rerun
-- possible when all tables were created but the migration marker already exists.
INSERT IGNORE INTO schema_migrations (version)
VALUES ('005_automated_link_checks');

COMMIT;
