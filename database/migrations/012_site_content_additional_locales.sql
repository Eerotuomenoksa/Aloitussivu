-- Aloitussivu / MariaDB 12
-- Laajentaa ylläpidettävät sivutekstit kaikkiin etusivun käyttöliittymäkieliin.

START TRANSACTION;

-- DDL is not transactional in MariaDB. The target definition is safe to apply
-- again after an interrupted migration.
ALTER TABLE site_content
  MODIFY COLUMN locale ENUM('fi', 'sv', 'en', 'se', 'uk', 'et', 'ru') NOT NULL;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('012_site_content_additional_locales');

COMMIT;
