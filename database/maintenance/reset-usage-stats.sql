-- Kavijatilastojen nollaus ennen julkaisua
--
-- Tyhjentaa NELJA kayttolukutaulua. Ei koske palautteisiin, linkkeihin,
-- yllapitajiin, huijausvaroituksiin eika audit-lokiin.
--
-- Aja VASTA kun tietokannasta on otettu vedos (ks. database/maintenance/README.md).
-- Tauluilla ei ole viiteavaimia muihin tauluihin, joten poisto on turvallinen.

START TRANSACTION;

DELETE FROM usage_daily;
DELETE FROM usage_page_daily;
DELETE FROM usage_link_daily;
DELETE FROM usage_context_daily;

COMMIT;

-- Varmennus: jokaisen pitaa palauttaa 0.
SELECT 'usage_daily' AS taulu, COUNT(*) AS rivit FROM usage_daily
UNION ALL SELECT 'usage_page_daily', COUNT(*) FROM usage_page_daily
UNION ALL SELECT 'usage_link_daily', COUNT(*) FROM usage_link_daily
UNION ALL SELECT 'usage_context_daily', COUNT(*) FROM usage_context_daily;
