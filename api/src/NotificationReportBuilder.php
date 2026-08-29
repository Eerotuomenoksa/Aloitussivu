<?php

declare(strict_types=1);

namespace Aloitussivu\Api;

use DateTimeImmutable;
use DateTimeZone;

final class NotificationReportBuilder
{
    private const MONTHS = [
        1 => 'tammikuu',
        2 => 'helmikuu',
        3 => 'maaliskuu',
        4 => 'huhtikuu',
        5 => 'toukokuu',
        6 => 'kesäkuu',
        7 => 'heinäkuu',
        8 => 'elokuu',
        9 => 'syyskuu',
        10 => 'lokakuu',
        11 => 'marraskuu',
        12 => 'joulukuu',
    ];

    public function __construct(
        private readonly DatabaseConnection $database,
        private readonly Config $config,
    ) {
    }

    public function maintenanceDigest(DateTimeImmutable $now): ?MailMessage
    {
        $utcNow = $now->setTimezone(new DateTimeZone('UTC'));
        $row = $this->database->fetchOne(
            'SELECT '
            . "(SELECT COUNT(*) FROM feedback_items WHERE status IN ('new', 'triage', 'planned', 'in_progress')) AS feedback_open, "
            . "(SELECT MIN(created_at) FROM feedback_items WHERE status IN ('new', 'triage', 'planned', 'in_progress')) AS feedback_oldest, "
            . "(SELECT COUNT(*) FROM link_reports WHERE status = 'pending') AS links_pending, "
            . "(SELECT MIN(created_at) FROM link_reports WHERE status = 'pending') AS links_oldest, "
            . '(SELECT COUNT(*) FROM scam_alerts WHERE active = 1 AND expires_at >= :now '
            . 'AND expires_at < :expiry_limit) AS alerts_expiring, '
            . '(SELECT MAX(processed_at) FROM ncsc_scrape_logs) AS ncsc_last_run',
            [
                'now' => $utcNow->format('Y-m-d H:i:s.u'),
                'expiry_limit' => $utcNow->modify('+7 days')->format('Y-m-d H:i:s.u'),
            ],
        ) ?? [];

        $feedback = (int) ($row['feedback_open'] ?? 0);
        $links = (int) ($row['links_pending'] ?? 0);
        $alerts = (int) ($row['alerts_expiring'] ?? 0);
        $lastNcsc = $this->parseUtc($row['ncsc_last_run'] ?? null);
        $ncscStale = $lastNcsc === null || $lastNcsc < $utcNow->modify('-2 days');
        if ($feedback + $links + $alerts === 0 && !$ncscStale) {
            return null;
        }

        $feedbackAge = $this->oldestAgeDays($row['feedback_oldest'] ?? null, $utcNow);
        $linksAge = $this->oldestAgeDays($row['links_oldest'] ?? null, $utcNow);
        $attentionCount = ($feedback > 0 ? 1 : 0) + ($links > 0 ? 1 : 0) + ($alerts > 0 ? 1 : 0) + ($ncscStale ? 1 : 0);
        $items = [
            [
                'name' => 'Avoimet palautteet',
                'value' => (string) $feedback,
                'detail' => $feedbackAge === null ? 'Vanhimman palautteen ikää ei ole saatavilla.' : sprintf('Vanhin avoin palaute on %d vuorokautta vanha.', $feedbackAge),
                'explanation' => 'Palautteet, joiden käsittely on kesken: tila on uusi, arvioitavana, suunniteltu tai työn alla.',
                'attention' => $feedback > 0,
            ],
            [
                'name' => 'Odottavat linkki-ilmoitukset',
                'value' => (string) $links,
                'detail' => $linksAge === null ? 'Vanhimman ilmoituksen ikää ei ole saatavilla.' : sprintf('Vanhin odottava ilmoitus on %d vuorokautta vanha.', $linksAge),
                'explanation' => 'Käyttäjien ilmoittamat uudet, rikkinäiset tai väärään paikkaan vievät linkit, joita ylläpito ei ole vielä hyväksynyt tai hylännyt.',
                'attention' => $links > 0,
            ],
            [
                'name' => 'Pian vanhenevat huijausvaroitukset',
                'value' => (string) $alerts,
                'detail' => 'Mukana ovat aktiiviset varoitukset, joiden voimassaolo päättyy seuraavan seitsemän vuorokauden aikana.',
                'explanation' => 'Tarkista, pitääkö varoituksen voimassaoloa jatkaa vai voiko sen antaa poistua näkyvistä.',
                'attention' => $alerts > 0,
            ],
            [
                'name' => 'NCSC-päivitys',
                'value' => $ncscStale ? 'Tarkista' : 'Kunnossa',
                'detail' => $ncscStale
                    ? 'Viimeisimmästä kirjatusta ajosta on yli kaksi vuorokautta tai ajohistoria puuttuu.'
                    : 'Viimeisin kirjaus ' . $lastNcsc?->setTimezone(new DateTimeZone('Europe/Helsinki'))->format('d.m.Y H.i') . '.',
                'explanation' => 'Tausta-ajo hakee Kyberturvallisuuskeskuksen tuoreita huijausvaroituksia Aloitussivulle.',
                'attention' => $ncscStale,
            ],
        ];
        $adminUrl = $this->adminUrl();
        $subject = sprintf('[Aloitussivu] Ylläpitokooste %s', $now->setTimezone(new DateTimeZone('Europe/Helsinki'))->format('d.m.Y'));
        $textItems = array_map(static fn (array $item): string => sprintf(
            "%s: %s\n  %s\n  Mitä tämä tarkoittaa: %s",
            $item['name'],
            $item['value'],
            $item['detail'],
            $item['explanation'],
        ), $items);
        $text = "SENIORIN ALOITUSSIVU – YLLÄPITOKOOSTE\n\n"
            . sprintf("%d kohtaa vaatii huomiota. Alla näkyy, mitä luvut tarkoittavat ja mitä kannattaa tarkistaa.\n\n", $attentionCount)
            . implode("\n\n", $textItems)
            . "\n\nAvaa ylläpito: {$adminUrl}"
            . "\n\nTietosuoja: viestissä on vain lukumääriä ja aikaleimoja. Käyttäjien palautetekstejä, linkki-ilmoitusten huomioita tai liitteitä ei lähetetä sähköpostiin.";
        $htmlItems = array_map(fn (array $item): string => $this->maintenanceCard($item), $items);
        $html = $this->htmlDocument(
            'Seniorin aloitussivun ylläpitokooste',
            '<p style="font-size:18px;line-height:1.5;margin:0 0 8px;color:#173b49"><strong>'
            . $attentionCount . ' kohtaa vaatii huomiota.</strong></p>'
            . '<p style="margin:0 0 24px;color:#526773">Alla näkyy, mitä luvut tarkoittavat ja mitä ylläpidossa kannattaa tarkistaa.</p>'
            . implode('', $htmlItems)
            . $this->button($adminUrl, 'Avaa ylläpidon työtila')
            . $this->informationBox(
                'Tietosuoja',
                'Viestissä on vain lukumääriä ja aikaleimoja. Käyttäjien palautetekstejä, linkki-ilmoitusten huomioita tai liitteitä ei lähetetä sähköpostiin.',
            ),
            sprintf('%d ylläpidon kohtaa vaatii huomiota.', $attentionCount),
        );
        return new MailMessage($subject, $text, $html);
    }

