-- Aloitussivu / MariaDB 12
-- Automaattinen piilotus, mukautuva tarkistusvali ja uudelleenohjauksen verkkotunnusmuutos.
-- Tehtavat LC-02, LC-03, LC-07, LC-09.

START TRANSACTION;

-- LC-03: tarkistusvali opitaan havainnoista, ei luokitella kasin.
ALTER TABLE link_check_targets
  ADD COLUMN IF NOT EXISTS check_interval_hours SMALLINT UNSIGNED NOT NULL DEFAULT 72 AFTER next_check_at,
  -- LC-07: uudelleenohjauksen rekisteroitava verkkotunnus verrattuna alkuperaiseen.
  ADD COLUMN IF NOT EXISTS final_domain_changed TINYINT(1) NOT NULL DEFAULT 0 AFTER final_url,
  -- LC-02: automaatin tekema esto kirjataan myos kohteeseen, jotta se voidaan perua.
  ADD COLUMN IF NOT EXISTS auto_blocked_at DATETIME(6) NULL AFTER final_domain_changed;

-- LC-02 ja LC-09: ajokohtaiset laskurit nakyviin yllapitoon.
ALTER TABLE link_check_runs
  ADD COLUMN IF NOT EXISTS blocked_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER rejected_count,
  ADD COLUMN IF NOT EXISTS unblocked_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER blocked_count;

-- DDL is not transactional in MariaDB. Every ADD COLUMN and the marker write are
-- therefore idempotent so a partially completed migration can be rerun safely.
INSERT IGNORE INTO schema_migrations (version)
VALUES ('006_link_check_hardening');

COMMIT;
