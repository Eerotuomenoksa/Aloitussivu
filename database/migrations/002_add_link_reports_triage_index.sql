-- Aloitussivu / MariaDB 12
-- Supports filtering and chronological triage of link reports by status and type.
-- Apply once with a migration-capable administration account.

SET NAMES utf8mb4;
SET time_zone = '+00:00';

ALTER TABLE link_reports
  ADD KEY idx_link_reports_status_type_created (status, type, created_at);

INSERT INTO schema_migrations (version)
VALUES ('002_add_link_reports_triage_index');
