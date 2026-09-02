-- Aloitussivu / MariaDB 12
-- Initial P1 schema. Apply with a migration-capable administration account.
-- The API runtime account must not receive CREATE, ALTER, DROP, or GRANT privileges.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(64) NOT NULL,
  applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  firebase_uid VARCHAR(128) NOT NULL,
  email VARCHAR(320) NOT NULL,
  role ENUM('admin', 'editor', 'viewer') NOT NULL DEFAULT 'viewer',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (firebase_uid),
  UNIQUE KEY uq_admin_users_email (email),
  KEY idx_admin_users_active_role (active, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_items (
  id CHAR(36) NOT NULL,
  type ENUM('bug', 'content', 'link', 'accessibility', 'idea', 'other') NOT NULL,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  page VARCHAR(120) NOT NULL,
  status ENUM('new', 'triage', 'planned', 'in_progress', 'done', 'rejected') NOT NULL DEFAULT 'new',
  public_note TEXT NOT NULL,
  client_json JSON NULL,
  has_screenshot TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  handled_at DATETIME(6) NULL,
  handled_by VARCHAR(128) NULL,
  PRIMARY KEY (id),
  KEY idx_feedback_items_status_updated (status, updated_at),
  KEY idx_feedback_items_created (created_at),
  CONSTRAINT fk_feedback_items_handled_by
    FOREIGN KEY (handled_by) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedback_attachments (
  id CHAR(36) NOT NULL,
  feedback_id CHAR(36) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  media_type VARCHAR(100) NOT NULL,
  byte_size INT UNSIGNED NOT NULL,
  sha256 BINARY(32) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_attachments_feedback (feedback_id),
  UNIQUE KEY uq_feedback_attachments_storage_key (storage_key),
  KEY idx_feedback_attachments_created (created_at),
  CONSTRAINT fk_feedback_attachments_feedback
    FOREIGN KEY (feedback_id) REFERENCES feedback_items (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS test_feedback_responses (
  id CHAR(36) NOT NULL,
  form_version VARCHAR(80) NOT NULL,
  response_json JSON NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_test_feedback_responses_created (created_at),
  KEY idx_test_feedback_responses_form_version (form_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS link_reports (
  id CHAR(36) NOT NULL,
  type ENUM('new', 'broken', 'wrong') NOT NULL,
  name VARCHAR(160) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  url_hash BINARY(32) NOT NULL,
  category VARCHAR(255) NULL,
  source VARCHAR(255) NULL,
  note TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  review_reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  reviewed_at DATETIME(6) NULL,
  reviewed_by VARCHAR(128) NULL,
  approved_link_id CHAR(36) NULL,
  PRIMARY KEY (id),
  KEY idx_link_reports_status_created (status, created_at),
  KEY idx_link_reports_url_hash (url_hash),
  KEY idx_link_reports_reviewed_by (reviewed_by),
  KEY idx_link_reports_approved_link (approved_link_id),
  CONSTRAINT fk_link_reports_reviewed_by
    FOREIGN KEY (reviewed_by) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS approved_links (
  id CHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  url_hash BINARY(32) NOT NULL,
  category VARCHAR(255) NOT NULL,
  municipality VARCHAR(100) NULL,
  source VARCHAR(255) NOT NULL,
  note TEXT NULL,
  created_from_report_id CHAR(36) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_approved_links_url_hash (url_hash),
  KEY idx_approved_links_category_created (category, created_at),
  KEY idx_approved_links_municipality_created (municipality, created_at),
  KEY idx_approved_links_source_report (created_from_report_id),
  CONSTRAINT fk_approved_links_source_report
    FOREIGN KEY (created_from_report_id) REFERENCES link_reports (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blocked_links (
  id CHAR(36) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  url_hash BINARY(32) NOT NULL,
  reason VARCHAR(1000) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_by VARCHAR(128) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_blocked_links_url_hash (url_hash),
  KEY idx_blocked_links_created (created_at),
  CONSTRAINT fk_blocked_links_created_by
    FOREIGN KEY (created_by) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS scam_alerts (
  id CHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  severity ENUM('info', 'warning', 'danger') NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  source VARCHAR(255) NULL,
  source_url VARCHAR(2048) NULL,
  source_week VARCHAR(100) NULL,
  original_heading VARCHAR(500) NULL,
  structure_version ENUM('2026', '2025', 'news', 'unknown') NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  expires_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_scam_alerts_public (active, expires_at, created_at),
  KEY idx_scam_alerts_source_week (source_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ncsc_scrape_logs (
  id CHAR(36) NOT NULL,
  source_url VARCHAR(2048) NOT NULL,
  week_label VARCHAR(100) NOT NULL,
  published_at DATETIME(6) NULL,
  processed_at DATETIME(6) NOT NULL,
  alerts_created SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  structure_version ENUM('2026', '2025', 'news', 'unknown') NOT NULL,
  message VARCHAR(1000) NULL,
  PRIMARY KEY (id),
  KEY idx_ncsc_scrape_logs_processed (processed_at),
  KEY idx_ncsc_scrape_logs_week (week_label)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usage_daily (
  usage_date DATE NOT NULL,
  total_pageviews INT UNSIGNED NOT NULL DEFAULT 0,
  total_link_clicks INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (usage_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usage_page_daily (
  usage_date DATE NOT NULL,
  page_hash BINARY(32) NOT NULL,
  page VARCHAR(180) NOT NULL,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (usage_date, page_hash),
  KEY idx_usage_page_daily_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usage_link_daily (
  usage_date DATE NOT NULL,
  link_hash BINARY(32) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  label VARCHAR(180) NOT NULL,
  category VARCHAR(180) NOT NULL,
  page VARCHAR(180) NOT NULL,
  count INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (usage_date, link_hash),
  KEY idx_usage_link_daily_page (page)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  bucket_hash BINARY(32) NOT NULL,
  route VARCHAR(120) NOT NULL,
  window_started_at DATETIME(6) NOT NULL,
  request_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME(6) NOT NULL,
  PRIMARY KEY (bucket_hash, route, window_started_at),
  KEY idx_rate_limit_buckets_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id CHAR(36) NOT NULL,
  actor_firebase_uid VARCHAR(128) NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(120) NOT NULL,
  target_id VARCHAR(128) NOT NULL,
  metadata_json JSON NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_audit_log_target (target_type, target_id, created_at),
  KEY idx_audit_log_actor_created (actor_firebase_uid, created_at),
  CONSTRAINT fk_audit_log_actor
    FOREIGN KEY (actor_firebase_uid) REFERENCES admin_users (firebase_uid)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO schema_migrations (version) VALUES ('001_initial_schema');
