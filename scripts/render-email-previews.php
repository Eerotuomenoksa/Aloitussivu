<?php

declare(strict_types=1);

require dirname(__DIR__) . '/api/bootstrap.php';

use Aloitussivu\Api\Config;
use Aloitussivu\Api\DatabaseConnection;
use Aloitussivu\Api\MailMessage;
use Aloitussivu\Api\NotificationReportBuilder;

final class EmailPreviewDatabase implements DatabaseConnection
{
    /** @param list<array<string, mixed>|null> $fetchOneResults @param list<list<array<string, mixed>>> $fetchAllResults */
    public function __construct(
        private array $fetchOneResults,
        private array $fetchAllResults = [],
    ) {
    }

    public function health(): void
    {
    }

    public function fetchOne(string $sql, array $parameters = []): ?array
    {
        return $this->fetchOneResults === [] ? null : array_shift($this->fetchOneResults);
    }

    public function fetchAll(string $sql, array $parameters = []): array
    {
        return $this->fetchAllResults === [] ? [] : array_shift($this->fetchAllResults);
    }

    public function execute(string $sql, array $parameters = []): int
    {
        return 0;
    }

    public function transaction(callable $callback): mixed
    {
        return $callback($this);
    }
}

function previewConfig(): Config
{
    $temporaryRoot = dirname(__DIR__) . '/.tmp/email-previews';
    return Config::fromArray([
        'app' => [
            'environment' => 'testing',
            'origin' => 'https://seniorsurf.fi',
            'base_path' => '/aloitus',
            'require_https' => true,
            'max_body_bytes' => 4096,
        ],
        'database' => [
            'dsn' => 'sqlite::memory:',
            'username' => '',
            'password' => '',
        ],
        'logging' => ['path' => $temporaryRoot . '/preview.log'],
        'attachments' => ['path' => $temporaryRoot . '/attachments'],
        'security' => ['rate_limit_secret' => str_repeat('p', 32)],
        'authentication' => [
            'firebase_project_id' => 'preview-firebase-project',
            'public_key_cache_path' => $temporaryRoot . '/firebase-keys.json',
        ],
    ], dirname(__DIR__) . '/api/public');
}

function maintenancePreview(Config $config): MailMessage
{
    $database = new EmailPreviewDatabase([[
        'feedback_open' => 7,
        'feedback_oldest' => '2026-08-21 06:30:00',
        'links_pending' => 3,
        'links_oldest' => '2026-08-26 11:45:00',
        'alerts_expiring' => 2,
        'ncsc_last_run' => '2026-08-29 08:49:02',
    ]]);
    return (new NotificationReportBuilder($database, $config))
        ->maintenanceDigest(new DateTimeImmutable('2026-08-29T13:50:00+03:00'));
}

function monthlyPreview(Config $config): MailMessage
{
    $database = new EmailPreviewDatabase(
        [
            ['pageviews' => 1842, 'link_clicks' => 736],
            [
                'feedback_received' => 18,
                'feedback_handled' => 15,
                'link_reports_received' => 9,
                'link_reports_handled' => 8,
                'feedback_backlog' => 7,
                'link_backlog' => 3,
            ],
            ['pageviews' => 1574, 'link_clicks' => 802],
            [
                'feedback_received' => 21,
                'feedback_handled' => 19,
                'link_reports_received' => 7,
                'link_reports_handled' => 6,
                'feedback_backlog' => 7,
                'link_backlog' => 3,
            ],
        ],
        [
            [
                ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 1180],
                ['dimension' => 'entry', 'bucket' => 'search', 'total' => 420],
                ['dimension' => 'entry', 'bucket' => 'referral', 'total' => 242],
                ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 96],
                ['dimension' => 'guide', 'bucket' => 'done', 'total' => 61],
                ['dimension' => 'guide', 'bucket' => 'shared:copy', 'total' => 22],
                ['dimension' => 'guide', 'bucket' => 'shared:native', 'total' => 8],
            ],
            [
                ['page' => '/', 'total' => 1120],
                ['page' => '/linkit.html', 'total' => 388],
                ['page' => '/aloitussivuksi.html', 'total' => 211],
                ['page' => '/ehdotukset.html', 'total' => 76],
            ],
            [
                ['category' => 'Terveys ja hyvinvointi', 'total' => 221],
                ['category' => 'Pankki ja raha-asiat', 'total' => 184],
                ['category' => 'Julkiset palvelut', 'total' => 147],
                ['category' => 'Uutiset', 'total' => 96],
            ],
            [
                ['label' => 'Omakanta', 'total' => 138],
                ['label' => 'Suomi.fi', 'total' => 116],
                ['label' => 'Yle Uutiset', 'total' => 84],
                ['label' => 'Kela', 'total' => 79],
            ],
            [
                ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 920],
                ['dimension' => 'entry', 'bucket' => 'search', 'total' => 410],
                ['dimension' => 'entry', 'bucket' => 'referral', 'total' => 244],
                ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 81],
                ['dimension' => 'guide', 'bucket' => 'done', 'total' => 48],
                ['dimension' => 'guide', 'bucket' => 'shared:copy', 'total' => 18],
            ],
        ],
    );
    return (new NotificationReportBuilder($database, $config))
        ->monthlyReport(new DateTimeImmutable('2026-07-01T00:00:00+03:00'));
}