    public function monthlyReport(DateTimeImmutable $monthStart): MailMessage
    {
        $localStart = $monthStart->setTimezone(new DateTimeZone('Europe/Helsinki'))->modify('first day of this month')->setTime(0, 0);
        $end = $localStart->modify('+1 month');
        $previousStart = $localStart->modify('-1 month');
        $label = self::MONTHS[(int) $localStart->format('n')] . ' ' . $localStart->format('Y');
        return $this->usageReport('Kuukausiraportti', $label, $localStart, $end, $previousStart, $localStart, false);
    }

    public function quarterlyReport(DateTimeImmutable $quarterStart): MailMessage
    {
        $localStart = $quarterStart->setTimezone(new DateTimeZone('Europe/Helsinki'))->setTime(0, 0);
        $end = $localStart->modify('+3 months');
        $previousStart = $localStart->modify('-3 months');
        $quarter = intdiv((int) $localStart->format('n') - 1, 3) + 1;
        $label = sprintf('Q%d/%s', $quarter, $localStart->format('Y'));
        return $this->usageReport('Kvartaaliraportti', $label, $localStart, $end, $previousStart, $localStart, true);
    }

    private function usageReport(
        string $reportName,
        string $label,
        DateTimeImmutable $start,
        DateTimeImmutable $end,
        DateTimeImmutable $previousStart,
        DateTimeImmutable $previousEnd,
        bool $includeTrend,
    ): MailMessage {
        $current = $this->periodStats($start, $end, true, $includeTrend);
        $previous = $this->periodStats($previousStart, $previousEnd, false, false);
        $metricGroups = [
            [
                'title' => 'Sivuston käyttö',
                'description' => 'Näistä luvuista näet, kuinka paljon sivustoa ja sen palvelulinkkejä käytettiin raportointijaksolla.',
                'metrics' => [
                    $this->metric(
                        'Sivulataukset',
                        $current['pageviews'],
                        $previous['pageviews'],
                        'Sivujen rekisteröidyt latauskerrat. Sama kävijä voi ladata sivun useita kertoja, joten luku ei tarkoita eri käyttäjien määrää.',
                    ),
                    $this->metric(
                        'Linkkien avaukset',
                        $current['link_clicks'],
                        $previous['link_clicks'],
                        'Aloitussivun palvelulinkkien rekisteröidyt avauskerrat. Saman linkin toistuvat avaukset lasketaan mukaan.',
                    ),
                    $this->metric(
                        'Suoran avauksen osuus',
                        $this->percent($current['direct'], $current['entry_total']),
                        $this->percent($previous['direct'], $previous['entry_total']),
                        'Osuus sivuavauksista, joissa selain ei ilmoittanut edeltävää sivua. Luku on suuntaa antava, eikä se yksin todista sivun olevan selaimen aloitussivu.',
                        true,
                    ),
                ],
            ],
            [
                'title' => 'Aloitussivuopas',
                'description' => 'Luvut kertovat, miten selaimen aloitussivuksi asettamisen ohjetta käytettiin.',
                'metrics' => [
                    $this->metric(
                        'Ohje avattu',
                        $current['guide_opened'],
                        $previous['guide_opened'],
                        'Kerrat, jolloin käyttäjä avasi aloitussivuksi asettamisen ohjeen.',
                    ),
                    $this->metric(
                        'Ohje suoritettu',
                        $current['guide_done'],
                        $previous['guide_done'],
                        'Kerrat, jolloin käyttäjä eteni ohjeen valmiiksi merkittyyn vaiheeseen.',
                    ),
                    $this->metric(
                        'Ohjeen suoritusaste',
                        $this->percent($current['guide_done'], $current['guide_opened']),
                        $this->percent($previous['guide_done'], $previous['guide_opened']),
                        'Valmiiksi merkittyjen suoritusten suhde ohjeen avauksiin. Kyse on tapahtumien suhteesta, ei yksilöityjen käyttäjien osuudesta.',
                        true,
                    ),
                    $this->metric(
                        'Ohje jaettu',
                        $current['guide_shared'],
                        $previous['guide_shared'],
                        'Kerrat, jolloin ohjeen jakamis- tai kopiointitoimintoa käytettiin.',
                    ),
                ],
            ],
            [
                'title' => 'Ylläpitotyö',
                'description' => 'Saapuneet luvut kuvaavat uutta työmäärää. Käsitellyt luvut kertovat jakson aikana päätetyistä asioista.',
                'metrics' => [
                    $this->metric(
                        'Palautteita saapui',
                        $current['feedback_received'],
                        $previous['feedback_received'],
                        'Raportointijaksolla vastaanotetut uudet käyttäjäpalautteet.',
                    ),
                    $this->metric(
                        'Palautteita käsiteltiin',
                        $current['feedback_handled'],
                        $previous['feedback_handled'],
                        'Raportointijaksolla valmiiksi tai hylätyksi merkityt palautteet. Ne ovat voineet saapua jo aiemmalla jaksolla.',
                    ),
                    $this->metric(
                        'Linkki-ilmoituksia saapui',
                        $current['link_reports_received'],
                        $previous['link_reports_received'],
                        'Raportointijaksolla vastaanotetut ilmoitukset uusista, rikkinäisistä tai väärään paikkaan vievistä linkeistä.',
                    ),
                    $this->metric(
                        'Linkki-ilmoituksia käsiteltiin',
                        $current['link_reports_handled'],
                        $previous['link_reports_handled'],
                        'Raportointijaksolla hyväksytyiksi tai hylätyiksi merkityt linkki-ilmoitukset. Ne ovat voineet saapua jo aiemmalla jaksolla.',
                    ),
                ],
            ],
        ];

        $text = "SENIORIN ALOITUSSIVU – " . strtoupper($reportName) . "\n"
            . "Jakso: {$label}\n\n"
            . "Raportti kokoaa sivuston käytön, aloitussivuoppaan ja ylläpitotyön tapahtumat. Jokaisen luvun alla kerrotaan, mitä se tarkoittaa.\n"
            . $this->textMetricGroups($metricGroups)
            . sprintf(
                "\n\nNYKYINEN YLLÄPITOJONO\n- Avoimet palautteet: %d\n- Odottavat linkki-ilmoitukset: %d\nJono näyttää tällä hetkellä kesken olevat asiat riippumatta siitä, milloin ne saapuivat.",
                $current['feedback_backlog'],
                $current['link_backlog'],
            )
            . $this->textTopLists($current)
            . ($includeTrend ? $this->textTrend($current['trend']) : '')
            . "\n\nAvaa ylläpito: {$this->adminUrl()}"
            . "\n\nTIETOSUOJA JA TULKINTA\nLuvut ovat tunnisteettomia tapahtumakoosteita, eivät yksilöityjen käyttäjien määriä. Toistuvat sivulataukset ja avaukset lasketaan mukaan. Suora avaus on selaimen lähettämä luokittelusignaali, ei varma tieto aloitussivuasetuksesta.";

        $body = '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#e6f2f3;border-radius:10px">'
            . '<tr><td style="padding:18px 20px"><div style="font-size:13px;line-height:1.4;color:#4b6470;text-transform:uppercase;letter-spacing:.04em">Raportointijakso</div>'
            . '<div style="font-size:24px;line-height:1.25;font-weight:700;color:#103f4c;margin-top:3px">' . $this->escape($label) . '</div></td></tr></table>'
            . '<p style="margin:0 0 26px;color:#425d68">Raportti kokoaa sivuston käytön, aloitussivuoppaan ja ylläpitotyön tapahtumat. Jokaisen luvun yhteydessä kerrotaan, mitä se tarkoittaa.</p>'
            . $this->htmlMetricGroups($metricGroups)
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 8px;background:#fff7e8;border:1px solid #f1d18b;border-radius:10px">'
            . '<tr><td style="padding:20px"><div style="font-size:18px;line-height:1.3;font-weight:700;color:#563b05;margin-bottom:10px">Nykyinen ylläpitojono</div>'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'
            . sprintf(
                '<td width="50%%" style="padding:4px 14px 4px 0;vertical-align:top"><div style="font-size:28px;font-weight:700;color:#7a4d00">%d</div><div style="font-size:14px;color:#563b05">avointa palautetta</div></td>'
                . '<td width="50%%" style="padding:4px 0 4px 14px;vertical-align:top;border-left:1px solid #e8c978"><div style="font-size:28px;font-weight:700;color:#7a4d00">%d</div><div style="font-size:14px;color:#563b05">odottavaa linkki-ilmoitusta</div></td>',
                $current['feedback_backlog'],
                $current['link_backlog'],
            )
            . '</tr></table><p style="font-size:13px;line-height:1.5;color:#6c571f;margin:14px 0 0">Jono näyttää tällä hetkellä kesken olevat asiat riippumatta siitä, milloin ne saapuivat.</p></td></tr></table>'
            . $this->htmlTopLists($current)
            . ($includeTrend ? $this->htmlTrend($current['trend']) : '')
            . $this->button($this->adminUrl(), 'Avaa ylläpidon työtila')
            . $this->informationBox(
                'Tietosuoja ja tulkinta',
                'Luvut ovat tunnisteettomia tapahtumakoosteita, eivät yksilöityjen käyttäjien määriä. Toistuvat sivulataukset ja avaukset lasketaan mukaan. Suora avaus on selaimen lähettämä luokittelusignaali, ei varma tieto aloitussivuasetuksesta.',
            );

        return new MailMessage(
            sprintf('[Aloitussivu] %s – %s', $reportName, $label),
            $text,
            $this->htmlDocument(
                'Seniorin aloitussivu – ' . $reportName,
                $body,
                sprintf('%s %s: tärkeimmät käyttö- ja ylläpitoluvut selityksineen.', $reportName, $label),
            ),
        );
    }

