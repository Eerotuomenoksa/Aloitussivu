-- Aloitussivu / MariaDB 12
-- Tallentaa ylläpidossa vaihdetun linkin alkuperäisen osoitteen ja korjaa
-- hyväksytyn Bluesky-linkin kirjoitusasun.

START TRANSACTION;

-- DDL is not transactional in MariaDB. IF NOT EXISTS makes a rerun safe after
-- an interrupted migration.
ALTER TABLE approved_links
  ADD COLUMN IF NOT EXISTS replaces_url VARCHAR(2048) NULL AFTER url_hash,
  ADD COLUMN IF NOT EXISTS replaces_url_hash BINARY(32) NULL AFTER replaces_url,
  ADD KEY IF NOT EXISTS idx_approved_links_replaces_url_hash (replaces_url_hash);

UPDATE approved_links
SET name = 'Bluesky', updated_at = CURRENT_TIMESTAMP(6)
WHERE url = 'https://bsky.social' AND LOWER(TRIM(name)) = 'blusky';

INSERT IGNORE INTO schema_migrations (version)
VALUES ('010_link_content_corrections');

COMMIT;
