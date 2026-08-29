-- Aloitussivu / MariaDB 12
-- Idempotent outbox for maintenance notifications and aggregate usage reports.
-- The recipient address and SMTP credentials stay in the private API configuration.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS email_outbox (
  id CHAR(36) NOT NULL,
  message_type ENUM('maintenance_digest', 'monthly_report', 'quarterly_report') NOT NULL,
  period_key VARCHAR(32) NOT NULL,
  recipient_alias VARCHAR(32) NOT NULL DEFAULT 'primary',
  subject VARCHAR(200) NOT NULL,
  text_body MEDIUMTEXT NOT NULL,
  html_body MEDIUMTEXT NOT NULL,
  status ENUM('pending', 'sending', 'retry', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  attempt_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  next_attempt_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  last_error_code VARCHAR(80) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  sent_at DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_outbox_period_recipient (message_type, period_key, recipient_alias),
  KEY idx_email_outbox_dispatch (status, next_attempt_at),
  KEY idx_email_outbox_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version)
VALUES ('004_email_notifications');

COMMIT;