    /** @return array<string, mixed> */
    private function periodStats(DateTimeImmutable $start, DateTimeImmutable $end, bool $details, bool $trend): array
    {
        $dateParameters = ['start_date' => $start->format('Y-m-d'), 'end_date' => $end->format('Y-m-d')];
        $utcParameters = [
            'feedback_created_start' => $start->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'feedback_created_end' => $end->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'feedback_handled_start' => $start->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'feedback_handled_end' => $end->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'link_created_start' => $start->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'link_created_end' => $end->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'link_handled_start' => $start->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
            'link_handled_end' => $end->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.u'),
        ];
        $totals = $this->database->fetchOne(
            'SELECT COALESCE(SUM(total_pageviews), 0) AS pageviews, '
            . 'COALESCE(SUM(total_link_clicks), 0) AS link_clicks FROM usage_daily '
            . 'WHERE usage_date >= :start_date AND usage_date < :end_date',
            $dateParameters,
        ) ?? [];
        $contextRows = $this->database->fetchAll(
            'SELECT dimension, bucket, COALESCE(SUM(count), 0) AS total FROM usage_context_daily '
            . 'WHERE usage_date >= :start_date AND usage_date < :end_date GROUP BY dimension, bucket',
            $dateParameters,
        );
        $context = [];
        foreach ($contextRows as $row) {
            $dimension = (string) ($row['dimension'] ?? '');
            $bucket = (string) ($row['bucket'] ?? '');
            $context[$dimension][$bucket] = (int) ($row['total'] ?? 0);
        }
        $operations = $this->database->fetchOne(
            'SELECT '
            . '(SELECT COUNT(*) FROM feedback_items WHERE created_at >= :feedback_created_start AND created_at < :feedback_created_end) AS feedback_received, '
            . "(SELECT COUNT(*) FROM feedback_items WHERE handled_at >= :feedback_handled_start AND handled_at < :feedback_handled_end AND status IN ('done', 'rejected')) AS feedback_handled, "
            . '(SELECT COUNT(*) FROM link_reports WHERE created_at >= :link_created_start AND created_at < :link_created_end) AS link_reports_received, '
            . "(SELECT COUNT(*) FROM link_reports WHERE reviewed_at >= :link_handled_start AND reviewed_at < :link_handled_end AND status IN ('approved', 'rejected')) AS link_reports_handled, "
            . "(SELECT COUNT(*) FROM feedback_items WHERE status IN ('new', 'triage', 'planned', 'in_progress')) AS feedback_backlog, "
            . "(SELECT COUNT(*) FROM link_reports WHERE status = 'pending') AS link_backlog",
            $utcParameters,
        ) ?? [];
        $result = [
            'pageviews' => (int) ($totals['pageviews'] ?? 0),
            'link_clicks' => (int) ($totals['link_clicks'] ?? 0),
            'direct' => (int) ($context['entry']['direct'] ?? 0),
            'entry_total' => array_sum($context['entry'] ?? []),
            'guide_opened' => (int) ($context['guide']['opened'] ?? 0),
            'guide_done' => (int) ($context['guide']['done'] ?? 0),
            'guide_shared' => array_sum(array_filter(
                $context['guide'] ?? [],
                static fn (string $bucket): bool => str_starts_with($bucket, 'shared:'),
                ARRAY_FILTER_USE_KEY,
            )),
            'feedback_received' => (int) ($operations['feedback_received'] ?? 0),
            'feedback_handled' => (int) ($operations['feedback_handled'] ?? 0),
            'link_reports_received' => (int) ($operations['link_reports_received'] ?? 0),
            'link_reports_handled' => (int) ($operations['link_reports_handled'] ?? 0),
            'feedback_backlog' => (int) ($operations['feedback_backlog'] ?? 0),
            'link_backlog' => (int) ($operations['link_backlog'] ?? 0),
            'pages' => [],
            'categories' => [],
            'links' => [],
            'trend' => [],
        ];
        if (!$details) {
            return $result;
        }
        $result['pages'] = $this->database->fetchAll(
            'SELECT page, SUM(count) AS total FROM usage_page_daily '
            . 'WHERE usage_date >= :start_date AND usage_date < :end_date '
            . 'GROUP BY page ORDER BY total DESC, page ASC LIMIT 5',
            $dateParameters,
        );
        $result['categories'] = $this->database->fetchAll(
            "SELECT CASE WHEN category = '' THEN 'Ei luokkaa' ELSE category END AS category, SUM(count) AS total "
            . 'FROM usage_link_daily WHERE usage_date >= :start_date AND usage_date < :end_date '
            . 'GROUP BY category ORDER BY total DESC, category ASC LIMIT 5',
            $dateParameters,
        );
        $result['links'] = $this->database->fetchAll(
            'SELECT url, label, category, SUM(count) AS total FROM usage_link_daily '
            . 'WHERE usage_date >= :start_date AND usage_date < :end_date '
            . 'GROUP BY url, label, category ORDER BY total DESC, label ASC LIMIT 5',
            $dateParameters,
        );
        if ($trend) {
            $result['trend'] = $this->database->fetchAll(
                "SELECT DATE_FORMAT(usage_date, '%Y-%m') AS month, "
                . 'SUM(total_pageviews) AS pageviews, SUM(total_link_clicks) AS link_clicks '
                . 'FROM usage_daily WHERE usage_date >= :start_date AND usage_date < :end_date '
                . 'GROUP BY month ORDER BY month ASC',
                $dateParameters,
            );
        }
        return $result;
    }

