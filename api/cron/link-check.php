<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

$apiRoot = getenv('ALOITUSSIVU_API_ROOT') ?: dirname(__DIR__);
require $apiRoot . '/bootstrap.php';

use Aloitussivu\Api\CronRuntime;
use Aloitussivu\Api\HttpLinkChecker;
use Aloitussivu\Api\LazyPdoDatabase;
use Aloitussivu\Api\LinkCatalog;
use Aloitussivu\Api\LinkCheckJob;

try {
    $startedAt = new DateTimeImmutable('now', new DateTimeZone('UTC'));
    $config = CronRuntime::loadConfig($apiRoot);
    $database = new LazyPdoDatabase($config);
    $result = (new LinkCheckJob(
        $database,
        $config,
        LinkCatalog::load($apiRoot . '/data/link-catalog.json'),
        new HttpLinkChecker($config->linkCheckTimeoutSeconds),
    ))->run($startedAt);
    echo json_encode([
        ...$result,
        'runAtUtc' => $startedAt->format(DATE_ATOM),
        'runAtHelsinki' => $startedAt->setTimezone(new DateTimeZone('Europe/Helsinki'))->format(DATE_ATOM),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit($result['status'] === 'failed' ? 1 : 0);
} catch (Throwable) {
    fwrite(STDERR, "Link check background job failed before execution.\n");
    exit(1);
}
