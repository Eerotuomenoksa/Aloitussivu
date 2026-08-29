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

        $items = [
            sprintf('Avoimia palautteita: %d%s', $feedback, $this->oldestSuffix($row['feedback_oldest'] ?? null, $utcNow)),
            sprintf('Odottavia linkki-ilmoituksia: %d%s', $links, $this->oldestSuffix($row['links_oldest'] ?? null, $utcNow)),
            sprintf('Seitsemän päivän sisällä vanhenevia huijausvaroituksia: %d', $alerts),
            $ncscStale
                ? 'NCSC-tausta-ajo vaatii tarkistuksen: viimeisin onnistunut tai kirjattu ajo on yli kaksi vuorokautta vanha.'
                : 'NCSC-tausta-ajon viimeisin kirjaus: ' . $lastNcsc?->setTimezone(new DateTimeZone('Europe/Helsinki'))->format('d.m.Y H.i'),
        ];
        $adminUrl = $this->adminUrl();
        $subject = sprintf('[Aloitussivu] Ylläpitokooste %s', $now->setTimezone(new DateTimeZone('Europe/Helsinki'))->format('d.m.Y'));
        $text = "Seniorin aloitussivun ylläpitokooste\n\n- " . implode("\n- ", $items)
            . "\n\nAvaa ylläpito: {$adminUrl}\n\nViestissä on vain lukumääriä ja aikaleimoja, ei käyttäjien palautetekstejä.";
        $html = $this->htmlDocument(
            'Seniorin aloitussivun ylläpitokooste',
            '<ul><li>' . implode('</li><li>', array_map($this->escape(...), $items)) . '</li></ul>'
            . $this->button($adminUrl, 'Avaa ylläpito')
            . '<p><small>Viestissä on vain lukumääriä ja aikaleimoja, ei käyttäjien palautetekstejä.</small></p>',
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
        $summary = [
            ['Sivulataukset', $current['pageviews'], $previous['pageviews']],
            ['Linkkien avaukset', $current['link_clicks'], $previous['link_clicks']],
            ['Suoran avauksen osuus', $this->percent($current['direct'], $current['entry_total']), $this->percent($previous['direct'], $previous['entry_total']), true],
            ['Ohje avattu', $current['guide_opened'], $previous['guide_opened']],
            ['Ohje suoritettu', $current['guide_done'], $previous['guide_done']],
            ['Ohjeen suoritusaste', $this->percent($current['guide_done'], $current['guide_opened']), $this->percent($previous['guide_done'], $previous['guide_opened']), true],
            ['Ohje jaettu', $current['guide_shared'], $previous['guide_shared']],
            ['Palautteita saapui', $current['feedback_received'], $previous['feedback_received']],
            ['Palautteita käsiteltiin', $current['feedback_handled'], $previous['feedback_handled']],
            ['Linkki-ilmoituksia saapui', $current['link_reports_received'], $previous['link_reports_received']],
            ['Linkki-ilmoituksia käsiteltiin', $current['link_reports_handled'], $previous['link_reports_handled']],
        ];

        $textRows = [];
        $htmlRows = [];
        foreach ($summary as $row) {
            [$name, $value, $comparison] = $row;
            $isPercent = (bool) ($row[3] ?? false);
            $display = $isPercent ? $this->formatPercent((float) $value) : number_format((int) $value, 0, ',', ' ');
            $change = $isPercent
                ? $this->percentagePointChange((float) $value, (float) $comparison)
                : $this->relativeChange((int) $value, (int) $comparison);
            $textRows[] = sprintf('%s: %s (%s)', $name, $display, $change);
            $htmlRows[] = '<tr><th>' . $this->escape($name) . '</th><td>' . $this->escape($display)
                . '</td><td>' . $this->escape($change) . '</td></tr>';
        }

        $text = "Seniorin aloitussivu – {$reportName}\nJakso: {$label}\n\n" . implode("\n", $textRows)
            . sprintf("\n\nNykyinen ylläpitojono: %d avointa palautetta, %d odottavaa linkki-ilmoitusta.", $current['feedback_backlog'], $current['link_backlog'])
            . $this->textTopLists($current)
            . ($includeTrend ? $this->textTrend($current['trend']) : '')
            . "\n\nAvaa ylläpito: {$this->adminUrl()}"
            . "\n\nHuom: luvut ovat tunnisteettomia tapahtumakoosteita, eivät yksilöityjä käyttäjiä. Suora avaus on selaimen lähettämä luokittelusignaali, ei varma tieto aloitussivuasetuksesta.";

        $body = '<p><strong>Jakso:</strong> ' . $this->escape($label) . '</p>'
            . '<table><thead><tr><th>Mittari</th><th>Jakso</th><th>Muutos edelliseen</th></tr></thead><tbody>'
            . implode('', $htmlRows) . '</tbody></table>'
            . sprintf(
                '<p><strong>Nykyinen ylläpitojono:</strong> %d avointa palautetta, %d odottavaa linkki-ilmoitusta.</p>',
                $current['feedback_backlog'],
                $current['link_backlog'],
            )
            . $this->htmlTopLists($current)
            . ($includeTrend ? $this->htmlTrend($current['trend']) : '')
            . $this->button($this->adminUrl(), 'Avaa ylläpito')
            . '<p><small>Luvut ovat tunnisteettomia tapahtumakoosteita, eivät yksilöityjä käyttäjiä. Suora avaus on selaimen lähettämä luokittelusignaali, ei varma tieto aloitussivuasetuksesta.</small></p>';

        return new MailMessage(
            sprintf('[Aloitussivu] %s – %s', $reportName, $label),
            $text,
            $this->htmlDocument('Seniorin aloitussivu – ' . $reportName, $body),
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

    /** @param array<string, mixed> $stats */
    private function textTopLists(array $stats): string
    {
        return "\n\nSuosituimmat sivut:\n" . $this->textList($stats['pages'], 'page')
            . "\n\nSuosituimmat linkkiluokat:\n" . $this->textList($stats['categories'], 'category')
            . "\n\nSuosituimmat linkit:\n" . $this->textList($stats['links'], 'label');
    }

    /** @param array<string, mixed> $stats */
    private function htmlTopLists(array $stats): string
    {
        return '<h2>Suosituimmat sivut</h2>' . $this->htmlList($stats['pages'], 'page')
            . '<h2>Suosituimmat linkkiluokat</h2>' . $this->htmlList($stats['categories'], 'category')
            . '<h2>Suosituimmat linkit</h2>' . $this->htmlList($stats['links'], 'label');
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
            return '<p>Ei tietoja.</p>';
        }
        $items = array_map(fn (array $row): string => '<li>'
            . $this->escape((string) ($row[$labelKey] ?? '')) . ': ' . (int) ($row['total'] ?? 0) . '</li>', $rows);
        return '<ol>' . implode('', $items) . '</ol>';
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
        $items = array_map(fn (array $row): string => '<li>'
            . $this->escape((string) ($row['month'] ?? '')) . ': ' . (int) ($row['pageviews'] ?? 0)
            . ' sivulatausta, ' . (int) ($row['link_clicks'] ?? 0) . ' linkin avausta</li>', $rows);
        return '<h2>Kuukausitrendi</h2><ul>' . implode('', $items) . '</ul>';
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
            return $current === 0 ? 'ei muutosta' : 'uusi vertailujaksoon nähden';
        }
        $change = 100 * ($current - $previous) / $previous;
        return sprintf('%+.1f %%', $change);
    }

    private function percentagePointChange(float $current, float $previous): string
    {
        return sprintf('%+.1f prosenttiyksikköä', $current - $previous);
    }

    private function oldestSuffix(mixed $value, DateTimeImmutable $now): string
    {
        $oldest = $this->parseUtc($value);
        if ($oldest === null) {
            return '';
        }
        return sprintf(' (vanhin %d vrk)', max(0, (int) $oldest->diff($now)->format('%a')));
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
        return '<p><a style="display:inline-block;padding:12px 18px;background:#075985;color:#fff;text-decoration:none;border-radius:6px" href="'
            . $this->escape($url) . '">' . $this->escape($label) . '</a></p>';
    }

    private function htmlDocument(string $title, string $body): string
    {
        return '<!doctype html><html lang="fi"><head><meta charset="utf-8"><title>' . $this->escape($title)
            . '</title></head><body style="font-family:Arial,sans-serif;color:#17202a;line-height:1.5;max-width:760px;margin:0 auto">'
            . '<h1>' . $this->escape($title) . '</h1>' . $body . '</body></html>';
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