    /** @return array{name: string, value: int|float, previous: int|float, percent: bool, explanation: string} */
    private function metric(
        string $name,
        int|float $value,
        int|float $previous,
        string $explanation,
        bool $percent = false,
    ): array {
        return [
            'name' => $name,
            'value' => $value,
            'previous' => $previous,
            'percent' => $percent,
            'explanation' => $explanation,
        ];
    }

    /** @param list<array{title: string, description: string, metrics: list<array<string, mixed>>}> $groups */
    private function textMetricGroups(array $groups): string
    {
        $sections = [];
        foreach ($groups as $group) {
            $metrics = [];
            foreach ($group['metrics'] as $metric) {
                $metrics[] = sprintf(
                    "- %s: %s\n  Vertailu: %s\n  Edellinen jakso: %s\n  Mitä luku tarkoittaa: %s",
                    (string) $metric['name'],
                    $this->metricValue($metric),
                    $this->metricChange($metric),
                    $this->metricPreviousValue($metric),
                    (string) $metric['explanation'],
                );
            }
            $sections[] = strtoupper($group['title']) . "\n" . $group['description'] . "\n\n" . implode("\n\n", $metrics);
        }
        return "\n\n" . implode("\n\n", $sections);
    }

    /** @param list<array{title: string, description: string, metrics: list<array<string, mixed>>}> $groups */
    private function htmlMetricGroups(array $groups): string
    {
        $sections = [];
        foreach ($groups as $group) {
            $cards = array_map(fn (array $metric): string => $this->htmlMetricCard($metric), $group['metrics']);
            $sections[] = '<div style="margin:30px 0 12px">'
                . '<h2 style="font-size:21px;line-height:1.3;color:#103f4c;margin:0 0 5px">' . $this->escape($group['title']) . '</h2>'
                . '<p style="font-size:14px;line-height:1.55;color:#526773;margin:0 0 14px">' . $this->escape($group['description']) . '</p>'
                . implode('', $cards) . '</div>';
        }
        return implode('', $sections);
    }

