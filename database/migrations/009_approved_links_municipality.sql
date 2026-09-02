-- Aloitussivu / MariaDB 12
-- Hyväksytyn linkin valinnainen kunta. Tyhjä arvo tarkoittaa valtakunnallista linkkiä.

START TRANSACTION;

-- DDL is not transactional in MariaDB. IF NOT EXISTS makes a rerun safe after
-- an interrupted migration.
ALTER TABLE approved_links
  ADD COLUMN IF NOT EXISTS municipality VARCHAR(100) NULL AFTER category,
  ADD KEY IF NOT EXISTS idx_approved_links_municipality_created (municipality, created_at);

INSERT IGNORE INTO schema_migrations (version)
VALUES ('009_approved_links_municipality');

COMMIT;
