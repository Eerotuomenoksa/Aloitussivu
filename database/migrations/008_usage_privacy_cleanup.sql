-- Aloitussivu / MariaDB 12
-- E-02: poista vanhat tunti- ja kampanjalähdebucketit sekä
-- yhdistä vanhat yksittäiset linkkirivit vain osio- ja kategoriatasolle.

START TRANSACTION;

DELETE FROM usage_context_daily
WHERE dimension IN ('hour', 'src');

CREATE TEMPORARY TABLE usage_link_daily_privacy (
  usage_date DATE NOT NULL,
  link_hash BINARY(32) NOT NULL,
  category VARCHAR(180) NOT NULL,
  page VARCHAR(180) NOT NULL,
  count INT UNSIGNED NOT NULL,
  PRIMARY KEY (usage_date, link_hash)
) ENGINE=InnoDB;

INSERT INTO usage_link_daily_privacy (usage_date, link_hash, category, page, count)
SELECT
  usage_date,
  UNHEX(SHA2(CONCAT(page, CHAR(10), category), 256)),
  category,
  page,
  SUM(count)
FROM usage_link_daily
GROUP BY usage_date, page, category;

DELETE FROM usage_link_daily;

INSERT INTO usage_link_daily (usage_date, link_hash, url, label, category, page, count)
SELECT usage_date, link_hash, '', '', category, page, count
FROM usage_link_daily_privacy;

DROP TEMPORARY TABLE usage_link_daily_privacy;

INSERT IGNORE INTO schema_migrations (version)
VALUES ('008_usage_privacy_cleanup');

COMMIT;