    /** @param array<string, mixed> $metric */
    private function htmlMetricCard(array $metric): string
    {
        return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;border:1px solid #d9e4e8;border-radius:10px;background:#ffffff">'
            . '<tr><td style="padding:18px 20px">'
            . '<div style="font-size:14px;line-height:1.4;font-weight:700;color:#344f5a;margin-bottom:5px">' . $this->escape((string) $metric['name']) . '</div>'
            . '<div style="font-size:30px;line-height:1.15;font-weight:700;color:#0b5e6b;margin-bottom:7px">' . $this->escape($this->metricValue($metric)) . '</div>'
            . '<div style="font-size:14px;line-height:1.5;color:#36545f;margin-bottom:10px">' . $this->escape($this->metricChange($metric))
            . ' <span style="color:#71838b">· Edellinen jakso: ' . $this->escape($this->metricPreviousValue($metric)) . '</span></div>'
            . '<div style="padding-top:10px;border-top:1px solid #e8eef0;font-size:13px;line-height:1.55;color:#526773"><strong style="color:#344f5a">Mitä luku tarkoittaa:</strong> '
            . $this->escape((string) $metric['explanation']) . '</div>'
            . '</td></tr></table>';
    }

    /** @param array<string, mixed> $metric */
    private function metricValue(array $metric): string
    {
        return (bool) ($metric['percent'] ?? false)
            ? $this->formatPercent((float) $metric['value'])
            : number_format((int) $metric['value'], 0, ',', ' ');
    }