function quarterlyPreview(Config $config): MailMessage
{
    $database = new EmailPreviewDatabase(
        [
            ['pageviews' => 5028, 'link_clicks' => 2184],
            [
                'feedback_received' => 52,
                'feedback_handled' => 49,
                'link_reports_received' => 24,
                'link_reports_handled' => 22,
                'feedback_backlog' => 7,
                'link_backlog' => 3,
            ],
            ['pageviews' => 4630, 'link_clicks' => 2010],
            [
                'feedback_received' => 47,
                'feedback_handled' => 43,
                'link_reports_received' => 29,
                'link_reports_handled' => 25,
                'feedback_backlog' => 7,
                'link_backlog' => 3,
            ],
        ],
        [
            [
                ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 3180],
                ['dimension' => 'entry', 'bucket' => 'search', 'total' => 1220],
                ['dimension' => 'entry', 'bucket' => 'referral', 'total' => 628],
                ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 274],
                ['dimension' => 'guide', 'bucket' => 'done', 'total' => 181],
                ['dimension' => 'guide', 'bucket' => 'shared:copy', 'total' => 64],
            ],
            [['page' => '/', 'total' => 3014], ['page' => '/linkit.html', 'total' => 1095]],
            [['category' => 'Terveys ja hyvinvointi', 'total' => 643], ['category' => 'Julkiset palvelut', 'total' => 451]],
            [['label' => 'Omakanta', 'total' => 402], ['label' => 'Suomi.fi', 'total' => 367]],
            [
                ['month' => '2026-04', 'pageviews' => 1540, 'link_clicks' => 674],
                ['month' => '2026-05', 'pageviews' => 1662, 'link_clicks' => 711],
                ['month' => '2026-06', 'pageviews' => 1826, 'link_clicks' => 799],
            ],
            [
                ['dimension' => 'entry', 'bucket' => 'direct', 'total' => 2740],
                ['dimension' => 'entry', 'bucket' => 'search', 'total' => 1260],
                ['dimension' => 'entry', 'bucket' => 'referral', 'total' => 630],
                ['dimension' => 'guide', 'bucket' => 'opened', 'total' => 239],
                ['dimension' => 'guide', 'bucket' => 'done', 'total' => 147],
                ['dimension' => 'guide', 'bucket' => 'shared:copy', 'total' => 58],
            ],
        ],
    );
    return (new NotificationReportBuilder($database, $config))
        ->quarterlyReport(new DateTimeImmutable('2026-04-01T00:00:00+03:00'));
}

$outputRoot = $argv[1] ?? dirname(__DIR__) . '/.tmp/email-previews';
if (!is_dir($outputRoot) && !mkdir($outputRoot, 0775, true) && !is_dir($outputRoot)) {
    throw new RuntimeException('Preview output directory could not be created.');
}

$config = previewConfig();
$messages = [
    'maintenance' => maintenancePreview($config),
    'monthly' => monthlyPreview($config),
    'quarterly' => quarterlyPreview($config),
];
foreach ($messages as $name => $message) {
    file_put_contents($outputRoot . '/' . $name . '.html', $message->htmlBody);
    file_put_contents($outputRoot . '/' . $name . '.txt', "Aihe: {$message->subject}\n\n{$message->textBody}\n");
}

echo sprintf("Rendered %d email previews to %s%s", count($messages), realpath($outputRoot), PHP_EOL);
