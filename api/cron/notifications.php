<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

$apiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: dirname(__DIR__);
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\CronRuntime;
use Aloitussivu\Api\LazyPdoDatabase;
use Aloitussivu\Api\NotificationJob;
use Aloitussivu\Api\NotificationOutbox;
use Aloitussivu\Api\NotificationReportBuilder;

try {
    $startedAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $config = CronRuntime::loadConfig($apiRoot);
    $database = new LazyPdoDatabase($config);
    $result = (new NotificationJob(
        $config,
        new NotificationReportBuilder($database, $config),
        new NotificationOutbox($database),
    ))->run($startedAt);
    echo json_encode([
        ...$result,
        'runAtUtc' => $startedAt->format(DATE_ATOM),
        'runAtHelsinki' => $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format(DATE_ATOM),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit(0);
} catch (Throwable) {
    fwrite(STDERR, "Notification generation failed.\n");
    exit(1);
}