    /** @param array<string, mixed> $metric */
    private function metricPreviousValue(array $metric): string
    {
        return (bool) ($metric['percent'] ?? false)
            ? $this->formatPercent((float) $metric['previous'])
            : number_format((int) $metric['previous'], 0, ',', ' ');
    }

    /** @param array<string, mixed> $metric */
    private function metricChange(array $metric): string
    {
        return (bool) ($metric['percent'] ?? false)
            ? $this->percentagePointChange((float) $metric['value'], (float) $metric['previous'])
            : $this->relativeChange((int) $metric['value'], (int) $metric['previous']);
    }

    /** @param array<string, mixed> $stats */
    private function textTopLists(array $stats): string
    {
        return "\n\nSUOSITUIMMAT SIVUT\nSivut, joille kirjautui eniten latauksia. Luvut eivät tarkoita eri käyttäjien määriä.\n"
            . $this->textList($stats['pages'], 'page')
            . "\n\nSUOSITUIMMAT LINKKILUOKAT\nPalvelulinkkien avaukset ryhmiteltynä linkkiluokan mukaan.\n"
            . $this->textList($stats['categories'], 'category')
            . "\n\nSUOSITUIMMAT LINKIT\nYksittäiset palvelulinkit, joita avattiin eniten.\n"
            . $this->textList($stats['links'], 'label');
    }

    /** @param array<string, mixed> $stats */
    private function htmlTopLists(array $stats): string
    {
        return '<div style="margin:30px 0 12px"><h2 style="font-size:21px;line-height:1.3;color:#103f4c;margin:0 0 14px">Mitä käytettiin eniten?</h2>'
            . $this->htmlRanking(
                'Suosituimmat sivut',
                'Sivut, joille kirjautui eniten latauksia. Luvut eivät tarkoita eri käyttäjien määriä.',
                $stats['pages'],
                'page',
            )
            . $this->htmlRanking(
                'Suosituimmat linkkiluokat',
                'Palvelulinkkien avaukset ryhmiteltynä linkkiluokan mukaan.',
                $stats['categories'],
                'category',
            )
            . $this->htmlRanking(
                'Suosituimmat linkit',
                'Yksittäiset palvelulinkit, joita avattiin eniten.',
                $stats['links'],
                'label',
            )
            . '</div>';
    }

    /** @param list<array<string, mixed>> $rows */
    private function textList(array $rows, string $labelKey): string
    {
        if ($rows === []) {
            return '- Ei tietoja';
        }
        return implode("\n", array_map(static fn (array $row): string => sprintf(
            '- %s: %d',
            (string) ($row[$labelKey] ?? ''),
            (int) ($row['total'] ?? 0),
        ), $rows));
    }

    /** @param list<array<string, mixed>> $rows */
    private function htmlList(array $rows, string $labelKey): string
    {
        if ($rows === []) {
            return '<p style="font-size:14px;color:#71838b;margin:10px 0 0">Ei tietoja tältä jaksolta.</p>';
        }
        $items = array_map(fn (array $row): string => '<li style="margin:0 0 7px;padding-left:3px">'
            . $this->escape((string) ($row[$labelKey] ?? '')) . ' <strong style="white-space:nowrap">(' . number_format((int) ($row['total'] ?? 0), 0, ',', ' ') . ')</strong></li>', $rows);
        return '<ol style="font-size:14px;line-height:1.5;color:#344f5a;margin:12px 0 0;padding-left:24px">' . implode('', $items) . '</ol>';
    }

    /** @param list<array<string, mixed>> $rows */
    private function htmlRanking(string $title, string $description, array $rows, string $labelKey): string
    {
        return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;background:#f6f9fa;border-radius:10px">'
            . '<tr><td style="padding:18px 20px"><div style="font-size:16px;line-height:1.3;font-weight:700;color:#244955">' . $this->escape($title) . '</div>'
            . '<div style="font-size:13px;line-height:1.5;color:#60757e;margin-top:4px">' . $this->escape($description) . '</div>'
            . $this->htmlList($rows, $labelKey) . '</td></tr></table>';
    }

    /** @param list<array<string, mixed>> $rows */
    private function textTrend(array $rows): string
    {
        if ($rows === []) {
            return '';
        }
        return "\n\nKuukausitrendi:\n" . implode("\n", array_map(static fn (array $row): string => sprintf(
            '- %s: %d sivulatausta, %d linkin avausta',
            (string) ($row['month'] ?? ''),
            (int) ($row['pageviews'] ?? 0),
            (int) ($row['link_clicks'] ?? 0),
        ), $rows));
    }

    /** @param list<array<string, mixed>> $rows */
    private function htmlTrend(array $rows): string
    {
        if ($rows === []) {
            return '';
        }
        $items = array_map(fn (array $row): string => '<tr>'
            . '<th scope="row" style="text-align:left;padding:10px 8px;border-top:1px solid #dfe8eb;color:#344f5a">' . $this->escape((string) ($row['month'] ?? '')) . '</th>'
            . '<td style="text-align:right;padding:10px 8px;border-top:1px solid #dfe8eb;color:#344f5a">' . number_format((int) ($row['pageviews'] ?? 0), 0, ',', ' ') . '</td>'
            . '<td style="text-align:right;padding:10px 8px;border-top:1px solid #dfe8eb;color:#344f5a">' . number_format((int) ($row['link_clicks'] ?? 0), 0, ',', ' ') . '</td></tr>', $rows);
        return '<div style="margin:30px 0 12px"><h2 style="font-size:21px;line-height:1.3;color:#103f4c;margin:0 0 5px">Kuukausitrendi</h2>'
            . '<p style="font-size:14px;line-height:1.55;color:#526773;margin:0 0 12px">Kvartaalin sivulataukset ja linkkien avaukset kuukausittain.</p>'
            . '<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px">'
            . '<thead><tr><th style="text-align:left;padding:9px 8px;background:#e6f2f3;color:#244955">Kuukausi</th>'
            . '<th style="text-align:right;padding:9px 8px;background:#e6f2f3;color:#244955">Sivulataukset</th>'
            . '<th style="text-align:right;padding:9px 8px;background:#e6f2f3;color:#244955">Linkkien avaukset</th></tr></thead><tbody>'
            . implode('', $items) . '</tbody></table></div>';
    }

    private function percent(int $part, int $total): float
    {
        return $total > 0 ? 100 * $part / $total : 0.0;
    }

    private function formatPercent(float $value): string
    {
        return number_format($value, 1, ',', ' ') . ' %';
    }

    private function relativeChange(int $current, int $previous): string
    {
        if ($previous === 0) {
            return $current === 0
                ? 'sama kuin edellisellä jaksolla'
                : 'ei vertailuarvoa (edellisellä jaksolla 0)';
        }
        $change = 100 * ($current - $previous) / $previous;
        if (abs($change) < 0.05) {
            return 'sama kuin edellisellä jaksolla';
        }
        return number_format(abs($change), 1, ',', ' ') . ' % '
            . ($change > 0 ? 'enemmän' : 'vähemmän') . ' kuin edellisellä jaksolla';
    }

    private function percentagePointChange(float $current, float $previous): string
    {
        $change = $current - $previous;
        if (abs($change) < 0.05) {
            return 'sama kuin edellisellä jaksolla';
        }
        return number_format(abs($change), 1, ',', ' ') . ' prosenttiyksikköä '
            . ($change > 0 ? 'suurempi' : 'pienempi') . ' kuin edellisellä jaksolla';
    }

    private function oldestAgeDays(mixed $value, DateTimeImmutable $now): ?int
    {
        $oldest = $this->parseUtc($value);
        if ($oldest === null) {
            return null;
        }
        return max(0, (int) $oldest->diff($now)->format('%a'));
    }

    private function parseUtc(mixed $value): ?DateTimeImmutable
    {
        if (!is_string($value) || $value === '') {
            return null;
        }
        try {
            return new DateTimeImmutable($value, new DateTimeZone('UTC'));
        } catch (\Throwable) {
            return null;
        }
    }

    private function adminUrl(): string
    {
        return $this->config->origin . $this->config->basePath . '/yllapito.html';
    }

    private function button(string $url, string $label): string
    {
        return '<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0"><tr><td style="border-radius:7px;background:#0b6573">'
            . '<a style="display:inline-block;padding:13px 20px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:7px" href="'
            . $this->escape($url) . '">' . $this->escape($label) . '</a></td></tr></table>';
    }

    /** @param array{name: string, value: string, detail: string, explanation: string, attention: bool} $item */
    private function maintenanceCard(array $item): string
    {
        $status = $item['attention'] ? 'Vaatii huomiota' : 'Kunnossa';
        $background = $item['attention'] ? '#fff7e8' : '#edf7f1';
        $border = $item['attention'] ? '#f1d18b' : '#b9ddc7';
        $accent = $item['attention'] ? '#7a4d00' : '#28653f';
        return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;background:' . $background . ';border:1px solid ' . $border . ';border-radius:10px">'
            . '<tr><td style="padding:18px 20px">'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>'
            . '<td style="vertical-align:top;padding-right:14px"><div style="font-size:16px;line-height:1.35;font-weight:700;color:#244955">' . $this->escape($item['name']) . '</div>'
            . '<div style="display:inline-block;margin-top:6px;padding:3px 8px;border:1px solid ' . $border . ';border-radius:20px;font-size:12px;font-weight:700;color:' . $accent . '">' . $status . '</div></td>'
            . '<td style="width:92px;text-align:right;vertical-align:top;font-size:29px;line-height:1.1;font-weight:700;color:' . $accent . '">' . $this->escape($item['value']) . '</td>'
            . '</tr></table>'
            . '<p style="font-size:14px;line-height:1.5;color:#405a64;margin:13px 0 8px">' . $this->escape($item['detail']) . '</p>'
            . '<p style="font-size:13px;line-height:1.55;color:#60757e;margin:0;padding-top:9px;border-top:1px solid ' . $border . '"><strong style="color:#405a64">Mitä tämä tarkoittaa:</strong> '
            . $this->escape($item['explanation']) . '</p></td></tr></table>';
    }

    private function informationBox(string $title, string $text): string
    {
        return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0 0;background:#f3f6f7;border-left:4px solid #7c949d">'
            . '<tr><td style="padding:15px 17px"><div style="font-size:14px;font-weight:700;color:#344f5a;margin-bottom:4px">' . $this->escape($title) . '</div>'
            . '<div style="font-size:13px;line-height:1.55;color:#60757e">' . $this->escape($text) . '</div></td></tr></table>';
    }

    private function htmlDocument(string $title, string $body, string $preheader = ''): string
    {
        return '<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            . '<title>' . $this->escape($title) . '</title><style>@media only screen and (max-width:620px){.email-shell{width:100%!important}.email-pad{padding:24px 18px!important}.email-head{padding:24px 18px!important}h1{font-size:25px!important}}</style></head>'
            . '<body style="margin:0;padding:0;background:#eef3f5;font-family:Arial,Helvetica,sans-serif;color:#243f4a;line-height:1.5;-webkit-text-size-adjust:100%">'
            . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' . $this->escape($preheader) . '</div>'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f5"><tr><td align="center" style="padding:24px 10px">'
            . '<table role="presentation" width="680" cellspacing="0" cellpadding="0" class="email-shell" style="width:680px;max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(20,52,63,.08)">'
            . '<tr><td class="email-head" style="padding:30px 36px;background:#104f5d;color:#ffffff">'
            . '<div style="font-size:12px;line-height:1.4;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#cce5e9;margin-bottom:8px">SeniorSurf</div>'
            . '<h1 style="font-size:29px;line-height:1.25;margin:0;color:#ffffff">' . $this->escape($title) . '</h1></td></tr>'
            . '<tr><td class="email-pad" style="padding:30px 36px 36px">' . $body . '</td></tr>'
            . '<tr><td style="padding:18px 36px;background:#e3ecef;font-size:12px;line-height:1.5;color:#60757e">Automaattinen viesti Seniorin aloitussivun ylläpidosta. Tähän viestiin ei tarvitse vastata.</td></tr>'
            . '</table></td></tr></table></body></html>';
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
